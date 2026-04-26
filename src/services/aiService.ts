export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  suggestedTags: string[];
}

export interface FlashcardSuggestion {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ResponsesApiPayload {
  input: string;
  instructions: string;
  jsonMode?: boolean;
  maxOutputTokens?: number;
}

interface ResponseTextContent {
  type?: string;
  text?: string;
}

interface ResponsesApiResponse {
  output_text?: string;
  output?: Array<{
    content?: ResponseTextContent[];
  }>;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-4.1-mini';
  private defaultApiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim() || null;

  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key') || this.defaultApiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  removeApiKey() {
    this.apiKey = this.defaultApiKey;
    localStorage.removeItem('openai_api_key');
  }

  private extractOutputText(data: ResponsesApiResponse) {
    if (typeof data.output_text === 'string' && data.output_text.trim()) {
      return data.output_text;
    }

    if (Array.isArray(data.output)) {
      return data.output
        .flatMap((item) => item.content || [])
        .filter((item) => item.type === 'output_text')
        .map((item) => item.text || '')
        .join('\n')
        .trim();
    }

    return '';
  }

  private async makeRequest({
    input,
    instructions,
    jsonMode = false,
    maxOutputTokens = 1000,
  }: ResponsesApiPayload) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input,
        instructions,
        max_output_tokens: maxOutputTokens,
        ...(jsonMode
          ? {
              text: {
                format: {
                  type: 'json_object',
                },
              },
            }
          : {}),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call OpenAI API');
    }

    const data = (await response.json()) as ResponsesApiResponse;
    const outputText = this.extractOutputText(data);

    if (!outputText) {
      throw new Error('The AI response was empty. Please try again.');
    }

    return outputText;
  }

  async summarizeNote(title: string, content: string): Promise<SummaryResult> {
    const prompt = `
Create a JSON response for this study note.

Title: ${title}
Content: ${content}

Return valid JSON with these keys:
- "summary": a concise 2-3 sentence summary
- "keyPoints": an array of 3-5 key points
- "definitions": an array of objects with "term" and "definition"
- "suggestedTags": an array of 3-5 relevant tags
    `;

    const response = await this.makeRequest({
      input: prompt,
      instructions:
        'You are an AI study assistant. Respond with valid JSON only and keep the language concise, clear, and useful for students.',
      jsonMode: true,
      maxOutputTokens: 1400,
    });

    const parsed = JSON.parse(response);

    return {
      summary: parsed.summary || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
    };
  }

  async generateFlashcards(
    title: string,
    content: string,
    count: number = 5,
  ): Promise<FlashcardSuggestion[]> {
    const prompt = `
Generate ${count} study flashcards from the note below.

Title: ${title}
Content: ${content}

Return valid JSON as an array of flashcard objects with:
- "question"
- "answer"
- "difficulty" set to "easy", "medium", or "hard"
    `;

    const response = await this.makeRequest({
      input: prompt,
      instructions:
        'You create effective flashcards for studying. Respond with valid JSON only. Keep answers concise but complete.',
      jsonMode: true,
      maxOutputTokens: 1200,
    });

    const parsed = JSON.parse(response);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item?.question && item?.answer)
      .map((item) => ({
        question: String(item.question),
        answer: String(item.answer),
        difficulty:
          item.difficulty === 'easy' || item.difficulty === 'hard'
            ? item.difficulty
            : 'medium',
      }));
  }

  async chatWithNotes(
    question: string,
    notes: Array<{ title: string; content: string }>,
  ): Promise<string> {
    const notesContext = notes
      .map((note) => `Title: ${note.title}\nContent: ${note.content}`)
      .join('\n\n---\n\n');

    return this.makeRequest({
      input: `
Answer the user's question using the note context below.

NOTES:
${notesContext}

QUESTION:
${question}
      `,
      instructions:
        'You are an AI study assistant. Answer based only on the provided notes. If the notes do not contain enough information, say that clearly.',
      maxOutputTokens: 900,
    });
  }
}

export const aiService = new AIService();
