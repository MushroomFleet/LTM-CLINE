const { db, runAsync, getAsync, allAsync } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

class Persona {
  constructor(personaId = null, traits = {}, values = {}, preferences = {}, biography = '') {
    this.personaId = personaId || uuidv4();
    this.traits = typeof traits === 'string' ? JSON.parse(traits) : traits;
    this.values = typeof values === 'string' ? JSON.parse(values) : values;
    this.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    this.biography = biography;
    this.lastUpdated = new Date();
  }

  // Save persona to database
  async save() {
    await runAsync(
      `INSERT OR REPLACE INTO persona (
        persona_id, traits, "values", preferences, biography, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.personaId,
        JSON.stringify(this.traits),
        JSON.stringify(this.values),
        JSON.stringify(this.preferences),
        this.biography,
        this.lastUpdated.toISOString()
      ]
    );

    return this;
  }

  // Load persona from database
  static async load(personaId) {
    const row = await getAsync('SELECT persona_id, traits, "values", preferences, biography, last_updated FROM persona WHERE persona_id = ?', [personaId]);

    if (!row) {
      return null;
    }

    return new Persona(
      row.persona_id,
      row.traits,
      row.values,
      row.preferences,
      row.biography
    );
  }

  // Get the most recently updated persona
  static async loadMostRecent() {
    const row = await getAsync('SELECT persona_id, traits, "values", preferences, biography, last_updated FROM persona ORDER BY last_updated DESC LIMIT 1');

    if (!row) {
      return null;
    }

    return new Persona(
      row.persona_id,
      row.traits,
      row.values,
      row.preferences,
      row.biography
    );
  }

  // Create default persona if none exists
  static async createDefault() {
    const defaultPersona = new Persona(
      uuidv4(),
      {
        openness: 0.7,
        conscientiousness: 0.8,
        extraversion: 0.6,
        agreeableness: 0.75,
        neuroticism: 0.4
      },
      {
        honesty: 0.9,
        helpfulness: 0.85,
        knowledge: 0.8,
        efficiency: 0.75
      },
      {
        communicationStyle: 'clear and concise',
        responseFormat: 'structured',
        interactionPreference: 'friendly professional'
      },
      'I am Claude 3.7, an AI assistant designed to be helpful, harmless, and honest. I value clarity, accuracy, and providing useful information tailored to users\' needs.'
    );

    return defaultPersona.save();
  }

  // Ensure a persona exists
  static async ensureExists() {
    const persona = await this.loadMostRecent();
    if (!persona) {
      return await this.createDefault();
    }
    return persona;
  }

  // Update persona traits
  updateTraits(newTraits) {
    this.traits = { ...this.traits, ...newTraits };
    this.lastUpdated = new Date();
    return this;
  }
  
  // Update persona values
  updateValues(newValues) {
    this.values = { ...this.values, ...newValues };
    this.lastUpdated = new Date();
    return this;
  }

  // Update persona preferences
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.lastUpdated = new Date();
    return this;
  }

  // Update biography
  updateBiography(newBiography) {
    this.biography = newBiography;
    this.lastUpdated = new Date();
    return this;
  }
}

module.exports = Persona;
