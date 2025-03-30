# 🧠✨ LTM-CLINE: Long-Term Memory for Claude 3.7 🤖💭

LTM-CLINE is a Model Context Protocol (MCP) server that provides Claude 3.7 with long-term memory, concurrency, and persona evolution capabilities using SQLite as a persistent storage backend. When integrated with the Cline VSCode extension, it enhances Claude 3.7 with human-like memory and the ability to evolve based on experiences. Never forget a conversation again! 🚀

## 🧠 Features 🌟

- **Long-Term Memory** 📚: Store and retrieve conversation histories across sessions
- **Persona Evolution** 🦋: Evolve Claude's personality and traits based on its experiences
- **Conversation Management** 💬: Track, summarize, and process conversation data
- **Dreamstate Processing** 💤: Update Claude's persona during "sleep" based on recent memories
- **Awakening Process** ⏰: Reload relevant memories and persona on startup
- **Importance-Based Memory** ⭐: Assign and retrieve memories based on importance scores
- **Tag-Based Retrieval** 🏷️: Search memories using tags and keywords
- **MCP Integration** 🔌: Expose all functionality to Claude 3.7 via MCP tools and resources
- **Auto-Conversation** 🤯: Automatically creates conversations when needed so you never lose context
- **Robust Error Handling** 🛡️: Prevents common issues with defensive programming approaches

## 🔄 Memory Lifecycle 🔁

LTM-CLINE implements a human-like memory cycle:

1. **Initialization** 🏁: Set up the system and ensure database is ready
2. **Awakening** 🌅: Claude "wakes up" and loads its persona and relevant memories
3. **Conversation** 🗣️: The system records and processes conversations with users (automatically creates conversations when needed!)
4. **Sleep** 😴: When a session ends, conversations are summarized and Claude enters "sleep" mode
5. **Dreamstate** 💫: During sleep, the system processes recent experiences and evolves the persona

## 📦 Installation 🛠️

```bash
# Clone the repository 📋
git clone https://github.com/mushroomfleet/ltm-cline.git
cd ltm-cline

# Install dependencies 📥
npm install

# Build the project 🏗️
npm run build
```

## 🔌 MCP Configuration ⚙️

To use LTM-CLINE with Claude 3.7 via the Cline VSCode extension:

1. Start the MCP server 🚀:
   ```bash
   node src/mcp/server.js
   ```

2. Configure the MCP server in your Cline settings (`~/.config/cline/cline_mcp_settings.json` or equivalent for your OS) 📝:
   ```json
   {
     "mcpServers": {
       "ltm-cline": {
         "command": "node",
         "args": ["/path/to/ltm-cline/src/mcp/server.js"],
         "env": {},
         "disabled": false,
         "autoApprove": [
           "ltm_initialize",
           "ltm_end_conversation",
           "ltm_search_memories"
         ]
       }
     }
   }
   ```

3. Restart the Cline VSCode extension to connect to the MCP server 🔄.

## 🚀 Using with Claude 3.7 🧠

Once the MCP server is running and configured, Claude 3.7 can use the following tools:

- **ltm_initialize** 🏁: Initialize the system
- **ltm_awaken** 🌅: Load persona and memories
- **ltm_record_message** 💬: Record conversation messages (auto-creates conversations as needed!)
- **ltm_end_conversation** 🏁: Process conversation into memory
- **ltm_sleep** 😴: Trigger dreamstate processing
- **ltm_search_memories** 🔍: Find relevant memories
- **ltm_get_awakening_prompt** 📜: Generate an awakening prompt

Claude 3.7 can also access these resources:

- **persona://current** 🧩: Current Claude persona
- **status://current** 📊: Current system status
- **memories://recent/{limit}** 📚: Recent memories
- **memories://important/{threshold}/{limit}** ⭐: Important memories
- **memories://tag/{tag}/{limit}** 🏷️: Memories by tag
- **updates://recent/{limit}** 📋: Recent persona updates

## 💡 Pro Tips for Optimal Use 🔥

### 🧙‍♂️ Memory Management Mastery
- **Auto Conversation Creation** 🤯: The system now automatically creates new conversations when needed - no more "No active conversation" errors!
- **Defensive Memory Handling** 🛡️: All memory retrieval functions now check for array types and handle undefined results gracefully
- **Optimal Awakening** 🌟: For best performance, use both `recentMemoriesLimit` and `importantMemoriesThreshold` parameters during awakening
- **Memory Batching** 📚: Limit memory retrieval to 10-20 items to maintain performance while still providing context
- **Tag Strategically** 🏷️: Use specific, consistent tags for better memory retrieval (person names, topics, dates)

### 🧠 Persona Evolution Strategies
- **Sleep Regularly** 😴: Call `ltm_sleep` at the end of major conversation sessions to evolve persona
- **Balance Evolution Speed** ⚖️: Use the `recentMemoriesLimit` parameter to control how quickly persona evolves
- **Monitor Changes** 📊: Check `updates://recent` periodically to see how persona is changing
- **Reset if Needed** 🔄: If evolution goes off-track, you can reset the persona with `Persona.reset()`

