export class NotebookParser {
  parseJupyterNotebook(content) {
    try {
      const notebook = JSON.parse(content);
      return this._extractCodeCells(notebook);
    } catch (error) {
      throw new Error(`Failed to parse notebook: ${error.message}`);
    }
  }

  _extractCodeCells(notebook) {
    if (!notebook.cells) {
      throw new Error('Invalid notebook format: no cells found');
    }

    return notebook.cells
      .filter(cell => cell.cell_type === 'code')
      .map(cell => ({
        source: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
        outputs: cell.outputs || []
      }));
  }

  detectLanguage(notebook) {
    const metadata = notebook.metadata || {};
    const kernelInfo = metadata.kernelspec || {};
    
    const languageMap = {
      'python': 'python',
      'ir': 'R',
      'javascript': 'javascript',
      'scala': 'scala'
    };

    return languageMap[kernelInfo.language?.toLowerCase()] || 'unknown';
  }
}