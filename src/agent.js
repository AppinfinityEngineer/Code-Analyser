import inquirer from 'inquirer';
import { loadConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { OpenAIService } from './services/openaiService.js';
import { CodeAnalyzer } from './services/codeAnalyzer.js';
import { FileService } from './services/fileService.js';
import { Visualizer } from './utils/visualizer.js';

export class Agent {
  constructor() {
    this.config = loadConfig();
    this.validateConfig();
    this.fileService = new FileService();
    this.openaiService = new OpenAIService(this.config.openai);
    this.codeAnalyzer = new CodeAnalyzer(this.openaiService);
    this.visualizer = new Visualizer(); // Initialize Visualizer
  }

  validateConfig() {
    if (!this.config.openai.apiKey) {
      logger.error('OpenAI API key is missing. Please add it to your .env file:');
      logger.info('OPENAI_API_KEY=your_api_key_here');
      process.exit(1);
    }
  }

  async startInteractiveMode() {
    logger.showIntro();

    while (true) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📝 Review Code File', value: 'review' },
          { name: '🔨 Generate Code from Requirements', value: 'generate' },
          { name: '📊 Generate Analysis Report', value: 'analyze' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }]);

      if (action === 'exit') {
        logger.info('Goodbye! Thanks for using Rich Price Code Analysis.');
        process.exit(0);
      }

      try {
        switch (action) {
          case 'review':
            await this.handleCodeReview();
            break;
          case 'generate':
            await this.handleCodeGeneration();
            break;
          case 'analyze':
            await this.handleAnalysisReport();
            break;
        }
      } catch (error) {
        logger.error('Operation failed:', error.message);
      }
    }
  }

  async handleCodeReview() {
    const { filePath } = await inquirer.prompt([{
      type: 'input',
      name: 'filePath',
      message: 'Enter the path to the code file to review:',
      validate: input => input.length > 0 || 'File path is required'
    }]);

    const code = await this.fileService.readCode(filePath);
    if (!code) {
      logger.error('Failed to read file');
      return;
    }

    const fileType = this.fileService.getFileType(filePath);
    logger.info(`Analyzing ${fileType} file...`);

    await this.visualizer.displayTitle('Code Review');
    const analysis = await this.codeAnalyzer.analyzeCode(code, fileType);

    if (analysis) {
      // Display Metrics with Visualizer
      this.visualizer.displayMetrics({
        complexity: analysis.complexity,
        linesOfCode: analysis.linesOfCode,
        functionCount: analysis.functionCount,
        classCount: analysis.classCount,
        overallScore: analysis.overallScore
      });

      // Display Patterns with Visualizer
      this.visualizer.displayPatterns({
        designPatterns: analysis.designPatterns || [],
        antiPatterns: analysis.antiPatterns || [],
        bestPractices: analysis.bestPractices || [],
        suggestions: analysis.suggestions || []
      });

      // Display Detailed Text of Analysis
      this.visualizer.displayDetailedReport(analysis.detailedText);

      const { wantRefactor } = await inquirer.prompt([{
        type: 'confirm',
        name: 'wantRefactor',
        message: 'Would you like to see a refactored version of the code?',
        default: true
      }]);

      if (wantRefactor) {
        logger.section('Refactored Code');
        const refactoredCode = await this.codeAnalyzer.suggestRefactoring(code, fileType, analysis);
        if (refactoredCode) {
          logger.code(refactoredCode);
          await this.handleSaveRefactored(refactoredCode);
        }
      }
    }
  }

  async handleCodeGeneration() {
    const { filePath } = await inquirer.prompt([{
        type: 'input',
        name: 'filePath',
        message: 'Enter the path to the requirements file:',
        validate: input => input.length > 0 || 'File path is required'
    }]);

    const requirementsContent = await this.fileService.readCode(filePath);
    if (!requirementsContent) {
        logger.error('Failed to read requirements file');
        return;
    }

    logger.section('Code Generation');
    logger.info('Requirements loaded');

    // Send the plain text requirements directly to the code analyzer
    const generatedCode = await this.codeAnalyzer.generateCode(requirementsContent);
    if (generatedCode) {
        logger.section('Generated Code');
        logger.code(generatedCode);
        await this.handleSaveRefactored(generatedCode);
    }
}


  async handleAnalysisReport() {
    const { filePath } = await inquirer.prompt([{
      type: 'input',
      name: 'filePath',
      message: 'Enter the path to the code file to analyze:',
      validate: input => input.length > 0 || 'File path is required'
    }]);

    const code = await this.fileService.readCode(filePath);
    if (!code) {
      logger.error('Failed to read file');
      return;
    }

    const fileType = this.fileService.getFileType(filePath);
    logger.info(`Generating analysis report for ${fileType} file...`);

    await this.visualizer.displayTitle('Analysis Report');
    const report = await this.codeAnalyzer.generateAnalysisReport(code, fileType);

    if (report) {
      // Display Patterns in the Analysis Report with Visualizer
      this.visualizer.displayPatterns({
        designPatterns: report.designPatterns || [],
        antiPatterns: report.antiPatterns || [],
        bestPractices: report.bestPractices || [],
        suggestions: report.suggestions || []
      });

      // Display Detailed Text of Report
      this.visualizer.displayDetailedReport(report.detailedText);
    }
  }

  async handleSaveRefactored(code) {
    const { save } = await inquirer.prompt([{
      type: 'confirm',
      name: 'save',
      message: 'Do you want to save the generated code?',
      default: true
    }]);

    if (save) {
      const { filename } = await inquirer.prompt([{
        type: 'input',
        name: 'filename',
        message: 'Enter filename to save the code:',
        validate: input => input.length > 0 || 'Filename is required'
      }]);

      await this.fileService.saveCode(code, filename);
    }
  }
}