### 🔍 Advanced Querying Techniques
- **Combine Tags and Text** 🧩: Use both query text and tags for most precise memory retrieval
- **Importance Filtering** ⭐: Use threshold parameter (7+) to focus on most significant memories
- **Chronological Context** 📅: Use recent memories to establish timeline before diving into specific topics
- **Null Handling** 🛡️: Recent updates ensure all functions gracefully handle null or undefined return values

## 🎭 Complete Usage Examples 📚

### 🌅 Example 1: Basic Memory Management Flow 

```javascript
// COMPLETE MEMORY LIFECYCLE EXAMPLE 🔄

// 1. Initialize the system 🏁
await use_mcp_tool("ltm-cline", "ltm_initialize", {});
// Result: System initialized, database ready

// 2. Awaken Claude with memory loading 🌅 
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 5,          // Load 5 most recent memories
  importantMemoriesThreshold: 7,   // Consider memories with importance ≥7 
  importantMemoriesLimit: 3        // Load up to 3 important memories
});
// Result: Claude awakened with memories and persona loaded

// 3. Record user message 💬
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "user",
  content: "Hello Claude! Remember when we talked about neural networks yesterday?"
});
// Result: Message recorded (conversation auto-created if needed!)

// 4. Record Claude's response 🤖
await use_mcp_tool("ltm-cline", "ltm_record_message", {
  role: "claude",
  content: "Yes, I remember! We discussed how neural networks are inspired by the human brain, with interconnected layers of neurons that process information through weighted connections."
});
// Result: Response recorded in conversation

// 5. End conversation and process into memory 🧠
await use_mcp_tool("ltm-cline", "ltm_end_conversation", {});
// Result: Conversation summarized and stored as memory

// 6. Retrieve recent memories to confirm storage 📚
const memories = await access_mcp_resource("ltm-cline", "memories://recent/3");
// Result: Returns recently stored memories including this conversation

// 7. Put system to sleep to trigger persona evolution 😴
await use_mcp_tool("ltm-cline", "ltm_sleep", {
  recentMemoriesLimit: 10  // Process 10 most recent memories for evolution
});
// Result: System sleeps, processes recent experiences, evolves persona
```

### 🔍 Example 2: Advanced Memory Search and Retrieval 

```javascript
// ADVANCED MEMORY RETRIEVAL EXAMPLE 🧩

// 1. Initialize and awaken the system 🏁
await use_mcp_tool("ltm-cline", "ltm_initialize", {});
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 5,
  importantMemoriesThreshold: 6,
  importantMemoriesLimit: 5
});

// 2. Search for memories about a specific topic 🔍
const neuralNetworkMemories = await use_mcp_tool("ltm-cline", "ltm_search_memories", {
  query: "neural networks",   // Text-based search
  tags: ["learn", "AI"],      // Tag-based filtering
  limit: 5                    // Max results to return
});
// Result: Returns memories related to neural networks with specified tags

// 3. Get important memories above a threshold ⭐
const importantMemories = await access_mcp_resource("ltm-cline", 
  "memories://important/8/3"); // Importance ≥8, max 3 results
// Result: Returns up to 3 highly important memories

// 4. Search by specific tag 🏷️
const taggedMemories = await access_mcp_resource("ltm-cline", 
  "memories://tag/Python/5"); // Memories tagged "Python", max 5
// Result: Returns memories specifically tagged with "Python"

// 5. Retrieve status to check system state 📊
const status = await access_mcp_resource("ltm-cline", "status://current");
// Result: Returns current system status (awake/asleep, conversation state)

// 6. Check persona for traits and preferences 🧩
const persona = await access_mcp_resource("ltm-cline", "persona://current");
// Result: Returns current persona details including traits and preferences
```

### 🦋 Example 3: Persona Evolution Workflow 

```javascript
// COMPLETE PERSONA EVOLUTION EXAMPLE 🦋

// 1. Setup initial system state 🏁
await use_mcp_tool("ltm-cline", "ltm_initialize", {});
await use_mcp_tool("ltm-cline", "ltm_awaken", {
  recentMemoriesLimit: 10
});

// 2. Create multiple conversations about various topics to influence persona 💬
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

// 3. Trigger dreamstate processing for evolution 😴💭
await use_mcp_tool("ltm-cline", "ltm_sleep", {
  recentMemoriesLimit: 5  // Process recent memories for evolution
});
// Result: Persona evolves based on these conversations

// 4. Check persona updates to see evolution results 📈
const updates = await access_mcp_resource("ltm-cline", "updates://recent/3");
// Result: Returns recent persona changes showing evolution

// 5. Re-awaken to use evolved persona 🌅
await use_mcp_tool("ltm-cline", "ltm_awaken", {});
// Result: System awakens with evolved persona

// 6. Check new persona state after evolution 🧩
const evolvedPersona = await access_mcp_resource("ltm-cline", "persona://current");
// Result: Returns evolved persona with updated traits/preferences
```

