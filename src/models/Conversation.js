const { db, runAsync, getAsync, allAsync } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

class Conversation {
  constructor(conversationId = null, startTime = null, endTime = null, participants = [], rawText = '', context = '') {
    this.conversationId = conversationId || uuidv4();
    this.startTime = startTime || new Date();
    this.endTime = endTime;
    this.participants = Array.isArray(participants) ? participants : JSON.parse(participants);
    this.rawText = rawText;
    this.context = context;
    this.messages = [];
  }

  // Add a message to the conversation
  addMessage(role, content) {
    this.messages.push({ role, content, timestamp: new Date() });
    this.rawText += `${role}: ${content}\n`;
    return this;
  }

  // Mark conversation as ended
  end() {
    this.endTime = new Date();
    return this;
  }

  // Save conversation to database
  async save() {
    await runAsync(
      `INSERT OR REPLACE INTO conversations (
        conversation_id, start_time, end_time, participants, raw_text, context
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.conversationId,
        this.startTime.toISOString(),
        this.endTime ? this.endTime.toISOString() : null,
        JSON.stringify(this.participants),
        this.rawText,
        this.context
      ]
    );

    return this;
  }

  // Load conversation from database
  static async load(conversationId) {
    const row = await getAsync('SELECT * FROM conversations WHERE conversation_id = ?', [conversationId]);

    if (!row) {
      return null;
    }

    return new Conversation(
      row.conversation_id,
      new Date(row.start_time),
      row.end_time ? new Date(row.end_time) : null,
      row.participants,
      row.raw_text,
      row.context
    );
  }

  // Get all conversations
  static async getAll() {
    const rows = await allAsync('SELECT * FROM conversations ORDER BY start_time DESC');

    return rows.map(row => new Conversation(
      row.conversation_id,
      new Date(row.start_time),
      row.end_time ? new Date(row.end_time) : null,
      row.participants,
      row.raw_text,
      row.context
    ));
  }

  // Get recent conversations
  static async getRecent(limit = 5) {
    const rows = await allAsync('SELECT * FROM conversations ORDER BY start_time DESC LIMIT ?', [limit]);

    return rows.map(row => new Conversation(
      row.conversation_id,
      new Date(row.start_time),
      row.end_time ? new Date(row.end_time) : null,
      row.participants,
      row.raw_text,
      row.context
    ));
  }

  // Extract the full text content
  getFullText() {
    return this.rawText;
  }

  // Get conversation duration in minutes
  getDuration() {
    if (!this.endTime) {
      return null;
    }
    
    const durationMs = this.endTime.getTime() - this.startTime.getTime();
    return durationMs / (1000 * 60); // Convert to minutes
  }
}

module.exports = Conversation;
