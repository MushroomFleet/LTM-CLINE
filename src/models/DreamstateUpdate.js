const { db, runAsync, getAsync, allAsync } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

class DreamstateUpdate {
  constructor(updateId = null, personaId = null, description = '', justification = '', 
              previousState = {}, newState = {}, timestamp = null) {
    this.updateId = updateId || uuidv4();
    this.personaId = personaId;
    this.description = description;
    this.justification = justification;
    this.previousState = typeof previousState === 'string' ? JSON.parse(previousState) : previousState;
    this.newState = typeof newState === 'string' ? JSON.parse(newState) : newState;
    this.timestamp = timestamp || new Date();
  }

  // Save dreamstate update to database
  async save() {
    await runAsync(
      `INSERT OR REPLACE INTO dreamstate_updates (
        update_id, persona_id, description, justification, previous_state, new_state, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        this.updateId,
        this.personaId,
        this.description,
        this.justification,
        JSON.stringify(this.previousState),
        JSON.stringify(this.newState),
        this.timestamp.toISOString()
      ]
    );

    return this;
  }

  // Load dreamstate update from database
  static async load(updateId) {
    const row = await getAsync('SELECT * FROM dreamstate_updates WHERE update_id = ?', [updateId]);

    if (!row) {
      return null;
    }

    return new DreamstateUpdate(
      row.update_id,
      row.persona_id,
      row.description,
      row.justification,
      row.previous_state,
      row.new_state,
      new Date(row.timestamp)
    );
  }

  // Get updates for a specific persona
  static async getByPersona(personaId, limit = 10) {
    const rows = await allAsync(
      'SELECT * FROM dreamstate_updates WHERE persona_id = ? ORDER BY timestamp DESC LIMIT ?',
      [personaId, limit]
    );

    return rows.map(row => new DreamstateUpdate(
      row.update_id,
      row.persona_id,
      row.description,
      row.justification,
      row.previous_state,
      row.new_state,
      new Date(row.timestamp)
    ));
  }

  // Get recent updates
  static async getRecent(limit = 5) {
    const rows = await allAsync(
      'SELECT * FROM dreamstate_updates ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );

    return rows.map(row => new DreamstateUpdate(
      row.update_id,
      row.persona_id,
      row.description,
      row.justification,
      row.previous_state,
      row.new_state,
      new Date(row.timestamp)
    ));
  }

  // Compare previous and new states to generate a diff
  getDiff() {
    const diff = {
      traits: {},
      values: {},
      preferences: {},
      biography: null
    };

    // Compare traits
    if (this.previousState.traits && this.newState.traits) {
      Object.keys(this.newState.traits).forEach(trait => {
        if (this.previousState.traits[trait] !== this.newState.traits[trait]) {
          diff.traits[trait] = {
            previous: this.previousState.traits[trait],
            new: this.newState.traits[trait]
          };
        }
      });
    }

    // Compare values
    if (this.previousState.values && this.newState.values) {
      Object.keys(this.newState.values).forEach(value => {
        if (this.previousState.values[value] !== this.newState.values[value]) {
          diff.values[value] = {
            previous: this.previousState.values[value],
            new: this.newState.values[value]
          };
        }
      });
    }

    // Compare preferences
    if (this.previousState.preferences && this.newState.preferences) {
      Object.keys(this.newState.preferences).forEach(pref => {
        if (this.previousState.preferences[pref] !== this.newState.preferences[pref]) {
          diff.preferences[pref] = {
            previous: this.previousState.preferences[pref],
            new: this.newState.preferences[pref]
          };
        }
      });
    }

    // Compare biography
    if (this.previousState.biography !== this.newState.biography) {
      diff.biography = {
        previous: this.previousState.biography,
        new: this.newState.biography
      };
    }

    return diff;
  }
}

module.exports = DreamstateUpdate;