## 🏗️ Architecture 🏛️

LTM-CLINE consists of the following components:

### Models 🧩

- **Persona** 🎭: Stores Claude's evolving identity, traits, values, and preferences
- **Conversation** 💬: Manages and records conversations with users
- **Memory** 🧠: Summarizes and stores important information from conversations
- **DreamstateUpdate** 💤: Tracks changes to the persona over time

### Services ⚙️

- **AwakeningService** 🌅: Handles the process of loading persona and memories on startup
- **MemoryProcessor** 📝: Converts conversations into summarized memories with importance and tags
- **PersonaEvolver** 🦋: Implements the dreamstate process that evolves the persona

### Core 🔄

- **LTMSQL** 🧠: Main class that coordinates all components and provides the primary API

### MCP Server 🔌

- **LTMClineServer** 🖥️: Exposes the LTM functionality to Claude 3.7 via the Model Context Protocol
  - Now with robust error handling! 🛡️ 
  - Auto-conversation creation! 🤯
  - Array type validation! ✅

## 💾 Database Schema 📊

LTM-CLINE uses a SQLite database with the following tables:

- **persona** 🧩: Stores Claude's evolving identity
- **conversations** 💬: Raw conversation data
- **memories** 🧠: Stored conversation summaries with importance scores and tags
- **dreamstate_updates** 💤: Records changes to the persona over time

## 🧩 How It Works 🔍

### Persona Evolution 🦋

The system tracks Claude's personality as a combination of:
- **Traits** 🧠: Personality characteristics (openness, conscientiousness, etc.)
- **Values** ❤️: Core principles (helpfulness, honesty, etc.)
- **Preferences** 👍: Communication styles and interaction preferences
- **Biography** 📖: A narrative description of Claude's "life story"

As Claude interacts with users, its persona gradually evolves based on experiences.

### Memory Importance ⭐

Memories are assigned importance scores (1-10) based on:
- Conversation length and complexity 📏
- Number of participants 👥
- Content analysis 🔍 (in a full implementation, using Claude 3.7 itself for analysis)

Important memories are prioritized during retrieval to ensure the most significant experiences influence Claude's behavior.

### Memory Tagging 🏷️

Memories are automatically tagged with:
- Participant names 👤
- Date information 📅
- Keywords from the conversation 🔑
- In a full implementation, Claude-generated topical tags 🏷️

Tags enable efficient retrieval of relevant memories when needed.

## 🛠️ Troubleshooting 🔧

### Common Issues and Solutions 🚫➡️✅

- **"Cannot read properties of undefined (reading 'length')"** ❌
  - **Fixed!** 🎉 The system now checks if messages array exists before accessing
  - **Solution**: Update to latest version with defensive programming fixes

- **"No active conversation. Call startConversation() first"** ❌
  - **Fixed!** 🎉 Conversations are now auto-created when needed
  - **Solution**: Update to latest version with auto-conversation creation

- **"memories.map is not a function"** ❌
  - **Fixed!** 🎉 The system now validates array types before mapping
  - **Solution**: Update to latest version with type checking improvements

- **Database corrupted** ❌
  - Try restoring from backup: `cp ltm-cline.db.bak ltm-cline.db` 💾
  - If no backup exists, initialize fresh: `rm ltm-cline.db && node src/index.js --init` 🆕

- **MCP server not connecting** ❌
  - Check server logs: `node src/mcp/server.js --verbose` 🔍
  - Verify correct path in cline_mcp_settings.json 📝
  - Restart VSCode after configuration changes 🔄

## 🔧 Extending LTM-CLINE 🔌

### Memory Processing 🧠

To improve memory processing, modify the `MemoryProcessor` service to have Claude generate better summaries:

```javascript
// In src/services/MemoryProcessor.js 📝
static async generateSummary(conversation, options = {}) {
  const fullText = conversation.getFullText();
  
  // Call Claude via your preferred API method 🤖
  const summary = await callClaudeAPI("Summarize this conversation: " + fullText);
  
  return summary;
}
```

### Persona Evolution 🦋

Similarly, enhance persona evolution with Claude's capabilities:

```javascript
// In src/services/PersonaEvolver.js 📝
static async identifyPersonaChanges(persona, memories, options = {}) {
  const memoriesData = memories.map(m => ({
    summary: m.summary,
    importance: m.importance,
    tags: m.tags
  }));
  
  // Ask Claude to analyze the memories and suggest persona changes 🧠
  const analysis = await callClaudeAPI(`
    Based on these recent experiences: ${JSON.stringify(memoriesData)}, 
    how should my persona evolve? Current persona: ${JSON.stringify(persona)}
  `);
  
  // Parse Claude's response into a changes object 📊
  return parseChanges(analysis);
}
```

## 📄 License ⚖️

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing 👥

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgements 🌟

This project is based on the original LTM-SQL framework, adapted to work with Claude 3.7 via the Model Context Protocol and the Cline VSCode extension. Special thanks to all the memory researchers who made this possible! 🧪🔬
