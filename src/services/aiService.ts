// AI Service for handling OpenAI API calls
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

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    // Check for API key in localStorage or environment
    this.apiKey = localStorage.getItem('openai_api_key') || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  removeApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }

  private async makeRequest(messages: any[], maxTokens: number = 1000) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async summarizeNote(title: string, content: string): Promise<SummaryResult> {
    const prompt = `
Please analyze the following note and provide a structured summary:

Title: ${title}
Content: ${content}

Please respond with a JSON object containing:
1. "summary": A concise 2-3 sentence summary
2. "keyPoints": An array of 3-5 key points (strings)
3. "definitions": An array of important terms with definitions (objects with "term" and "definition" keys)
4. "suggestedTags": An array of 3-5 relevant tags for categorization

Make sure the response is valid JSON format.
    `;

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an AI assistant that helps students study by creating summaries and extracting key information from their notes. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 1500);

      // Parse the JSON response
      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error summarizing note:', error);
      throw error;
    }
  }

  async generateFlashcards(title: string, content: string, count: number = 5): Promise<FlashcardSuggestion[]> {
    const prompt = `
Based on the following note, generate ${count} flashcards for studying:

Title: ${title}
Content: ${content}

Please respond with a JSON array of flashcard objects, each containing:
- "question": A clear, specific question
- "answer": A concise but complete answer
- "difficulty": Either "easy", "medium", or "hard"

Focus on the most important concepts, facts, and relationships in the content.
Make sure the response is valid JSON format.
    `;

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an AI assistant that creates effective study flashcards from educational content. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 1000);

      // Parse the JSON response
      const result = JSON.parse(response);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  async chatWithNotes(question: string, notes: Array<{title: string, content: string}>): Promise<string> {
    const notesContext = notes.map(note => `Title: ${note.title}\nContent: ${note.content}`).join('\n\n---\n\n');
    
    const prompt = `
Based on the following notes, please answer the user's question:

NOTES:
${notesContext}

QUESTION: ${question}

Please provide a helpful and accurate answer based on the information in the notes. If the notes don't contain enough information to answer the question, please say so.
    `;

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an AI study assistant that helps students by answering questions based on their notes. Be helpful, accurate, and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 800);

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();