import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export class ReportGenerator {
  constructor() {
    marked.setOptions({
      renderer: new markedTerminal(),
      mangle: false,
      headerIds: false
    });
  }

  async generateReport(filePath, analysis, fileType, metrics = {}) {
    const report = this._createReportContent(filePath, analysis, fileType, metrics);
    const outputPath = path.join(process.cwd(), 'reports', `analysis_${Date.now()}.md`);
    
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, report);
      console.log(marked(report));
      return outputPath;
    } catch (error) {
      logger.error('Error generating report:', error);
      return null;
    }
  }

  _createReportContent(filePath, analysis, fileType, metrics) {
    const timestamp = new Date().toLocaleString();
    const { complexity, maintainability, coverage } = metrics;
    
    return `# Code Analysis Report

## Overview
- **File:** \`${path.basename(filePath)}\`
- **Type:** ${fileType.toUpperCase()}
- **Date:** ${timestamp}

## Metrics
${this._formatMetrics(metrics)}

## Analysis Summary
${this._formatAnalysis(analysis)}

## Key Findings
${this._extractKeyFindings(analysis)}

## Recommendations
${this._extractRecommendations(analysis)}

## Action Items
${this._createActionItems(analysis)}

## Security Considerations
${this._extractSecurityConsiderations(analysis)}

## Performance Insights
${this._extractPerformanceInsights(analysis)}

## Best Practices
${this._extractBestPractices(analysis)}

---
Generated by Code Analyzer`;
  }

  _formatMetrics(metrics) {
    if (!Object.keys(metrics).length) return '_No metrics available_';
    
    return Object.entries(metrics)
      .map(([key, value]) => `- **${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`)
      .join('\n');
  }

  _formatAnalysis(analysis) {
    return analysis.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
  }

  _extractKeyFindings(analysis) {
    const findings = analysis
      .split('\n')
      .filter(line => line.includes('!') || line.includes('critical') || line.includes('important'))
      .map(line => `- ${line.trim()}`);

    return findings.length > 0
      ? findings.join('\n')
      : '_No critical findings identified_';
  }

  _extractRecommendations(analysis) {
    const recommendations = analysis
      .split('\n')
      .filter(line => 
        line.includes('recommend') || 
        line.includes('should') || 
        line.includes('could') ||
        line.includes('consider'))
      .map(line => `- ${line.trim()}`);

    return recommendations.length > 0
      ? recommendations.join('\n')
      : '_No specific recommendations_';
  }

  _createActionItems(analysis) {
    const actionItems = analysis
      .split('\n')
      .filter(line => 
        line.includes('Fix') || 
        line.includes('Update') || 
        line.includes('Add') || 
        line.includes('Remove') ||
        line.includes('Refactor'))
      .map(line => `- [ ] ${line.trim()}`);

    return actionItems.length > 0
      ? actionItems.join('\n')
      : '_No immediate action items_';
  }

  _extractSecurityConsiderations(analysis) {
    const security = analysis
      .split('\n')
      .filter(line => 
        line.toLowerCase().includes('security') || 
        line.toLowerCase().includes('vulnerability') ||
        line.toLowerCase().includes('risk'))
      .map(line => `- ${line.trim()}`);

    return security.length > 0
      ? security.join('\n')
      : '_No security concerns identified_';
  }

  _extractPerformanceInsights(analysis) {
    const performance = analysis
      .split('\n')
      .filter(line => 
        line.toLowerCase().includes('performance') || 
        line.toLowerCase().includes('optimization') ||
        line.toLowerCase().includes('speed') ||
        line.toLowerCase().includes('memory'))
      .map(line => `- ${line.trim()}`);

    return performance.length > 0
      ? performance.join('\n')
      : '_No performance issues identified_';
  }

  _extractBestPractices(analysis) {
    const practices = analysis
      .split('\n')
      .filter(line => 
        line.toLowerCase().includes('practice') || 
        line.toLowerCase().includes('convention') ||
        line.toLowerCase().includes('standard'))
      .map(line => `- ${line.trim()}`);

    return practices.length > 0
      ? practices.join('\n')
      : '_No best practice violations identified_';
  }
}