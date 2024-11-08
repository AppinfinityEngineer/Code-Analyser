import { Agent } from './agent.js';

const agent = new Agent();
agent.startInteractiveMode().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});