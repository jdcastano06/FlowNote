/**
 * NoteFormatter Class
 * 
 * ES6 Class for formatting and structuring notes
 * Handles HTML generation, section organization, and formatting
 */
export class NoteFormatter {
  private sections: Map<string, string[]>;

  constructor() {
    this.sections = new Map();
  }

  /**
   * Add a section with content
   */
  addSection(title: string, content: string | string[]): void {
    const contentArray = Array.isArray(content) ? content : [content];
    const existing = this.sections.get(title) || [];
    this.sections.set(title, [...existing, ...contentArray]);
  }

  /**
   * Format a single section as HTML
   */
  private formatSection(title: string, items: string[]): string {
    const heading = `<h2>${this.escapeHtml(title)}</h2>`;
    const content = items
      .map(item => `<p>${this.escapeHtml(item)}</p>`)
      .join("\n");
    return `${heading}\n${content}`;
  }

  /**
   * Format sections as a list
   */
  private formatSectionAsList(title: string, items: string[]): string {
    const heading = `<h3>${this.escapeHtml(title)}</h3>`;
    const listItems = items
      .map(item => `<li>${this.escapeHtml(item)}</li>`)
      .join("\n");
    return `${heading}\n<ul>\n${listItems}\n</ul>`;
  }

  /**
   * Generate HTML from all sections
   */
  toHTML(useLists: boolean = false): string {
    const sections: string[] = [];

    this.sections.forEach((items, title) => {
      if (useLists && items.length > 1) {
        sections.push(this.formatSectionAsList(title, items));
      } else {
        sections.push(this.formatSection(title, items));
      }
    });

    return sections.join("\n\n");
  }

  /**
   * Format key points as HTML list
   */
  formatKeyPoints(keyPoints: string[]): string {
    if (keyPoints.length === 0) return "";

    const heading = "<h2>Key Points</h2>";
    const listItems = keyPoints
      .map(point => `<li>${this.escapeHtml(point)}</li>`)
      .join("\n");
    return `${heading}\n<ul>\n${listItems}\n</ul>`;
  }

  /**
   * Format formulas or code blocks
   */
  formatFormula(formula: string, description?: string): string {
    const codeBlock = `<pre><code>${this.escapeHtml(formula)}</code></pre>`;
    if (description) {
      return `${codeBlock}\n<p><em>${this.escapeHtml(description)}</em></p>`;
    }
    return codeBlock;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Clear all sections
   */
  clear(): void {
    this.sections.clear();
  }

  /**
   * Get section count
   */
  getSectionCount(): number {
    return this.sections.size;
  }

  /**
   * Check if a section exists
   */
  hasSection(title: string): boolean {
    return this.sections.has(title);
  }
}

