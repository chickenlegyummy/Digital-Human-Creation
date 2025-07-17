import axios from 'axios';
import { DigitalHuman, GeneratePromptRequest, DeepSeekResponse } from '../types/index.js';

export class DigitalHumanService {
  private apiKeys: string[];
  private currentKeyIndex = 0;

  constructor() {
    console.log('Environment variables check:');
    console.log('DeepSeek_R1:', process.env.DeepSeek_R1 ? 'SET' : 'NOT SET');
    console.log('DS_V3:', process.env.DS_V3 ? 'SET' : 'NOT SET');
    
    this.apiKeys = [
      process.env.DeepSeek_R1!,
      process.env.DS_V3!
    ].filter(Boolean);
    
    console.log('API Keys loaded:', this.apiKeys.length);
    
    if (this.apiKeys.length === 0) {
      throw new Error('No DeepSeek API keys found in environment variables');
    }
  }

  private getNextApiKey(): string {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  private async callDeepSeekAPI(messages: any[], temperature = 0.7, maxTokens = 1000): Promise<string> {
    const apiKey = this.getNextApiKey();
    
    console.log('Making API call with key:', apiKey ? 'KEY_PRESENT' : 'NO_KEY');
    
    try {
      const response = await axios.post<DeepSeekResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-r1',
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Digital Human Creation App'
          }
        }
      );

      console.log('API Response received:', response.data.choices?.[0]?.message?.content ? 'SUCCESS' : 'NO_CONTENT');
      return response.data.choices[0]?.message?.content || 'No response generated';
    } catch (error: any) {
      console.error('DeepSeek API error:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.statusText);
      throw new Error(`API call failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateDigitalHuman(request: GeneratePromptRequest): Promise<DigitalHuman> {
    const systemPrompt = `You are an expert AI prompt engineer. Create a detailed digital human character based on the user's description. 

Respond with a JSON object containing:
- name: A creative name for the digital human
- prompt: A detailed system prompt that defines the character's personality, knowledge, and behavior
- rules: An array of specific behavioral rules and guidelines
- personality: A brief description of the character's personality traits

Make the digital human engaging, helpful, and unique based on the provided description.`;

    const userMessage = `Create a digital human with the following specifications:
Description: ${request.description}
${request.personality ? `Personality: ${request.personality}` : ''}
${request.domain ? `Domain expertise: ${request.domain}` : ''}
${request.specialInstructions ? `Special instructions: ${request.specialInstructions}` : ''}

Please ensure the digital human is well-defined, engaging, and suitable for interactive conversations.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await this.callDeepSeekAPI(messages, 0.8, 1500);
      
      // Try to parse JSON response
      let parsedResponse;
      try {
        // Extract JSON from response if it's wrapped in markdown or other text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Fallback: create a structured response from the text
        parsedResponse = {
          name: 'Custom Digital Human',
          prompt: response,
          rules: [
            'Be helpful and engaging',
            'Stay in character',
            'Provide accurate information',
            'Be respectful and professional'
          ],
          personality: 'Friendly and knowledgeable'
        };
      }

      const digitalHuman: DigitalHuman = {
        id: `dh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: parsedResponse.name || 'Custom Digital Human',
        prompt: parsedResponse.prompt || response,
        rules: Array.isArray(parsedResponse.rules) ? parsedResponse.rules : [
          'Be helpful and engaging',
          'Stay in character',
          'Provide accurate information'
        ],
        personality: parsedResponse.personality || 'Friendly and knowledgeable',
        temperature: 0.7,
        maxTokens: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return digitalHuman;
    } catch (error) {
      console.error('Error generating digital human:', error);
      throw error;
    }
  }

  async regenerateDigitalHuman(currentHuman: DigitalHuman, newRequest?: GeneratePromptRequest): Promise<DigitalHuman> {
    const request = newRequest || {
      description: `Regenerate this digital human: ${currentHuman.name} with personality: ${currentHuman.personality}`
    };
    
    const newHuman = await this.generateDigitalHuman(request);
    return {
      ...newHuman,
      id: currentHuman.id, // Keep the same ID
      createdAt: currentHuman.createdAt,
      updatedAt: new Date()
    };
  }

  async generateResponse(prompt: string, digitalHuman: DigitalHuman, chatHistory: any[] = []): Promise<string> {
    const systemMessage = {
      role: 'system',
      content: `${digitalHuman.prompt}

Character: ${digitalHuman.name}
Personality: ${digitalHuman.personality}

Rules:
${digitalHuman.rules.map(rule => `- ${rule}`).join('\n')}

Stay in character and respond as this digital human would.`
    };

    const messages = [
      systemMessage,
      ...chatHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: prompt }
    ];

    return await this.callDeepSeekAPI(messages, digitalHuman.temperature, digitalHuman.maxTokens);
  }
}
