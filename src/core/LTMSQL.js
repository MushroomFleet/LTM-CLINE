const Persona = require('../models/Persona');
const Conversation = require('../models/Conversation');
const Memory = require('../models/Memory');
const DreamstateUpdate = require('../models/DreamstateUpdate');
const MemoryProcessor = require('../services/MemoryProcessor');
const PersonaEvolver = require('../services/PersonaEvolver');
const AwakeningService = require('../services/AwakeningService');

/**
 * Main LTM-SQL class that provides the primary interface to the framework
 * This class manages the lifecycle of awakening, conversation, and sleeping/dreamstate
 */
class LTMSQL {
  constructor(options = {}) {
    this.options = {
      recentMemoriesLimit: 5,
      importantMemoriesThreshold: 8,
      importantMemoriesLimit: 5,
      ...options
    };
    
    this.persona = null;
    this.currentConversation = null;
    this.awakeningContext = null;
    this.isAwake = false;
  }

  /**
   * Initialize the system and ensure database is set up
   */
  async initialize() {
    // Ensure a persona exists
    this.persona = await Persona.ensureExists();
    console.log(`Initialized with persona ID: ${this.persona.personaId}`);
    return this;
  }

  /**
   * Awaken the system - load persona and relevant memories
   * @param {Object} options - Awakening options
   * @returns {Object} - Awakening context
   */
  async awaken(options = {}) {
    if (this.isAwake) {
      console.warn('System is already awake');
      return this.awakeningContext;
    }

    const awakeningOptions = {
      ...this.options,
      ...options
    };

    // Load persona and memories
    this.awakeningContext = await AwakeningService.awaken(awakeningOptions);
    this.isAwake = true;

    // Start a new conversation
    this.startConversation(['user', 'claude']);

    console.log('System awakened successfully');
    return this.awakeningContext;
  }

  /**
   * Generate an awakening prompt for Claude 3.7
   * @returns {string} - The generated prompt
   */
  getAwakeningPrompt() {
    if (!this.isAwake || !this.awakeningContext) {
      throw new Error('System is not awake. Call awaken() first');
    }

    return AwakeningService.generateAwakeningPrompt(this.awakeningContext);
  }

  /**
   * Start a new conversation
   * @param {string[]} participants - Array of participant identifiers
   * @param {string} context - Optional context for the conversation
   * @returns {Conversation} - The new conversation
   */
  async startConversation(participants = ['user', 'claude'], context = '') {
    if (this.currentConversation) {
      console.warn('Ending existing conversation before starting a new one');
      await this.endConversation();
    }

    this.currentConversation = new Conversation(
      null, // Generate new ID
      new Date(),
      null,
      participants,
      '',
      context
    );

    await this.currentConversation.save();
    console.log(`Started conversation ID: ${this.currentConversation.conversationId}`);
    
    return this.currentConversation;
  }

  /**
   * Add a message to the current conversation
   * @param {string} role - The role of the message sender (e.g., 'user', 'claude')
   * @param {string} content - The content of the message
   * @returns {Conversation} - The updated conversation
   */
  async addMessage(role, content) {
    if (!this.currentConversation) {
      throw new Error('No active conversation. Call startConversation() first');
    }

    this.currentConversation.addMessage(role, content);
    await this.currentConversation.save();
    
    return this.currentConversation;
  }

  /**
   * End the current conversation and process it into a memory
   * @param {Object} options - Options for processing the conversation
   * @returns {Memory} - The created memory
   */
  async endConversation(options = {}) {
    if (!this.currentConversation) {
      console.warn('No active conversation to end');
      return null;
    }

    // Mark the conversation as ended
    this.currentConversation.end();
    await this.currentConversation.save();
    
    console.log(`Ended conversation ID: ${this.currentConversation.conversationId}`);

    // Process the conversation into a memory
    const memory = await MemoryProcessor.processConversation(this.currentConversation, options);
    
    console.log(`Created memory ID: ${memory.memoryId} from conversation`);

    // Store the conversation reference and reset current conversation
    const conversationRef = this.currentConversation;
    this.currentConversation = null;
    
    return memory;
  }

  /**
   * Put the system to sleep - process recent memories and evolve persona
   * @param {Object} options - Options for the dreamstate process
   * @returns {DreamstateUpdate} - The record of persona changes
   */
  async sleep(options = {}) {
    if (!this.isAwake) {
      console.warn('System is already asleep');
      return null;
    }

    // Ensure any active conversation is ended
    if (this.currentConversation) {
      await this.endConversation();
    }

    // Get recent memories to process
    const recentMemories = await Memory.getRecent(options.recentMemoriesLimit || 10);
    
    // Evolve the persona based on recent experiences
    const dreamstateUpdate = await PersonaEvolver.evolveDreamstate(
      this.persona,
      recentMemories,
      options
    );
    
    // Reset awakening context and mark as asleep
    this.awakeningContext = null;
    this.isAwake = false;
    
    console.log('System entered sleep state');
    console.log(`Created dreamstate update ID: ${dreamstateUpdate.updateId}`);
    
    return dreamstateUpdate;
  }

  /**
   * Search for memories relevant to a query
   * @param {string} query - The search query
   * @param {string[]} tags - Optional tags to include in the search
   * @param {Object} options - Search options
   * @returns {Memory[]} - Array of relevant memories
   */
  async searchMemories(query, tags = [], options = {}) {
    return await AwakeningService.searchRelevantMemories(query, tags, options);
  }

  /**
   * Get the current persona
   * @returns {Persona} - The current persona
   */
  async getPersona() {
    return this.persona || await Persona.loadMostRecent();
  }

  /**
   * Get recent memories
   * @param {number} limit - Maximum number of memories to retrieve
   * @returns {Memory[]} - Array of recent memories
   */
  async getRecentMemories(limit = 5) {
    return await Memory.getRecent(limit);
  }

  /**
   * Get important memories
   * @param {number} threshold - Importance threshold (1-10)
   * @param {number} limit - Maximum number of memories to retrieve
   * @returns {Memory[]} - Array of important memories
   */
  async getImportantMemories(threshold = 7, limit = 5) {
    return await Memory.getImportant(threshold, limit);
  }

  /**
   * Get recent persona updates
   * @param {number} limit - Maximum number of updates to retrieve
   * @returns {DreamstateUpdate[]} - Array of recent updates
   */
  async getRecentUpdates(limit = 3) {
    return await DreamstateUpdate.getRecent(limit);
  }

  /**
   * Get the current conversation status
   * @returns {Object} - Current conversation status
   */
  getStatus() {
    return {
      isAwake: this.isAwake,
      hasActiveConversation: !!this.currentConversation,
      personaId: this.persona ? this.persona.personaId : null,
      conversationId: this.currentConversation ? this.currentConversation.conversationId : null,
      lastUpdated: new Date()
    };
  }
}

module.exports = LTMSQL;
