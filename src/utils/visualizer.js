import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import gradient from 'gradient-string';
import figlet from 'figlet';

export class Visualizer {
  displayMetrics(metrics) {
    console.log('\n' + boxen(gradient.pastel('Code Metrics Dashboard'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double'
    }));

    const table = new Table({
      head: [
        chalk.cyan('Metric'),
        chalk.cyan('Value'),
        chalk.cyan('Rating')
      ],
      style: {
        head: [],
        border: []
      }
    });

    const getRating = (value, type) => {
      switch (type) {
        case 'complexity':
          return value < 10 ? '🟢 Good' : value < 20 ? '🟡 Medium' : '🔴 High';
        case 'score':
          return value > 80 ? '🟢 Good' : value > 60 ? '🟡 Medium' : '🔴 Poor';
        default:
          return '➖';
      }
    };

    table.push(
      ['Complexity', metrics.complexity, getRating(metrics.complexity, 'complexity')],
      ['Lines of Code', metrics.linesOfCode, '➖'],
      ['Functions', metrics.functionCount, '➖'],
      ['Classes', metrics.classCount, '➖'],
      ['Overall Score', `${metrics.overallScore}/100`, getRating(metrics.overallScore, 'score')]
    );

    console.log(table.toString());
  }

  displayPatterns(patterns) {
    console.log('\n' + boxen(gradient.mind('Design Patterns Analysis'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double'
    }));

    if (patterns.designPatterns.length > 0) {
      console.log(chalk.green('\n✨ Design Patterns Detected:'));
      patterns.designPatterns.forEach(pattern => {
        console.log(chalk.green(`  ✓ ${pattern}`));
      });
    }

    if (patterns.antiPatterns.length > 0) {
      console.log(chalk.red('\n⚠️ Anti-Patterns Detected:'));
      patterns.antiPatterns.forEach(pattern => {
        console.log(chalk.red(`  ✗ ${pattern}`));
      });
    }

    if (patterns.bestPractices.length > 0) {
      console.log(chalk.yellow('\n📝 Best Practice Suggestions:'));
      patterns.bestPractices.forEach(practice => {
        console.log(chalk.yellow(`  • ${practice}`));
      });
    }

    if (patterns.suggestions.length > 0) {
      console.log(chalk.blue('\n💡 Improvement Suggestions:'));
      patterns.suggestions.forEach(suggestion => {
        console.log(chalk.blue(`  • ${suggestion}`));
      });
    }
  }

  displayDetailedReport(detailedText) {
    console.log('\n' + boxen(gradient.atlas('Detailed Analysis Report'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double'
    }));
    console.log(chalk.white(detailedText));
  }

  displayTitle(text) {
    return new Promise((resolve, reject) => {
      figlet(text, {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(gradient.pastel.multiline(data));
        resolve();
      });
    });
  }
}
