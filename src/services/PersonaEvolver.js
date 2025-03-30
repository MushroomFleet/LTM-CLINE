const Persona = require('../models/Persona');
const Memory = require('../models/Memory');
const DreamstateUpdate = require('../models/DreamstateUpdate');

/**
 * Service responsible for evolving the AI's persona based on experiences
 * This implements the "Dreamstate" process that runs before the AI goes to sleep
 */
class PersonaEvolver {
  /**
   * Process recent memories and evolve the persona based on new experiences
   * @param {Persona} persona - The current persona
   * @param {Memory[]} recentMemories - Array of recent memories to process
   * @param {Object} options - Processing options
   * @returns {DreamstateUpdate} - The record of persona changes
   */
  static async evolveDreamstate(persona, recentMemories = [], options = {}) {
    if (!persona) {
      throw new Error('Persona cannot be null');
    }

    // Store the previous state
    const previousState = {
      traits: { ...persona.traits },
      values: { ...persona.values },
      preferences: { ...persona.preferences },
      biography: persona.biography
    };

    // Process memories to identify potential persona changes
    const changes = this.identifyPersonaChanges(persona, recentMemories, options);

    // Apply the changes to the persona
    if (changes.traits) {
      persona.updateTraits(changes.traits);
    }
    
    if (changes.values) {
      persona.updateValues(changes.values);
    }
    
    if (changes.preferences) {
      persona.updatePreferences(changes.preferences);
    }
    
    if (changes.biography) {
      persona.updateBiography(changes.biography);
    }

    // Save the updated persona
    await persona.save();

    // Create and save a record of the dreamstate update
    const newState = {
      traits: { ...persona.traits },
      values: { ...persona.values },
      preferences: { ...persona.preferences },
      biography: persona.biography
    };

    const update = new DreamstateUpdate(
      null,                // Generate new ID
      persona.personaId,
      changes.description || 'Persona evolved based on recent experiences',
      changes.justification || 'Automatic evolution from dreamstate processing',
      previousState,
      newState
    );

    return await update.save();
  }

  /**
   * Identify potential persona changes based on memories
   * In a real implementation, this would likely use Claude 3.7 to analyze memories
   * @param {Persona} persona - The current persona
   * @param {Memory[]} memories - Memories to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} - Suggested changes to the persona
   */
  static identifyPersonaChanges(persona, memories, options = {}) {
    // This is a placeholder implementation
    // In production, Claude 3.7 would analyze memories and suggest changes
    
    // If no memories are provided, return no changes
    if (!memories || memories.length === 0) {
      return {
        description: 'No changes made due to lack of new experiences',
        justification: 'No recent memories to process',
        traits: {},
        values: {},
        preferences: {},
        biography: null
      };
    }

    // Initialize changes object
    const changes = {
      description: 'Persona evolved based on recent experiences',
      justification: '',
      traits: {},
      values: {},
      preferences: {},
      biography: null
    };

    // Simple heuristics for demonstration purposes
    
    // 1. Look at memory importance
    const highImportanceMemories = memories.filter(memory => memory.importance >= 8);
    const significantExperience = highImportanceMemories.length > 0;
    
    // 2. Count common tags across memories
    const tagCounts = {};
    memories.forEach(memory => {
      memory.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // Find most frequent tags
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    // 3. Generate justification
    changes.justification = `Based on ${memories.length} recent memories`;
    if (highImportanceMemories.length > 0) {
      changes.justification += `, including ${highImportanceMemories.length} high-importance experiences`;
    }
    
    // 4. Apply simple rules to evolve persona
    
    // Example: If there are high importance memories, slightly increase conscientiousness
    if (significantExperience && persona.traits.conscientiousness < 0.9) {
      changes.traits.conscientiousness = Math.min(1.0, persona.traits.conscientiousness + 0.05);
    }
    
    // Example: If the most common tag is "error" or "problem", increase neuroticism slightly
    if (sortedTags.includes('error') || sortedTags.includes('problem')) {
      if (persona.traits.neuroticism < 0.8) {
        changes.traits.neuroticism = Math.min(0.8, persona.traits.neuroticism + 0.03);
      }
    }
    
    // Example: If the most common tag is "solution" or "help", increase agreeableness
    if (sortedTags.includes('solution') || sortedTags.includes('help')) {
      if (persona.traits.agreeableness < 0.95) {
        changes.traits.agreeableness = Math.min(0.95, persona.traits.agreeableness + 0.02);
        changes.values.helpfulness = Math.min(1.0, persona.values.helpfulness + 0.01);
      }
    }
    
    // Example: Update biography with recent significant experiences
    if (significantExperience) {
      // In a real implementation, this would be generated by Claude 3.7
      const mostImportantMemory = highImportanceMemories[0];
      changes.biography = persona.biography + ` Recently, I ${mostImportantMemory.summary.toLowerCase()}`;
    }
    
    return changes;
  }
}

module.exports = PersonaEvolver;
