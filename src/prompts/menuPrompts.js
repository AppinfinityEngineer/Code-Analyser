export const menuPrompts = {
  mainMenu: {
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      {
        name: 'Analyze Code',
        value: 'analyze'
      },
      {
        name: 'Exit',
        value: 'exit'
      }
    ]
  },
  codeAnalysis: {
    filePath: {
      type: 'input',
      name: 'filePath',
      message: 'Enter the path to the code file or notebook to analyze:',
      validate: input => input.trim().length > 0 || 'Please enter a valid file path'
    }
  },
  refactorConfirmation: {
    type: 'confirm',
    name: 'wantRefactor',
    message: 'Would you like to generate a refactored version?',
    default: true
  },
  saveConfirmation: {
    type: 'confirm',
    name: 'save',
    message: 'Do you want to save the refactored code?',
    default: true
  },
  outputFilename: {
    type: 'input',
    name: 'filename',
    message: 'Enter the filename to save the refactored code:',
    default: 'refactored_code.js',
    validate: input => input.trim().length > 0 || 'Please enter a valid filename'
  }
};