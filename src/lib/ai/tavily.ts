// Tavily Web Search Service for Journo Journal

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
}

class TavilyService {
  private apiKey: string;
  private baseURL = 'https://api.tavily.com';

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
  }

  async search(
    query: string,
    options: {
      maxResults?: number;
      searchDepth?: 'basic' | 'advanced';
      includeAnswer?: boolean;
      includeDomains?: string[];
      excludeDomains?: string[];
    } = {}
  ): Promise<TavilySearchResponse> {
    const response = await fetch(`${this.baseURL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: options.maxResults || 5,
        search_depth: options.searchDepth || 'basic',
        include_answer: options.includeAnswer ?? false,
        include_domains: options.includeDomains || [],
        exclude_domains: options.excludeDomains || [],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Tavily API error: ${(error as any).message || response.statusText || 'Unknown error'}`
      );
    }

    return await response.json();
  }
}

export const tavily = new TavilyService();
