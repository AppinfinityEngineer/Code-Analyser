import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export class FileService {
  async readCode(filePath) {
    try {
      // Normalize the path and check if it exists
      const normalizedPath = path.resolve(process.cwd(), filePath);
      
      try {
        await fs.access(normalizedPath);
      } catch (error) {
        logger.error(`File not found: ${filePath}`);
        return null;
      }

      // Check if it's a file and not a directory
      const stats = await fs.stat(normalizedPath);
      if (!stats.isFile()) {
        logger.error(`Not a file: ${filePath}`);
        return null;
      }

      // Read the file
      const code = await fs.readFile(normalizedPath, 'utf8');
      
      // Validate content
      if (!code || code.trim().length === 0) {
        logger.error(`File is empty: ${filePath}`);
        return null;
      }

      return code;
    } catch (error) {
      logger.error(`Failed to read file: ${error.message}`);
      return null;
    }
  }

  async saveCode(code, filename) {
    try {
      const filePath = this._ensureFileExtension(filename);
      const normalizedPath = path.resolve(process.cwd(), 'output', filePath);

      // Create output directory if it doesn't exist
      await fs.mkdir(path.dirname(normalizedPath), { recursive: true });

      await fs.writeFile(normalizedPath, code, 'utf8');
      logger.success(`Code saved to ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save file: ${error.message}`);
      return false;
    }
  }

  getFileType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const extensionMap = {
      '.py': 'python',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.java': 'java',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.r': 'r',
      '.scala': 'scala',
      '.ipynb': 'ipynb',
      '.html': 'html',
      '.css': 'css',
      '.sql': 'sql',
      '.sh': 'shell'
    };
    return extensionMap[extension] || 'text';
  }

  _ensureFileExtension(filename) {
    const ext = path.extname(filename);
    if (!ext) {
      const defaultExt = '.js';
      return `${filename}${defaultExt}`;
    }
    return filename;
  }

  async createExampleFile() {
    const exampleCode = `// Example JavaScript code
function greet(name) {
  if (!name) {
    throw new Error('Name is required');
  }
  return \`Hello, \${name}!\`;
}

// TODO: Add input validation
function calculateSum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  isAdult() {
    return this.age >= 18;
  }
}

module.exports = {
  greet,
  calculateSum,
  User
};`;

    try {
      await this.saveCode(exampleCode, 'example.js');
      return 'example.js';
    } catch (error) {
      logger.error('Failed to create example file');
      return null;
    }
  }
}