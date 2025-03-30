const Memory = require('../models/Memory');
const Conversation = require('../models/Conversation');

/**
 * Service responsible for processing conversations into memories
 * Extracts key insights, assigns importance, and tags memories
 */
class MemoryProcessor {
  /**
   * Process a conversation into a memory
   * @param {Conversation} conversation - The conversation to process
   * @param {Object} options - Processing options
   * @returns {Memory} - The created memory
   */
  static async processConversation(conversation, options = {}) {
    if (!conversation) {
      throw new Error('Conversation cannot be null');
    }

    // Generate a summary of the conversation
    const summary = this.generateSummary(conversation, options);

    // Calculate the importance of this memory
    const importance = this.calculateImportance(conversation, summary, options);

    // Generate tags for this memory
    const tags = this.generateTags(conversation, summary, options);

    // Create and save the memory
    const memory = new Memory(
      null,                // Generate new ID
      conversation.conversationId,
      summary,
      importance,
      new Date(),
      tags
    );

    return await memory.save();
  }

  /**
   * Generate a summary of a conversation
   * In a real implementation, this would likely use an LLM to generate the summary
   * @param {Conversation} conversation - The conversation to summarize
   * @param {Object} options - Summarization options
   * @returns {string} - The generated summary
   */
  static generateSummary(conversation, options = {}) {
    const { maxLength = 500 } = options;
    
    // This is a placeholder implementation
    // In production, Claude 3.7 would generate this summary
    const fullText = conversation.getFullText();
    
    // For this implementation, we'll just take the first n characters as a simple summary
    // or create a basic summary based on conversation metadata
    let summary = '';
    
    if (fullText.length > 0) {
      // Take the first few characters, but ensure we don't cut off in the middle of a word
      const textForSummary = fullText.substring(0, Math.min(maxLength, fullText.length));
      summary = textForSummary.length < fullText.length 
        ? textForSummary.substring(0, textForSummary.lastIndexOf(' ')) + '...'
        : textForSummary;
    } else {
      // If there's no text, create a basic summary from metadata
      const participantsStr = conversation.participants.join(', ');
      const duration = conversation.getDuration();
      summary = `Conversation with ${participantsStr}`;
      
      if (duration) {
        summary += ` lasting ${duration.toFixed(1)} minutes`;
      }
    }
    
    return summary;
  }

  /**
   * Calculate the importance of a memory
   * @param {Conversation} conversation - The related conversation
   * @param {string} summary - The generated summary
   * @param {Object} options - Calculation options
   * @returns {number} - Importance score (1-10)
   */
  static calculateImportance(conversation, summary, options = {}) {
    // This is a placeholder implementation
    // In production, Claude 3.7 would evaluate importance
    
    // Simple heuristics for demonstration:
    let importance = 5; // Default middle importance
    
    // 1. Longer conversations might be more important
    const duration = conversation.getDuration();
    if (duration) {
      // Add up to 2 points for longer conversations
      importance += Math.min(2, Math.floor(duration / 10));
    }
    
    // 2. More participants might indicate importance
    if (conversation.participants.length > 2) {
      importance += 1;
    }
    
    // 3. Length of the raw text might indicate complexity/importance
    const textLength = conversation.rawText.length;
    if (textLength > 1000) {
      importance += 1;
    }
    
    // Ensure the importance is between 1-10
    return Math.min(Math.max(importance, 1), 10);
  }

  /**
   * Generate tags for a memory based on its content
   * @param {Conversation} conversation - The related conversation
   * @param {string} summary - The generated summary
   * @param {Object} options - Tagging options
   * @returns {string[]} - Array of tags
   */
  static generateTags(conversation, summary, options = {}) {
    // This is a placeholder implementation
    // In production, Claude 3.7 would extract relevant tags
    
    const tags = [];
    
    // Add participant names as tags
    tags.push(...conversation.participants);
    
    // Add date as a tag (YYYY-MM-DD)
    const dateStr = conversation.startTime.toISOString().split('T')[0];
    tags.push(dateStr);
    
    // Simple keyword extraction from the summary
    // In a real implementation, this would be much more sophisticated
    const commonKeywords = [
      'help', 'question', 'problem', 'solution', 'error', 'fix', 'learn',
      'code', 'program', 'software', 'data', 'api', 'file', 'system',
      'request', 'information', 'explain', 'understand', 'create', 'build'
    ];
    
    const summaryLower = summary.toLowerCase();
    commonKeywords.forEach(keyword => {
      if (summaryLower.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Return unique tags
    return [...new Set(tags)];
  }
}

module.exports = MemoryProcessor;
