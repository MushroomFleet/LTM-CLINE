const { db, runAsync, getAsync, allAsync } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

class Memory {
  constructor(memoryId = null, conversationId = null, summary = '', importance = 5, timestamp = null, tags = []) {
    this.memoryId = memoryId || uuidv4();
    this.conversationId = conversationId;
    this.summary = summary;
    this.importance = Math.min(Math.max(importance, 1), 10); // Ensure importance is between 1-10
    this.timestamp = timestamp || new Date();
    this.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
  }

  // Save memory to database
  async save() {
    await runAsync(
      `INSERT OR REPLACE INTO memories (
        memory_id, conversation_id, summary, importance, timestamp, tags
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.memoryId,
        this.conversationId,
        this.summary,
        this.importance,
        this.timestamp.toISOString(),
        JSON.stringify(this.tags)
      ]
    );

    return this;
  }

  // Load memory from database
  static async load(memoryId) {
    const row = await getAsync('SELECT * FROM memories WHERE memory_id = ?', [memoryId]);

    if (!row) {
      return null;
    }

    return new Memory(
      row.memory_id,
      row.conversation_id,
      row.summary,
      row.importance,
      new Date(row.timestamp),
      row.tags
    );
  }

  // Get memories by conversation ID
  static async getByConversation(conversationId) {
    const rows = await allAsync(
      'SELECT * FROM memories WHERE conversation_id = ? ORDER BY timestamp DESC',
      [conversationId]
    );

    return rows.map(row => new Memory(
      row.memory_id,
      row.conversation_id,
      row.summary,
      row.importance,
      new Date(row.timestamp),
      row.tags
    ));
  }

  // Get recent memories
  static async getRecent(limit = 10) {
    const rows = await allAsync(
      'SELECT * FROM memories ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );

    return rows.map(row => new Memory(
      row.memory_id,
      row.conversation_id,
      row.summary,
      row.importance,
      new Date(row.timestamp),
      row.tags
    ));
  }

  // Get important memories
  static async getImportant(threshold = 7, limit = 10) {
    const rows = await allAsync(
      'SELECT * FROM memories WHERE importance >= ? ORDER BY importance DESC, timestamp DESC LIMIT ?',
      [threshold, limit]
    );

    return rows.map(row => new Memory(
      row.memory_id,
      row.conversation_id,
      row.summary,
      row.importance,
      new Date(row.timestamp),
      row.tags
    ));
  }

  // Search memories by tags
  static async searchByTags(tags, limit = 10) {
    // Search for memories that contain ANY of the provided tags
    const tagMatches = [];
    
    for (const tag of tags) {
      const rows = await allAsync(
        "SELECT * FROM memories WHERE tags LIKE ?",
        [`%${tag}%`]
      );
      tagMatches.push(...rows);
    }

    // Remove duplicates and sort by importance and recency
    const uniqueIds = new Set();
    const uniqueMemories = [];
    
    tagMatches.forEach(row => {
      if (!uniqueIds.has(row.memory_id)) {
        uniqueIds.add(row.memory_id);
        uniqueMemories.push(row);
      }
    });
    
    // Sort by importance (descending) and then by timestamp (descending)
    uniqueMemories.sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Limit the number of results
    const limitedMemories = uniqueMemories.slice(0, limit);
    
    return limitedMemories.map(row => new Memory(
      row.memory_id,
      row.conversation_id,
      row.summary,
      row.importance,
      new Date(row.timestamp),
      row.tags
    ));
  }

  // Update memory importance
  updateImportance(newImportance) {
    this.importance = Math.min(Math.max(newImportance, 1), 10);
    return this;
  }

  // Add tags to memory
  addTags(newTags) {
    if (!Array.isArray(newTags)) {
      newTags = [newTags];
    }
    
    // Only add tags that don't already exist
    newTags.forEach(tag => {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    });
    
    return this;
  }
}

module.exports = Memory;
