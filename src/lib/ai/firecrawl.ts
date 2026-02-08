// Firecrawl Web Scraping Service for Journo Journal

export interface FirecrawlResult {
  url: string;
  markdown: string;
  title?: string;
  description?: string;
  language?: string;
  statusCode: number;
}

class FirecrawlService {
  private apiKey: string;
  private baseURL = 'https://api.firecrawl.dev/v1';

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY || '';
  }

  async scrape(
    url: string,
    options: {
      formats?: ('markdown' | 'html' | 'rawHtml')[];
      onlyMainContent?: boolean;
      waitFor?: number;
    } = {}
  ): Promise<FirecrawlResult> {
    const response = await fetch(`${this.baseURL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: options.formats || ['markdown'],
        onlyMainContent: options.onlyMainContent ?? true,
        waitFor: options.waitFor || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Firecrawl API error: ${(error as any).message || response.statusText || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return {
      url,
      markdown: data.data?.markdown || '',
      title: data.data?.metadata?.title,
      description: data.data?.metadata?.description,
      language: data.data?.metadata?.language,
      statusCode: data.data?.metadata?.statusCode || 200,
    };
  }
}

export const firecrawl = new FirecrawlService();
