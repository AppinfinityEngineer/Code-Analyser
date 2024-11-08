import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

export class CodeGenerator {
  constructor(openaiService) {
    this.openai = openaiService;
  }

  async generateFromRequirements(requirementsPath) {
    try {
      logger.startSpinner('Reading requirements...');
      const requirements = await this._readRequirements(requirementsPath);
      if (!requirements) return null;
      logger.stopSpinner(true, 'Requirements loaded');

      logger.startSpinner('Analyzing requirements...');
      const analysis = await this._analyzeRequirements(requirements);
      logger.stopSpinner(true, 'Requirements analyzed');

      logger.startSpinner('Generating code...');
      const code = await this._generateCode(requirements, analysis);
      logger.stopSpinner(true, 'Code generated');

      return {
        code,
        analysis,
        language: this._detectLanguage(requirements)
      };
    } catch (error) {
      logger.error('Code generation failed:', error.message);
      return null;
    }
  }

  async _readRequirements(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (!content.trim()) {
        throw new Error('Requirements file is empty');
      }
      return content;
    } catch (error) {
      logger.error(`Failed to read requirements: ${error.message}`);
      return null;
    }
  }

  async _analyzeRequirements(requirements) {
    const prompt = `
Analyze these software requirements with the perspective of a lead engineer, focusing on robust, maintainable, and scalable architecture. Provide a comprehensive analysis covering:

1. **Key Features for Core Functionality**:
   - Identify essential features that fulfill the main requirements.
   - Suggest any additional features that may enhance the functionality without overcomplicating the design.

2. **Technical and Architectural Requirements**:
   - Outline technical specifications, including technology stacks, architectural patterns (e.g., microservices, monolithic, event-driven).
   - Mention relevant industry standards or best practices for each specification.

3. **Recommended Modular Design**:
   - Suggest a modular breakdown of features and services, focusing on separation of concerns and single-responsibility principles.
   - Recommend a structure that supports future extension or reusability, highlighting modules that could become shared services.

4. **Potential Challenges and Solutions**:
   - Predict challenges related to implementation, data handling, and technical debt.
   - Propose solutions or mitigations to address each challenge, aiming to maintain simplicity and efficiency.

5. **Security and Scalability Considerations**:
   - Describe security requirements, such as data encryption, secure API access, and OWASP standards.
   - Outline scalability needs, including load balancing, database partitioning, caching strategies, and horizontal scaling.

6. **Maintainability and Future Extensibility**:
   - Identify strategies for keeping the codebase maintainable over time, including coding standards, documentation needs, and CI/CD practices.
   - Propose ways to extend the system easily in the future with minimal code refactoring.

7. **Quality Assurance and Testing Needs**:
   - List testing requirements, such as unit testing, integration testing, load testing, and security testing.
   - Mention tools or frameworks that could support the testing process effectively.

8. **Dependencies and Integration Points**:
   - Analyze dependencies (e.g., external APIs, databases) and integration points that the system must handle.
   - Suggest best practices for dependency management and integration to ensure stability and resilience.

9. **Performance Optimization Strategies**:
   - Recommend performance optimizations for critical components, such as data processing pipelines or high-traffic endpoints.
   - Include guidance on optimizing resource usage (e.g., memory, CPU) to handle peak loads.

Requirements:

${requirements}

Summarize your analysis with any final recommendations on how to deliver a secure, scalable, and maintainable system with a clear roadmap for implementation and testing.
`;
    return await this.openai.generateCompletion(prompt, this._getSystemPrompt('requirementsAnalysis'));
}

  async _generateCode(requirements, analysis) {
    const language = this._detectLanguage(requirements);
    const prompt = `
Using the following requirements and analysis, generate ${language} code that is production-ready and follows best practices:

Requirements:
${requirements}

Analysis:
${analysis}

Ensure the generated code includes:
1. Complete and modular implementation, prioritizing simplicity and maintainability
2. Error handling with clear, meaningful messages
3. Input validation to secure against invalid data
4. Essential security measures for data handling and input/output
5. Self-documenting code with brief docstrings for clarity
6. Tests covering core functionality and edge cases

Return the code in a markdown code block.`;

    const response = await this.openai.generateCompletion(
      prompt,
      this._getSystemPrompt('generation')
    );

    return this._extractCodeBlock(response);
  }

  _detectLanguage(requirements) {
    const languageHints = {
      javascript: ['node', 'javascript', 'js', 'react', 'vue', 'angular'],
      python: ['python', 'django', 'flask', 'fastapi'],
      typescript: ['typescript', 'ts', 'angular'],
      java: ['java', 'spring', 'jakarta'],
      csharp: ['c#', 'csharp', '.net', 'asp.net']
    };

    const content = requirements.toLowerCase();
    for (const [lang, hints] of Object.entries(languageHints)) {
      if (hints.some(hint => content.includes(hint))) {
        return lang;
      }
    }

    return 'javascript'; // Default to JavaScript
  }

  _extractCodeBlock(content) {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);
    return match ? match[1].trim() : content;
  }

  _getSystemPrompt(type) {
    const prompts = {
      requirements: `You are an expert software architect and analyst. 
Analyze the provided project requirements and focus on identifying key technical needs, potential architectural challenges, and necessary security considerations. 
Provide concise, actionable insights that guide a production-ready implementation while maintaining simplicity and scalability.`,
      
      generation: `You are an expert software developer generating production-ready code.
The generated code should adhere to high standards for simplicity, efficiency, and maintainability. Ensure the code includes:
- Proper error handling and meaningful logging where needed
- Input validation to handle edge cases and secure data entry points
- Security best practices to safeguard sensitive data
- Comprehensive tests that validate functionality and handle edge cases
- Self-documenting style with brief, clear docstrings or comments where needed
Follow SOLID principles where practical, but prioritize simplicity and minimalism over complex abstractions.`
    };
    return prompts[type];
  }
}
