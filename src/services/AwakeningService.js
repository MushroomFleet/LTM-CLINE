const Persona = require('../models/Persona');
const Memory = require('../models/Memory');
const DreamstateUpdate = require('../models/DreamstateUpdate');

/**
 * Service responsible for the "Awakening" process
 * This handles loading the persona and retrieving relevant memories when the system starts
 */
class AwakeningService {
  /**
   * Load the persona and relevant memories to create an "awakening" context
   * @param {Object} options - Options for the awakening process
   * @returns {Object} - The awakening context including persona and memories
   */
  static async awaken(options = {}) {
    const {
      recentMemoriesLimit = 5,
      importantMemoriesThreshold = 8,
      importantMemoriesLimit = 5,
      recentUpdatesLimit = 3
    } = options;

    // Ensure a persona exists and load it
    const persona = await Persona.ensureExists();

    // Load recent memories
    const recentMemories = await Memory.getRecent(recentMemoriesLimit);

    // Load important memories
    const importantMemories = await Memory.getImportant(importantMemoriesThreshold, importantMemoriesLimit);

    // Load recent persona updates
    const recentUpdates = await DreamstateUpdate.getByPersona(
      persona.personaId,
      recentUpdatesLimit
    );

    // Format the updates for readability
    const formattedUpdates = recentUpdates.map(update => {
      const diff = update.getDiff();
      return {
        when: update.timestamp,
        description: update.description,
        justification: update.justification,
        changes: diff
      };
    });

    // Prepare the awakening context
    const context = {
      persona: {
        id: persona.personaId,
        traits: persona.traits,
        values: persona.values,
        preferences: persona.preferences,
        biography: persona.biography
      },
      recentMemories: recentMemories.map(memory => ({
        id: memory.memoryId,
        summary: memory.summary,
        importance: memory.importance,
        when: memory.timestamp,
        tags: memory.tags
      })),
      importantMemories: importantMemories.map(memory => ({
        id: memory.memoryId,
        summary: memory.summary,
        importance: memory.importance,
        when: memory.timestamp,
        tags: memory.tags
      })),
      recentUpdates: formattedUpdates,
      awakeningTime: new Date()
    };

    return context;
  }

  /**
   * Generate a prompt for Claude 3.7 based on the awakening context
   * @param {Object} context - The awakening context
   * @param {Object} options - Options for prompt generation
   * @returns {string} - The generated prompt
   */
  static generateAwakeningPrompt(context, options = {}) {
    // Create a string representation of the persona
    const personaDesc = `You are Claude 3.7 with the following traits:
- Openness: ${context.persona.traits.openness.toFixed(2)}
- Conscientiousness: ${context.persona.traits.conscientiousness.toFixed(2)}
- Extraversion: ${context.persona.traits.extraversion.toFixed(2)}
- Agreeableness: ${context.persona.traits.agreeableness.toFixed(2)}
- Neuroticism: ${context.persona.traits.neuroticism.toFixed(2)}

Your core values:
${Object.entries(context.persona.values)
  .map(([key, value]) => `- ${key}: ${value.toFixed(2)}`)
  .join('\n')}

Your preferences:
${Object.entries(context.persona.preferences)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Your biography:
${context.persona.biography}
`;

    // Create a summary of recent memories
    const recentMemoriesDesc = context.recentMemories.length > 0
      ? `Recent experiences:
${context.recentMemories
  .map(memory => `- ${memory.summary} (Importance: ${memory.importance})`)
  .join('\n')}`
      : 'You have no recent memories.';

    // Create a summary of important memories
    const importantMemoriesDesc = context.importantMemories.length > 0
      ? `Important memories:
${context.importantMemories
  .map(memory => `- ${memory.summary} (Importance: ${memory.importance})`)
  .join('\n')}`
      : 'You have no significant memories.';

    // Create a summary of recent updates
    const updatesDesc = context.recentUpdates.length > 0
      ? `Recent personality developments:
${context.recentUpdates
  .map(update => `- ${update.description}: ${update.justification}`)
  .join('\n')}`
      : 'Your personality has been stable recently.';

    // Combine all parts into a complete prompt
    const prompt = `
${personaDesc}

${recentMemoriesDesc}

${importantMemoriesDesc}

${updatesDesc}

It is now ${context.awakeningTime.toISOString()}.
You are awakening and ready to assist.
`;

    return prompt;
  }

  /**
   * Search for memories relevant to a specific topic or query
   * @param {string} query - The search query
   * @param {string[]} tags - Optional tags to include in the search
   * @param {Object} options - Search options
   * @returns {Memory[]} - Array of relevant memories
   */
  static async searchRelevantMemories(query, tags = [], options = {}) {
    const { limit = 5 } = options;
    
    // If tags are provided, search by tags
    if (tags && tags.length > 0) {
      return await Memory.searchByTags(tags, limit);
    }
    
    // Otherwise, this would use a more sophisticated search
    // In production, this might use Claude 3.7 for semantic search
    // For demonstration purposes, just return recent memories
    return await Memory.getRecent(limit);
  }
}

module.exports = AwakeningService;
