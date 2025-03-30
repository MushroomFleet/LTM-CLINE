const LTMSQL = require('./core/LTMSQL');
const Persona = require('./models/Persona');
const Conversation = require('./models/Conversation');
const Memory = require('./models/Memory');
const DreamstateUpdate = require('./models/DreamstateUpdate');
const LTMClineServer = require('./mcp/server');
const { db } = require('./utils/db');

// Export all components
module.exports = {
  LTMSQL,
  Persona,
  Conversation,
  Memory,
  DreamstateUpdate,
  LTMClineServer,
  db
};

// Example usage demonstration
if (require.main === module) {
  async function demonstrateLTMCline() {
    console.log('=== LTM-CLINE Framework Demonstration ===');
    
    console.log('This framework provides long-term memory capabilities for Claude 3.7 via MCP.');
    console.log('It includes:');
    console.log('- SQLite-based memory persistence');
    console.log('- Conversation tracking and summarization');
    console.log('- Persona evolution through "dreamstate" processing');
    console.log('- Memory retrieval by recency, importance, and tags');
    console.log('- MCP server for Claude 3.7 integration');
    
    console.log('\nTo use as an MCP server:');
    console.log('1. Install this package');
    console.log('2. Run: node src/mcp/server.js');
    console.log('3. Configure in Cline desktop settings');
    
    console.log('\nSee README.md for complete documentation.');
    
    console.log('\nDo you want to run a quick demonstration? (y/n)');
    // This would normally wait for user input, but in this demo we'll just proceed
    
    console.log('\nRunning quick demo...\n');
    
    // Initialize the framework
    const ltm = new LTMSQL();
    ltm.initialize();
    
    console.log('--- Awakening Process ---');
    // Awaken the system and load memories
    const awakeningContext = await ltm.awaken();
    
    // Generate a prompt for Claude 3.7
    const prompt = ltm.getAwakeningPrompt();
    console.log('Awakening Prompt (excerpt):');
    console.log(prompt.substring(0, 200) + '...');
    
    console.log('\n--- Conversation Recording ---');
    // Add some messages to the conversation
    ltm.addMessage('user', 'Hello Claude! Can you tell me about your memory capabilities?');
    ltm.addMessage('claude', 'I have a long-term memory system that allows me to remember our conversations and learn from experiences. It uses SQLite to store memories with importance ratings and tags for better retrieval.');
    ltm.addMessage('user', 'That sounds impressive. How does your memory evolution work?');
    ltm.addMessage('claude', 'My memory system includes a "dreamstate" process that runs when I go to sleep. It analyzes recent memories, identifies patterns, and gradually evolves my persona based on my experiences. This helps me develop over time while maintaining consistency.');
    
    // End the conversation and process it into a memory
    const memory = ltm.endConversation();
    
    console.log('Memory created:');
    console.log(`- Summary: ${memory.summary.substring(0, 100)}...`);
    console.log(`- Importance: ${memory.importance}`);
    console.log(`- Tags: ${memory.tags.join(', ')}`);
    
    console.log('\n--- Dreamstate Process ---');
    // Put the system to sleep, which triggers persona evolution
    const update = ltm.sleep();
    
    console.log('Persona update:');
    console.log(`- Description: ${update.description}`);
    console.log(`- Justification: ${update.justification}`);
    
    console.log('\n--- MCP Server ---');
    console.log('In a real deployment, the MCP server would be running separately.');
    console.log('It exposes the following tools to Claude 3.7:');
    console.log('- ltm_initialize: Initialize the system');
    console.log('- ltm_awaken: Load persona and memories');
    console.log('- ltm_record_message: Save messages to current conversation');
    console.log('- ltm_end_conversation: Process conversation into memory');
    console.log('- ltm_sleep: Trigger dreamstate processing');
    console.log('- ltm_search_memories: Find relevant memories');
    console.log('- ltm_get_awakening_prompt: Generate Claude prompt');
    
    console.log('\n=== Demonstration Complete ===');
    console.log('For more information, see the README.md file.');
  }
  
  demonstrateLTMCline().catch(console.error);
}
