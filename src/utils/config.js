import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadConfig() {
  // Load environment variables from .env file if it exists
  const envPath = join(dirname(dirname(__dirname)), '.env');
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      logger.error('Error loading .env file:', result.error.message);
    }
  } else {
    logger.warning('No .env file found. Using environment variables.');
  }

  const config = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000', 10)
    }
  };

  // Validate OpenAI configuration
  if (!config.openai.apiKey) {
    logger.error('OPENAI_API_KEY is not set in environment variables or .env file');
  }
  
  if (isNaN(config.openai.temperature) || config.openai.temperature < 0 || config.openai.temperature > 1) {
    logger.warning('Invalid OPENAI_TEMPERATURE value. Using default: 0.7');
    config.openai.temperature = 0.7;
  }
  
  if (isNaN(config.openai.maxTokens) || config.openai.maxTokens < 1) {
    logger.warning('Invalid OPENAI_MAX_TOKENS value. Using default: 4000');
    config.openai.maxTokens = 4000;
  }

  return config;
}