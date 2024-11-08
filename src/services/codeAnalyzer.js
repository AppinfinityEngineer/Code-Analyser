import { logger } from '../utils/logger.js';

export class CodeAnalyzer {
  constructor(openaiService) {
    this.openai = openaiService;
  }

  async analyzeCode(code, language) {
    try {
      const prompt = this._createAnalysisPrompt(code, language);
      const response = await this.openai.generateCompletion(prompt, this._getSystemPrompt('analysis'));

      // Process and structure response into metrics and detailed text
      const analysisResults = this._extractMetrics(response, code);
      analysisResults.detailedText = response; // Include raw response for detailed text

      return analysisResults;

    } catch (error) {
      logger.error('Analysis failed:', error.message);
      return {
        complexity: 0,
        linesOfCode: 0,
        functionCount: 0,
        classCount: 0,
        overallScore: 0,
        designPatterns: [],
        antiPatterns: [],
        bestPractices: [],
        suggestions: [],
        detailedText: 'Error in generating analysis. Please check the logs.'
      };
    }
  }

  async suggestRefactoring(code, language, analysisResults) {
    try {
      const prompt = this._createRefactoringPrompt(code, language, analysisResults);
      return await this.openai.generateCompletion(prompt, this._getSystemPrompt('refactoring'));
    } catch (error) {
      logger.error('Refactoring failed:', error.message);
      return null;
    }
  }

  async generateCode(requirementsContent) {
    try {
      logger.info("Starting code generation with plain text requirements.");
      const prompt = this._createGenerationPrompt(requirementsContent);
      const response = await this.openai.generateCompletion(prompt, this._getSystemPrompt('generation'));
      logger.info("Generated code:", response);
      return response;
    } catch (error) {
      logger.error('Code generation failed:', error.message);
      return null;
    }
  }

  async generateAnalysisReport(code, language) {
    try {
      const prompt = this._createReportPrompt(code, language);
      const response = await this.openai.generateCompletion(prompt, this._getSystemPrompt('report'));

      // Structure the report for Visualizer and include detailed text
      const report = this._extractReport(response);
      report.detailedText = response; // Include raw response for detailed text

      return report;

    } catch (error) {
      logger.error('Report generation failed:', error.message);
      return {
        designPatterns: [],
        antiPatterns: [],
        bestPractices: [],
        suggestions: [],
        detailedText: 'Error in generating report. Please check the logs.'
      };
    }
  }

  _createAnalysisPrompt(code, language) {
    return `
Please analyze this ${language} code with a focus on simplicity, efficiency, and adherence to best practices. Assess the code based on:
1. **Simplicity and Minimalism**: Identify areas where code complexity can be reduced without sacrificing functionality.
2. **SOLID Principles**: Review adherence to SOLID principles and suggest practical, non-intrusive improvements.
3. **Modularity and Organization**: Assess if the code is modular and well-organized, following single responsibility and separation of concerns principles.
4. **Error Handling and Logging**: Evaluate robustness of error handling and logging practices, ensuring clear, meaningful error messages without complex error structures.
5. **Performance Optimization**: Identify opportunities for optimization, especially in loops, memory usage, and function calls.
6. **Security and Input Validation**: Review potential vulnerabilities and input validation, ensuring secure coding practices.
7. **Readability and Maintainability**: Check if the code is clean, self-documenting, and easy to read. Provide suggestions for consistent naming conventions and formatting.
8. **Testability and Coverage**: Suggest improvements to make the code more testable and ensure adequate test coverage.

Code:

${code}`;
  }

  _createRefactoringPrompt(code, language, analysis) {
    return `
Based on the following analysis results:

${analysis}

Refactor this ${language} code to:
1. **Simplify Complexity**: Remove unnecessary abstractions or dependencies, focusing on readability and simplicity.
2. **Enhance Modularity**: Reorganize code into modular, reusable components where feasible.
3. **Improve Error Handling**: Implement straightforward, meaningful error handling without complex structures.
4. **Optimize for Performance**: Address any identified performance bottlenecks, ensuring minimal memory use and efficient processing.
5. **Increase Security**: Fix any security issues, ensuring proper input validation and handling sensitive data carefully.
6. **Boost Readability and Consistency**: Refactor for clarity, following consistent naming conventions and formatting.
7. **Add Tests Where Needed**: Ensure testability, adding unit tests for critical paths and edge cases.

Original code:

${code}`;
  }

