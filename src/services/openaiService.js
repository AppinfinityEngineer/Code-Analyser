import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

export class OpenAIService {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({
      apiKey: config.apiKey
    });
    
    this.config = {
      model: config.model || 'gpt-4',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 4000
    };
  }

  async generateCompletion(prompt, systemPrompt) {
    try {
      logger.startSpinner('Connecting to OpenAI...');
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      logger.stopSpinner(true, 'Connected successfully');
      return response.choices[0]?.message?.content;
    } catch (error) {
      logger.stopSpinner(false, 'Connection failed');
      logger.error('OpenAI API error:', error.message);
      return null;
    }
  }
}