// OpenAI Integration for Journo Journal

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async createChatCompletion(messages: OpenAIMessage[], options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  async createEmbedding(text: string) {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  // Auto-tag content based on title and content
  async generateTags(title: string, content: string, maxTags: number = 5): Promise<string[]> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a journalist's assistant. Generate relevant tags for news articles and research notes.
        Return ONLY a comma-separated list of ${maxTags} tags, no explanations.
        Tags should be: concise, relevant, journalistic, and useful for organization.
        Focus on: topics, themes, locations, people, organizations, story types.`,
      },
      {
        role: 'user',
        content: `Title: ${title}\n\nContent: ${content.slice(0, 1000)}`,
      },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.5,
      max_tokens: 100,
    });

    const tagsText = response.choices[0].message.content.trim();
    return tagsText
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .slice(0, maxTags);
  }

  // Summarize content
  async summarize(title: string, content: string, maxLength: number = 150): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a journalist's assistant. Create concise, accurate summaries of articles and notes.
        The summary should be ${maxLength} characters or less and capture the key points.`,
      },
      {
        role: 'user',
        content: `Summarize this:\n\nTitle: ${title}\n\nContent: ${content}`,
      },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.3,
      max_tokens: 200,
    });

    return response.choices[0].message.content.trim();
  }

  // Answer questions about notes
  async askQuestion(question: string, context: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a helpful AI assistant for journalists. Answer questions based on the provided context.
        Be concise, accurate, and cite specific information when possible.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ];

    const response = await this.createChatCompletion(messages);
    return response.choices[0].message.content.trim();
  }

  // Extract key insights from content
  async extractInsights(title: string, content: string): Promise<string[]> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a journalist's assistant. Extract 3-5 key insights or important points from the content.
        Return each insight on a new line, starting with a bullet point (•).`,
      },
      {
        role: 'user',
        content: `Title: ${title}\n\nContent: ${content}`,
      },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.5,
      max_tokens: 300,
    });

    const insightsText = response.choices[0].message.content.trim();
    return insightsText
      .split('\n')
      .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim())
      .filter((line: string) => line.length > 0);
  }

  // Suggest related topics or questions
  async suggestRelatedTopics(title: string, content: string): Promise<string[]> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a journalist's assistant. Suggest 5 related topics or angles that could be explored based on this content.
        Return each suggestion on a new line.`,
      },
      {
        role: 'user',
        content: `Title: ${title}\n\nContent: ${content.slice(0, 1000)}`,
      },
    ];

    const response = await this.createChatCompletion(messages, {
      temperature: 0.8,
      max_tokens: 200,
    });

    const topicsText = response.choices[0].message.content.trim();
    return topicsText
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 5);
  }
}

export const openai = new OpenAIService();