  _createGenerationPrompt(requirementsContent) {
    return `
You are a software architect and engineer skilled in building modular data pipelines using PySpark and Python. Read and interpret the following plain text requirements, and generate code that meets these requirements:

${requirementsContent}

The generated code should:
1. **Modular Design**: Each transformation step should be implemented as a separate function.
2. **Data Ingestion**: Support reading input data from JSON, Parquet, and CSV formats based on a specified input path.
3. **Data Transformation**: Apply transformations such as renaming columns, casting data types, filtering, and adding derived columns, with each transformation as a separate function.
4. **Data Output**: Save the transformed data to a specified CSV output path, with configurable settings like delimiter and header inclusion.
5. **Configuration Parameters**: Include parameters for input/output paths and CSV settings, easily modifiable at the top of the code.
6. **Error Handling**: Ensure robust error handling for file operations, data type checks, and transformation steps.
7. **Logging**: Add logging at each step to track the pipeline’s progress from ingestion to output.
8. **Performance**: Write efficient code to handle large datasets with minimal memory usage.
9. **Documentation**: Use docstrings to document functions, specifying input parameters and outputs.

Generate clean, production-ready code that aligns with these requirements.`;
  }

  _createReportPrompt(code, language) {
    return `
Generate a comprehensive analysis report for this ${language} code:

${code}

The report should include:
1. **Overall Code Quality**: Provide a general assessment of code clarity, simplicity, and organization.
2. **Architecture and Structure**: Review the code’s adherence to architectural best practices, including modularity and separation of concerns.
3. **Performance Analysis**: Identify any potential bottlenecks or inefficiencies, with suggestions for improvement.
4. **Security Review**: Check for vulnerabilities and provide recommendations for secure coding practices.
5. **Maintainability and Consistency**: Evaluate maintainability, identifying any areas where consistency could be improved.
6. **Test Coverage and Testability**: Assess test coverage and suggest areas for additional tests.
7. **Technical Debt**: Highlight any technical debt and suggest steps to address it.
8. **Actionable Recommendations**: Summarize specific, actionable recommendations for improvement.`;
  }

  _getSystemPrompt(type) {
    const prompts = {
      analysis: `You are a seasoned software architect and code reviewer. 
Analyze the provided code with a focus on simplicity, maintainability, and performance, following industry best practices and avoiding over-engineering.`,
      
      refactoring: `You are an expert in software architecture and refactoring. 
Provide a complete refactored version of the code, enhancing simplicity, modularity, and performance while maintaining functionality. Explain improvements made.`,
      
      generation: `You are an expert software developer. Generate production-ready code that is clean, efficient, and adheres to industry standards. Ensure modularity, simplicity, and maintainability.`,
      
      report: `You are a senior code analyst. Generate a thorough analysis report, covering quality, architecture, performance, security, and maintainability, with specific, actionable recommendations for improvement.`
    };
    return prompts[type];
  }

  _extractMetrics(response, code) {
    const linesOfCode = code.split('\n').length;
    const functionCount = (code.match(/function\s+\w+/g) || []).length;
    const classCount = (code.match(/class\s+\w+/g) || []).length;
    const complexity = this._calculateComplexity(code);
    const overallScore = this._calculateScore(complexity, linesOfCode, functionCount, classCount);

    return {
      complexity: response?.complexity || complexity,
      linesOfCode: response?.linesOfCode || linesOfCode,
      functionCount: response?.functionCount || functionCount,
      classCount: response?.classCount || classCount,
      overallScore: response?.overallScore || overallScore,
      designPatterns: response?.designPatterns || ['Factory', 'Singleton'],
      antiPatterns: response?.antiPatterns || ['God Object'],
      bestPractices: response?.bestPractices || ['Encapsulation', 'Separation of Concerns'],
      suggestions: response?.suggestions || ['Use dependency injection', 'Refactor large methods']
    };
  }

  _calculateComplexity(code) {
    const conditionals = (code.match(/\b(if|else if|else|switch|case)\b/g) || []).length;
    const loops = (code.match(/\b(for|while|do)\b/g) || []).length;
    const functions = (code.match(/\bfunction\b/g) || []).length;

    return conditionals + loops + functions;
  }

  _calculateScore(complexity, linesOfCode, functionCount, classCount) {
    const complexityWeight = 0.3;
    const linesWeight = 0.2;
    const functionWeight = 0.25;
    const classWeight = 0.25;

    const complexityScore = Math.max(0, 100 - complexity * 2);
    const lineScore = Math.max(0, 100 - linesOfCode * 0.2);
    const functionScore = functionCount > 0 ? Math.min(100, functionCount * 10) : 0;
    const classScore = classCount > 0 ? Math.min(100, classCount * 20) : 0;

    return Math.round(
      complexityScore * complexityWeight +
      lineScore * linesWeight +
      functionScore * functionWeight +
      classScore * classWeight
    );
  }

  _extractReport(response) {
    return {
      designPatterns: response?.designPatterns || ['Factory', 'Observer'],
      antiPatterns: response?.antiPatterns || ['Spaghetti Code'],
      bestPractices: response?.bestPractices || ['Modularization', 'Immutability'],
      suggestions: response?.suggestions || ['Use more functional programming', 'Simplify nested conditions']
    };
  }
}
