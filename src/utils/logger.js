import chalk from 'chalk';
import ora from 'ora';

let spinner = null;

const asciiArt = `
██████╗ ██╗ ██████╗██╗  ██╗    ██████╗ ██████╗ ██╗ ██████╗███████╗
██╔══██╗██║██╔════╝██║  ██║    ██╔══██╗██╔══██╗██║██╔════╝██╔════╝
██████╔╝██║██║     ███████║    ██████╔╝██████╔╝██║██║     █████╗  
██╔══██╗██║██║     ██╔══██║    ██╔═══╝ ██╔══██╗██║██║     ██╔══╝  
██║  ██║██║╚██████╗██║  ██║    ██║     ██║  ██║██║╚██████╗███████╗
╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝
                                                                    
 ██████╗ ██████╗ ██████╗ ███████╗     █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗███████╗██╗███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝██╔════╝██║██╔════╝
██║     ██║   ██║██║  ██║█████╗      ███████║██╔██╗ ██║███████║██║   ╚████╔╝ ███████╗██║███████╗
██║     ██║   ██║██║  ██║██╔══╝      ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝  ╚════██║██║╚════██║
╚██████╗╚██████╔╝██████╔╝███████╗    ██║  ██║██║ ╚████║██║  ██║███████╗ ██║   ███████║██║███████║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝ ╚═╝   ╚══════╝╚═╝╚══════╝
`;

export const logger = {
  info: (...args) => console.log(chalk.blue(...args)),
  success: (...args) => console.log(chalk.green(...args)),
  warning: (...args) => console.log(chalk.yellow(...args)),
  error: (...args) => console.error(chalk.red(...args)),
  code: (code, language = '') => console.log(chalk.cyan(code)),
  section: (title) => {
    const line = '━'.repeat(40);
    console.log(chalk.blue(`\n${line}\n ${title} \n${line}\n`));
  },
  showIntro: () => {
    console.log(chalk.cyan(asciiArt));
    console.log(chalk.gray('\nVersion 1.0.0 - Created by Rich Price\n'));
  },
  startSpinner: (text) => {
    if (spinner) spinner.stop();
    spinner = ora(text).start();
  },
  stopSpinner: (success = true, text = '') => {
    if (spinner) {
      if (success) {
        spinner.succeed(text);
      } else {
        spinner.fail(text);
      }
      spinner = null;
    }
  }
};