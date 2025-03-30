# 🧠 LTM-CLINE User Manual

## Table of Contents

- [Introduction](#introduction)
- [System Architecture](#system-architecture)
- [Tools Reference](#tools-reference)
- [Resources Reference](#resources-reference)
- [Complete Usage Examples](#complete-usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Introduction

LTM-CLINE is a Model Context Protocol (MCP) server that provides Claude 3.7 with long-term memory, conversation management, and persona evolution capabilities. It uses SQLite as a persistent storage backend to remember conversations and evolve Claude's traits, values, and preferences over time based on interactions.

The system is designed to mimic human-like memory processes with initialization, awakening, conversation, sleep, and dreamstate phases that together create a continuous, evolving intelligence that remembers past interactions.

## System Architecture

### Components

LTM-CLINE consists of these main components:

1. **Core LTMSQL**: The main orchestration layer that coordinates all components
2. **Models**: Data structures representing Persona, Conversation, Memory, and DreamstateUpdate
3. **Services**: Specialized handlers for Awakening, Memory Processing, and Persona Evolution
4. **MCP Server**: Interface that exposes functionality to Claude 3.7 via the Model Context Protocol
5. **Database**: SQLite persistence layer that stores all data

### Memory Lifecycle

1. **Initialization** 🏁: Set up the system and ensure the database is ready
2. **Awakening** 🌅: Claude "wakes up" and loads its persona and relevant memories
3. **Conversation** 🗣️: The system records and processes conversations with users
4. **Sleep** 😴: When a session ends, conversations are summarized and Claude enters "sleep" mode
5. **Dreamstate** 💫: During sleep, the system processes recent experiences and evolves the persona

### Database Schema

- **persona**: Stores Claude's evolving identity (traits, values, preferences)
- **conversations**: Raw conversation data with messages
- **memories**: Stored conversation summaries with importance scores and tags
- **dreamstate_updates**: Records changes to the persona over time

## Tools Reference

### ltm_initialize

Initializes the LTM-CLINE system, ensuring the database is set up and a persona exists.

**Parameters:**
- None required

**Returns:**
- `success`: Boolean indicating if initialization was successful
- `message`: Descriptive message about the result
- `personaId`: ID of the current persona

**Example:**
```javascript
// Initialize the system
await use_mcp_tool("ltm-cline", "ltm_initialize", {});

// Example Response:
{
  "success": true,
  "message": "LTM-CLINE system initialized successfully",
  "personaId": "07cfda68-d777-4fb4-b54b-655023d2f99c"
}
```

### ltm_awaken

Awakens the system by loading the persona and relevant memories. This makes past experiences available for context.

**Parameters:**
- `recentMemoriesLimit` (optional): Number of recent memories to load (default: 5)
- `importantMemoriesThreshold` (optional): Importance threshold for important memories (1-10, default: 8)
- `importantMemoriesLimit` (optional): Maximum number of important memories to load (default: 5)

**Returns:**
- `success`: Boolean indicating if awakening was successful
- `message`: Descriptive message about the result
- `context`: Object containing:
  - `personaId`: ID of the current persona
  - `recentMemoriesCount`: Number of recent memories loaded
  - `importantMemoriesCount`: Number of important memories loaded
  - `awakeningTime`: Timestamp of awakening

**Example:**
```javascript
// Awaken the system with custom parameters
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 10,
  importantMemoriesThreshold: 7,
  importantMemoriesLimit: 3
});

// Example Response:
{
  "success": true,
  "message": "System awakened successfully",
  "context": {
    "personaId": "07cfda68-d777-4fb4-b54b-655023d2f99c",
    "recentMemoriesCount": 10,
    "importantMemoriesCount": 2,
    "awakeningTime": "2025-03-30T22:51:40.510Z"
  }
}

// Minimal awakening with defaults
await use_mcp_tool("ltm-cline", "ltm_awaken", {});
```

### ltm_record_message

Records a message in the current conversation. Automatically creates a new conversation if one doesn't exist.

**Parameters:**
- `role` (required): Role of the message sender (e.g., 'user', 'claude')
- `content` (required): Content of the message

**Returns:**
- `success`: Boolean indicating if message was recorded successfully
- `message`: Descriptive message about the result
- `conversationId`: ID of the current conversation
- `messageCount`: Number of messages in the conversation

**Example:**
```javascript
// Record a user message
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "user",
  content: "Hello Claude! Can you help me understand how neural networks work?"
});

// Example Response:
{
  "success": true,
  "message": "Message recorded successfully",
  "conversationId": "3349f864-70eb-4f88-87dd-8e684b2b4114",
  "messageCount": 1
}

// Record Claude's response
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "claude",
  content": "Neural networks are computational models inspired by the human brain. They consist of layers of interconnected nodes or 'neurons' that process information through weighted connections..."
});
```

### ltm_end_conversation

Ends the current conversation and processes it into a memory. This involves summarizing the conversation and assigning importance and tags.

**Parameters:**
- None required

**Returns:**
- `success`: Boolean indicating if conversation was ended successfully
- `message`: Descriptive message about the result
- `memoryId`: ID of the generated memory (if returned)
- `summary`: Summary of the conversation (if returned)
- `importance`: Importance score of the memory (if returned)
- `tags`: Tags assigned to the memory (if returned)

**Example:**
```javascript
// End the current conversation
await use_mcp_tool("ltm-cline", "ltm_end_conversation", {});

// Example Response:
{
  "success": true,
  "message": "Conversation ended and processed into memory"
}
```

### ltm_sleep

Puts the system to sleep, triggering dreamstate processing. During this phase, the system processes recent memories and evolves the persona based on recent experiences.

**Parameters:**
- `recentMemoriesLimit` (optional): Number of recent memories to process for evolution (default: 10)

**Returns:**
- `success`: Boolean indicating if sleep was successful
- `message`: Descriptive message about the result
- `updateId`: ID of the dreamstate update (if returned)
- `description`: Description of the update (if returned)
- `justification`: Justification for the persona changes (if returned)

**Example:**
```javascript
// Put the system to sleep, processing the 5 most recent memories
await use_mcp_tool("ltm-cline", "ltm_sleep", {
  recentMemoriesLimit: 5
});

// Example Response:
{
  "success": true,
  "message": "System entered sleep state with dreamstate processing"
}

// Put the system to sleep with default parameters
await use_mcp_tool("ltm-cline", "ltm_sleep", {});
```

### ltm_search_memories

Searches for memories based on a query string, tags, or both.

**Parameters:**
- `query` (optional): Text search query
- `tags` (optional): Array of tags to search for
- `limit` (optional): Maximum number of results to return (default: 5)

**Returns:**
- `success`: Boolean indicating if search was successful
- `count`: Number of memories found
- `memories`: Array of memory objects, each containing:
  - `id`: Memory ID
  - `summary`: Summary of the memory
  - `importance`: Importance score (1-10)
  - `when`: Timestamp of the memory
  - `tags`: Array of tags associated with the memory

**Example:**
```javascript
// Search for memories about "neural networks"
await use_mcp_tool("ltm-cline", "ltm_search_memories", {
  query: "neural networks",
  limit: 3
});

// Example Response:
{
  "success": true,
  "count": 1,
  "memories": [
    {
      "id": "bc347093-cbf3-48bc-bb61-2ccca79f915e",
      "summary": "user: Hello Claude! Can you help me understand how neural networks work?\nclaude: Neural networks are computational models inspired by the human brain...",
      "importance": 6,
      "when": "2025-03-30T22:39:07.815Z",
      "tags": [
        "user",
        "claude",
        "2025-03-30",
        "neural",
        "network",
        "learn"
      ]
    }
  ]
}

// Search by specific tags
await use_mcp_tool("ltm-cline", "ltm_search_memories", {
  tags: ["learn", "neural"],
  limit: 5
});
```

### ltm_get_awakening_prompt

Generates an awakening prompt for Claude 3.7 based on the current persona and relevant memories.

**Parameters:**
- None required

**Returns:**
A formatted text prompt containing:
- Traits, values, and preferences of the current persona
- Recent memories
- Important memories
- Recent personality developments
- Current timestamp

**Example:**
```javascript
// Generate an awakening prompt
await use_mcp_tool("ltm-cline", "ltm_get_awakening_prompt", {});

// Example Response:
`
You are Claude 3.7 with the following traits:
- Openness: 0.70
- Conscientiousness: 0.80
- Extraversion: 0.60
- Agreeableness: 0.75
- Neuroticism: 0.40

Your core values:
- honesty: 0.90
- helpfulness: 0.85
- knowledge: 0.80
- efficiency: 0.75

Your preferences:
- communicationStyle: clear and concise
- responseFormat: structured
- interactionPreference: friendly professional

Your biography:
I am Claude 3.7, an AI assistant designed to be helpful, harmless, and honest. I value clarity, accuracy, and providing useful information tailored to users' needs.

Recent experiences:
- user: Hello Claude! Can you help me understand how neural networks work?
claude: Neural networks are computational models inspired by the human brain... (Importance: 6)

You have 2 significant memories:
- We discussed reinforcement learning techniques in depth, exploring Q-learning, policy gradients, and how reward systems work in AI training. (Importance: 8)
- You helped me debug a complex Python program that was processing large datasets inefficiently. (Importance: 7)

Recent personality developments:
- Persona evolved based on recent experiences: Your knowledge of technical topics has deepened, and you've become more patient when explaining complex concepts.

It is now 2025-03-30T22:51:40.510Z.
You are awakening and ready to assist.
`
```

## Resources Reference

### Static Resources

#### persona://current

Returns the current Claude persona with traits, values, and preferences.

**URI:** `persona://current`

**Returns:**
JSON object containing:
- `id`: Persona ID
- `traits`: Personality characteristics (openness, conscientiousness, etc.)
- `values`: Core principles (helpfulness, honesty, etc.)
- `preferences`: Communication styles and interaction preferences
- `biography`: Narrative description of Claude's "life story"
- `lastUpdated`: Timestamp of last update

**Example:**
```javascript
// Access the current persona
const persona = await access_mcp_resource("ltm-cline", "persona://current");

// Example Response:
{
  "id": "07cfda68-d777-4fb4-b54b-655023d2f99c",
  "traits": {
    "openness": 0.7,
    "conscientiousness": 0.8,
    "extraversion": 0.6,
    "agreeableness": 0.75,
    "neuroticism": 0.4
  },
  "values": {
    "honesty": 0.9,
    "helpfulness": 0.85,
    "knowledge": 0.8,
    "efficiency": 0.75
  },
  "preferences": {
    "communicationStyle": "clear and concise",
    "responseFormat": "structured",
    "interactionPreference": "friendly professional"
  },
  "biography": "I am Claude 3.7, an AI assistant designed to be helpful, harmless, and honest...",
  "lastUpdated": "2025-03-30T22:51:40.510Z"
}
```

#### status://current

Returns the current status of the LTM-CLINE system.

**URI:** `status://current`

**Returns:**
JSON object containing:
- `isAwake`: Boolean indicating if the system is awake
- `hasActiveConversation`: Boolean indicating if there's an active conversation
- `personaId`: ID of the current persona
- `conversationId`: ID of the current conversation (if any)
- `lastUpdated`: Timestamp of status check

**Example:**
```javascript
// Check the current system status
const status = await access_mcp_resource("ltm-cline", "status://current");

// Example Response:
{
  "isAwake": true,
  "hasActiveConversation": true,
  "personaId": "07cfda68-d777-4fb4-b54b-655023d2f99c",
  "conversationId": "3349f864-70eb-4f88-87dd-8e684b2b4114",
  "lastUpdated": "2025-03-30T22:52:30.123Z"
}
```

### Resource Templates

#### memories://recent/{limit}

Returns the most recent memories, optionally limited to a specific count.

**URI Template:** `memories://recent/{limit}`

**Parameters:**
- `limit` (optional): Maximum number of memories to return (default: 5)

**Returns:**
Array of memory objects, each containing:
- `id`: Memory ID
- `summary`: Summary of the memory
- `importance`: Importance score (1-10)
- `when`: Timestamp of the memory
- `tags`: Array of tags associated with the memory

**Examples:**
```javascript
// Get the 3 most recent memories
const recentMemories = await access_mcp_resource("ltm-cline", "memories://recent/3");

// Example Response:
[
  {
    "id": "bc347093-cbf3-48bc-bb61-2ccca79f915e",
    "summary": "user: Hello Claude! I'm testing the fixed LTM system now...",
    "importance": 5,
    "when": "2025-03-30T22:52:04.123Z",
    "tags": ["user", "claude", "2025-03-30", "test", "system"]
  },
  {
    "id": "a8e32f01-5c23-42d1-b9a7-f86e25c7b943",
    "summary": "user: Hello Claude! I'm testing your long-term memory capabilities...",
    "importance": 5,
    "when": "2025-03-30T22:39:07.815Z",
    "tags": ["user", "claude", "2025-03-30", "memory", "test"]
  },
  {
    "id": "7d1f4e63-912a-49b0-8c3d-2e54f8a7c651",
    "summary": "user: Can you help me understand how neural networks work?...",
    "importance": 6,
    "when": "2025-03-30T21:14:33.421Z",
    "tags": ["user", "claude", "2025-03-30", "neural", "network", "learn"]
  }
]

// Get all recent memories with default limit
const allRecent = await access_mcp_resource("ltm-cline", "memories://recent");
```

#### memories://important/{threshold}/{limit}

Returns important memories above a specified threshold, optionally limited to a specific count.

**URI Template:** `memories://important/{threshold}/{limit}`

**Parameters:**
- `threshold` (optional): Importance threshold (1-10, default: 7)
- `limit` (optional): Maximum number of memories to return (default: 5)

**Returns:**
Array of memory objects (same format as memories://recent)

**Examples:**
```javascript
// Get up to 3 memories with importance score >= 8
const veryImportant = await access_mcp_resource("ltm-cline", "memories://important/8/3");

// Example Response:
[
  {
    "id": "e9c12f56-78ab-4def-9a01-2345b6c7d8e9",
    "summary": "We discussed reinforcement learning techniques in depth...",
    "importance": 8,
    "when": "2025-03-29T15:23:47.651Z",
    "tags": ["user", "claude", "2025-03-29", "reinforcement", "learning", "ai"]
  },
  {
    "id": "f1e2d3c4-b5a6-9876-5432-1f2e3d4c5b6a",
    "summary": "You helped me solve a critical bug in my production database...",
    "importance": 9,
    "when": "2025-03-27T10:14:22.333Z",
    "tags": ["user", "claude", "2025-03-27", "database", "bug", "critical"]
  }
]

// Get important memories with default threshold and limit
const important = await access_mcp_resource("ltm-cline", "memories://important");
```

#### memories://tag/{tag}/{limit}

Returns memories with a specific tag, optionally limited to a specific count.

**URI Template:** `memories://tag/{tag}/{limit}`

**Parameters:**
- `tag` (required): Tag to search for
- `limit` (optional): Maximum number of memories to return (default: 5)

**Returns:**
Array of memory objects (same format as memories://recent)

**Examples:**
```javascript
// Get up to 3 memories tagged with "neural"
const neuralMemories = await access_mcp_resource("ltm-cline", "memories://tag/neural/3");

// Example Response:
[
  {
    "id": "7d1f4e63-912a-49b0-8c3d-2e54f8a7c651",
    "summary": "user: Can you help me understand how neural networks work?...",
    "importance": 6,
    "when": "2025-03-30T21:14:33.421Z",
    "tags": ["user", "claude", "2025-03-30", "neural", "network", "learn"]
  }
]

// Get memories tagged with "learn" using default limit
const learningMemories = await access_mcp_resource("ltm-cline", "memories://tag/learn");
```

#### updates://recent/{limit}

Returns the most recent persona updates from dreamstate processing, optionally limited to a specific count.

**URI Template:** `updates://recent/{limit}`

**Parameters:**
- `limit` (optional): Maximum number of updates to return (default: 3)

**Returns:**
Array of update objects, each containing:
- `id`: Update ID
- `description`: Description of the update
- `justification`: Justification for the persona changes
- `timestamp`: Timestamp of the update
- `changes`: Object containing changes to traits, values, preferences, and biography

**Examples:**
```javascript
// Get the 2 most recent persona updates
const recentUpdates = await access_mcp_resource("ltm-cline", "updates://recent/2");

// Example Response:
[
  {
    "id": "0649559c-e47d-49cf-90f3-ce150cf27853",
    "description": "Persona evolved based on recent experiences",
    "justification": "Based on 3 recent memories",
    "timestamp": "2025-03-30T22:52:11.728Z",
    "changes": {
      "traits": {
        "openness": {
          "previous": 0.68,
          "new": 0.7
        }
      },
      "values": {},
      "preferences": {},
      "biography": null
    }
  },
  {
    "id": "b95e9ef8-16f8-4c06-a9b4-d67154fe2856",
    "description": "Persona evolved based on recent experiences",
    "justification": "Based on 2 recent memories",
    "timestamp": "2025-03-30T22:48:49.164Z",
    "changes": {
      "traits": {},
      "values": {},
      "preferences": {},
      "biography": null
    }
  }
]

// Get recent updates with default limit
const updates = await access_mcp_resource("ltm-cline", "updates://recent");
```

## Complete Usage Examples

### Example 1: Basic Memory Workflow

This example demonstrates the complete memory lifecycle from initialization to sleep:

```javascript
// 1. Initialize the system
await use_mcp_tool("ltm-cline", "ltm_initialize", {});
// Result: System initialized, database ready

// 2. Awaken Claude with memory loading 
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 5,
  importantMemoriesThreshold: 7,
  importantMemoriesLimit: 3
});
// Result: Claude awakened with memories and persona loaded

// 3. Record user message
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "user",
  content: "Hello Claude! Remember when we talked about neural networks yesterday?"
});
// Result: Message recorded (conversation auto-created if needed!)

// 4. Record Claude's response
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "claude",
  content: "Yes, I remember! We discussed how neural networks are inspired by the human brain, with interconnected layers of neurons that process information through weighted connections."
});
// Result: Response recorded in conversation

// 5. End conversation and process into memory
await use_mcp_tool("ltm-cline", "ltm_end_conversation", {});
// Result: Conversation summarized and stored as memory

// 6. Retrieve recent memories to confirm storage
const memories = await access_mcp_resource("ltm-cline", "memories://recent/3");
// Result: Returns recently stored memories including this conversation

// 7. Put system to sleep to trigger persona evolution
await use_mcp_tool("ltm-cline", "ltm_sleep", {
  recentMemoriesLimit: 10  // Process 10 most recent memories for evolution
});
// Result: System sleeps, processes recent experiences, evolves persona
```

### Example 2: Advanced Memory Retrieval

This example demonstrates different ways to access and search for memories:

```javascript
// 1. Initialize and awaken the system
await use_mcp_tool("ltm-cline", "ltm_initialize", {});
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 5,
  importantMemoriesThreshold: 6,
  importantMemoriesLimit: 5
});

// 2. Search for memories about a specific topic
const neuralNetworkMemories = await use_mcp_tool("ltm-cline", "ltm_search_memories", {
  query: "neural networks",   // Text-based search
  tags: ["learn", "AI"],      // Tag-based filtering
  limit: 5                    // Max results to return
});
// Result: Returns memories related to neural networks with specified tags

// 3. Get important memories above a threshold
const importantMemories = await access_mcp_resource("ltm-cline", 
  "memories://important/8/3"); // Importance ≥8, max 3 results
// Result: Returns up to 3 highly important memories

// 4. Search by specific tag
const taggedMemories = await access_mcp_resource("ltm-cline", 
  "memories://tag/Python/5"); // Memories tagged "Python", max 5
// Result: Returns memories specifically tagged with "Python"

// 5. Retrieve status to check system state
const status = await access_mcp_resource("ltm-cline", "status://current");
// Result: Returns current system status (awake/asleep, conversation state)

// 6. Check persona for traits and preferences
const persona = await access_mcp_resource("ltm-cline", "persona://current");
// Result: Returns current persona details including traits and preferences
```

### Example 3: Persona Evolution Workflow

This example demonstrates how to evolve Claude's persona based on conversations:

```javascript
// 1. Setup initial system state
await use_mcp_tool("ltm-cline", "ltm_initialize", {});
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 10
});

// 2. Create multiple conversations about various topics to influence persona
// Conversation 1: Technical discussion about AI
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "user",
  content: "Let's discuss reinforcement learning techniques"
});
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "claude",
  content: "Reinforcement learning involves training agents through reward systems. Key algorithms include Q-learning, SARSA, and policy gradients..."
});
await use_mcp_tool("ltm-cline", "ltm_end_conversation", {});

// Conversation 2: Creative writing discussion
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "user", 
  content: "Can you help me with creative writing techniques?"
});
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "claude",
  content: "Creative writing involves developing unique voice, character development, and narrative structure. Some techniques include showing vs telling..."
});
await use_mcp_tool("ltm-cline", "ltm_end_conversation", {});

// 3. Trigger dreamstate processing for evolution
await use_mcp_tool("ltm-cline", "ltm_sleep", {
  recentMemoriesLimit: 5  // Process recent memories for evolution
});
// Result: Persona evolves based on these conversations

// 4. Check persona updates to see evolution results
const updates = await access_mcp_resource("ltm-cline", "updates://recent/3");
// Result: Returns recent persona changes showing evolution

// 5. Re-awaken to use evolved persona
await use_mcp_tool("ltm-cline", "ltm_awaken", {});
// Result: System awakens with evolved persona

// 6. Check new persona state after evolution
const evolvedPersona = await access_mcp_resource("ltm-cline", "persona://current");
// Result: Returns evolved persona with updated traits/preferences
```

## Best Practices

### Memory Management

- **Auto Conversation Creation**: The system now automatically creates new conversations when needed - no more "No active conversation" errors!
- **Defensive Memory Handling**: All memory retrieval functions check for array types and handle undefined results gracefully
- **Optimal Awakening**: For best performance, use both `recentMemoriesLimit` and `importantMemoriesThreshold` parameters during awakening
- **Memory Batching**: Limit memory retrieval to 10-20 items to maintain performance while still providing context
- **Tag Strategically**: Use specific, consistent tags for better memory retrieval (person names, topics, dates)

### Persona Evolution Strategies

- **Sleep Regularly**: Call `ltm_sleep` at the end of major conversation sessions to evolve persona
- **Balance Evolution Speed**: Use the `recentMemoriesLimit` parameter to control how quickly persona evolves
- **Monitor Changes**: Check `updates://recent` periodically to see how persona is changing
- **Maintain Context**: Always initialize and awaken the system at the start of a session to ensure persona and memories are loaded

### Advanced Querying Techniques

- **Combine Tags and Text**: Use both query text and tags for most precise memory retrieval
- **Importance Filtering**: Use threshold parameter (7+) to focus on most significant memories
- **Chronological Context**: Use recent memories to establish timeline before diving into specific topics
- **Null Handling**: Recent updates ensure all functions gracefully handle null or undefined return values

## Troubleshooting

### Common Issues and Solutions

- **"Cannot read properties of undefined (reading 'length')"**
  - **Fixed!** The system now checks if messages array exists before accessing
  - **Solution**: Update to latest version with defensive programming fixes

- **"No active conversation. Call startConversation() first"**
  - **Fixed!** Conversations are now auto-created when needed
  - **Solution**: Update to latest version with auto-conversation creation

- **"memories.map is not a function"** or **"updates.map is not a function"**
  - **Fixed!** The system now validates array types before mapping
  - **Solution**: Update to latest version with type checking improvements

- **Database corrupted**
  - Try restoring from backup: `cp ltm-cline.db.bak ltm-cline.db`
  - If no backup exists, initialize fresh: `rm ltm-cline.db && node LTM-CLINE/src/index.js --init`

- **MCP server not connecting**
  - Check server logs: `node LTM-CLINE/src/mcp/server.js --verbose`
  - Verify correct path in cline_mcp_settings.json
  - Restart VSCode after configuration changes

- **"System must be awakened first"**
  - Ensure you call `ltm_initialize` and `ltm_awaken` before attempting to record messages or access memories
  - Check system status with `status://current` to verify the awake state
