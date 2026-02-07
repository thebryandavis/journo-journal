// Deepgram Transcription Service for Journo Journal

import { TranscriptSegment } from '@/lib/types';

interface TranscriptionResult {
  transcript: string;
  segments: TranscriptSegment[];
  formattedHtml: string;
  speakers: number;
  duration: number;
  confidence: number;
}

class DeepgramService {
  private apiKey: string;
  private baseURL = 'https://api.deepgram.com/v1';

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || '';
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    contentType: string,
    options: {
      language?: string;
      diarize?: boolean;
      smartFormat?: boolean;
      paragraphs?: boolean;
    } = {}
  ): Promise<TranscriptionResult> {
    const params = new URLSearchParams({
      model: 'nova-2',
      smart_format: String(options.smartFormat ?? true),
      diarize: String(options.diarize ?? true),
      paragraphs: String(options.paragraphs ?? true),
      punctuate: 'true',
      utterances: 'true',
      language: options.language || 'en',
    });

    const response = await fetch(
      `${this.baseURL}/listen?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': contentType,
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Deepgram API error: ${error.err_msg || error.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return this.formatResponse(data);
  }

  private formatResponse(data: any): TranscriptionResult {
    const channel = data.results.channels[0];
    const alternative = channel.alternatives[0];
    const paragraphs = alternative.paragraphs?.paragraphs || [];
    const words = alternative.words || [];

    const segments: TranscriptSegment[] = paragraphs.map(
      (p: any) => ({
        speaker: p.speaker,
        text: p.sentences.map((s: any) => s.text).join(' '),
        start: p.start,
        end: p.end,
        confidence: alternative.confidence,
      })
    );

    const speakerSet = new Set(segments.map((s) => s.speaker));
    const formattedHtml = this.buildTranscriptHtml(segments);
    const duration = data.metadata?.duration
      || (words.length > 0 ? words[words.length - 1].end : 0);

    return {
      transcript: alternative.transcript,
      segments,
      formattedHtml,
      speakers: speakerSet.size,
      duration,
      confidence: alternative.confidence,
    };
  }

  private buildTranscriptHtml(segments: TranscriptSegment[]): string {
    return segments
      .map((seg) => {
        const timestamp = this.formatTimestamp(seg.start);
        return `<p><strong>[Speaker ${seg.speaker + 1} - ${timestamp}]</strong> ${seg.text}</p>`;
      })
      .join('\n');
  }

  private formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export const deepgram = new DeepgramService();
