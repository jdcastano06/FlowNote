/**
 * TranscriptionProcessor Class
 * 
 * ES6 Class for processing and formatting transcriptions
 * Handles text cleaning, chunking, and formatting operations
 */
export class TranscriptionProcessor {
  private transcription: string;

  constructor(transcription: string) {
    this.transcription = transcription || "";
  }

  /**
   * Clean the transcription by removing extra whitespace and normalizing
   */
  clean(): string {
    return this.transcription
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /**
   * Split transcription into chunks of specified length
   */
  chunk(maxLength: number): string[] {
    const cleaned = this.clean();
    const chunks: string[] = [];
    let currentChunk = "";

    const sentences = cleaned.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += (currentChunk ? " " : "") + sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Extract key phrases or terms (simple implementation)
   */
  extractKeyTerms(minLength: number = 3): string[] {
    const cleaned = this.clean().toLowerCase();
    const words = cleaned.split(/\s+/);
    const termCounts = new Map<string, number>();

    // Count word frequencies (excluding common words)
    const commonWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should"]);

    words.forEach(word => {
      const cleanedWord = word.replace(/[^\w]/g, "");
      if (cleanedWord.length >= minLength && !commonWords.has(cleanedWord)) {
        termCounts.set(cleanedWord, (termCounts.get(cleanedWord) || 0) + 1);
      }
    });

    // Return top terms
    return Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term);
  }

  /**
   * Get word count
   */
  getWordCount(): number {
    return this.clean().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get character count
   */
  getCharacterCount(): number {
    return this.clean().length;
  }

  /**
   * Format transcription with line breaks for readability
   */
  formatForDisplay(maxLineLength: number = 80): string {
    const cleaned = this.clean();
    const words = cleaned.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length <= maxLineLength) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  }
}

