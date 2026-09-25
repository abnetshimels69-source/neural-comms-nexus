import { GlobalState, Conversation, Message, Contact, Group, Channel, AIConnectionConfig, SocialIntegrationConfig, AppSettings, User, AIMessage } from "./types"

const STORAGE_KEY = "ab_chat_state_v1"

const defaultSettings: AppSettings = {
  theme: "dark",
  language: "en",
  notifications: true,
  readReceipts: true,
  lastSeenVisible: true,
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function seedState(): GlobalState {
  const me: User = {
    id: "user_self", phone: "+251911234567", displayName: "You",
    status: "Available", lastSeen: Date.now(), isOnline: true,
  }
  const contacts: Contact[] = [
    { id: "c1", userId: "user_self", name: "Abebe Kebede", phone: "+251911000001", isBlocked: false, addedAt: Date.now() },
    { id: "c2", userId: "user_self", name: "Fatima Hassan", phone: "+251911000002", isBlocked: false, addedAt: Date.now() },
    { id: "c3", userId: "user_self", name: "Chen Wei", phone: "+8613800000003", isBlocked: false, addedAt: Date.now() },
  ]
  const conversations: Conversation[] = [
    {
      id: "conv1", type: "direct", participantIds: ["user_self", "c1"],
      messages: [
        { id: uid(), conversationId: "conv1", senderId: "c1", text: "Selam! How are you?", type: "text", status: "read", isPinned: false, isEdited: false, reactions: {}, timestamp: Date.now() - 3600000 },
        { id: uid(), conversationId: "conv1", senderId: "user_self", text: "I'm great, working on AB Chat!", type: "text", status: "read", isPinned: false, isEdited: false, reactions: { "👍": ["c1"] }, timestamp: Date.now() - 3500000 },
      ],
      lastActivity: Date.now() - 3500000, unreadCount: 0,
    },
    {
      id: "conv2", type: "direct", participantIds: ["user_self", "c2"],
      messages: [
        { id: uid(), conversationId: "conv2", senderId: "c2", text: "Did you see the new update?", type: "text", status: "delivered", isPinned: false, isEdited: false, reactions: {}, timestamp: Date.now() - 600000 },
      ],
      lastActivity: Date.now() - 600000, unreadCount: 1,
    },
  ]
  const groups: Group[] = [
    { id: "g1", name: "Dev Team", createdBy: "user_self", members: [{ userId: "user_self", role: "admin", joinedAt: Date.now() }, { userId: "c1", role: "member", joinedAt: Date.now() }, { userId: "c3", role: "member", joinedAt: Date.now() }], createdAt: Date.now() - 86400000, description: "Project coordination" },
  ]
  const channels: Channel[] = [
    { id: "ch1", name: "AB Chat Announcements", description: "Official updates", createdBy: "user_self", subscribers: ["user_self", "c1", "c2"], posts: [{ id: uid(), channelId: "ch1", authorId: "user_self", text: "Welcome to AB Chat! 🎉", timestamp: Date.now() - 7200000, reactions: { "❤️": ["c1"] } }], createdAt: Date.now() - 86400000 },
  ]
  const aiConnections: AIConnectionConfig[] = [
    { provider: "openai", apiKey: "", model: "gpt-4o", state: "missing_key", usageCount: 0 },
    { provider: "gemini", apiKey: "", model: "gemini-pro", state: "missing_key", usageCount: 0 },
    { provider: "claude", apiKey: "", model: "claude-3-5-sonnet", state: "missing_key", usageCount: 0 },
    { provider: "perplexity", apiKey: "", model: "sonar", state: "missing_key", usageCount: 0 },
  ]
  const socialConfigs: SocialIntegrationConfig[] = [
    { platform: "facebook", clientId: "", clientSecret: "", accessToken: "", isConnected: false, missingConfigReason: "Facebook App ID and Secret required from Meta Developers Portal" },
    { platform: "instagram", clientId: "", clientSecret: "", accessToken: "", isConnected: false, missingConfigReason: "Instagram Basic Display API credentials needed" },
    { platform: "youtube", clientId: "", clientSecret: "", accessToken: "", isConnected: false, missingConfigReason: "YouTube Data API v3 key from Google Cloud Console" },
    { platform: "tiktok", clientId: "", clientSecret: "", accessToken: "", isConnected: false, missingConfigReason: "TikTok for Developers app registration" },
    { platform: "x", clientId: "", clientSecret: "", accessToken: "", isConnected: false, missingConfigReason: "X API v2 Bearer Token from Developer Portal" },
    { platform: "telegram", clientId: "", clientSecret: "", accessToken: "", isConnected: false, missingConfigReason: "Telegram Bot API token from @BotFather" },
  ]
  return {
    auth: null, currentUser: null, contacts, conversations, groups, channels,
    aiConnections, aiConversations: [], socialConfigs, settings: defaultSettings, blockedUsers: [],
  }
}

export function loadState(): GlobalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GlobalState
      if (parsed.settings && parsed.conversations) return parsed
    }
  } catch { /* fall through */ }
  const fresh = seedState()
  saveState(fresh)
  return fresh
}

export function saveState(state: GlobalState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* quota */ }
}

export function createMessage(conversationId: string, senderId: string, text: string, type: "text" | "image" | "video" | "audio" | "document" = "text", extra?: Partial<Message>): Message {
  return {
    id: uid(), conversationId, senderId, text, type,
    status: "sending", isPinned: false, isEdited: false,
    reactions: {}, timestamp: Date.now(), ...extra,
  }
}

export function simulateDelivery(msg: Message, state: GlobalState): void {
  setTimeout(() => {
    msg.status = "sent"
    saveState(state)
  }, 800)
  setTimeout(() => {
    msg.status = "delivered"
    saveState(state)
  }, 2000)
  setTimeout(() => {
    msg.status = "read"
    saveState(state)
  }, 4500)
}

export async function callAI(provider: string, apiKey: string, model: string, messages: AIMessage[]): Promise<{ text: string; error?: string }> {
  if (!apiKey) return { text: "", error: "No API key configured. Add your key in AI Hub settings." }
  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: messages.map(m => ({ role: m.role, content: m.content })), max_tokens: 1024 }),
      })
      if (res.status === 401) return { text: "", error: "Invalid API key. Check your OpenAI dashboard." }
      if (res.status === 429) return { text: "", error: "Rate limited. Wait and try again." }
      if (!res.ok) return { text: "", error: `API error: ${res.status} ${res.statusText}` }
      const data = await res.json()
      return { text: data.choices?.[0]?.message?.content || "No response" }
    }
    if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: messages.map(m => m.content).join(" ") }] }] }),
      })
      if (res.status === 400) return { text: "", error: "Invalid API key for Google Gemini." }
      if (!res.ok) return { text: "", error: `Gemini error: ${res.status}` }
      const data = await res.json()
      return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" }
    }
    if (provider === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 1024, messages: messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })) }),
      })
      if (res.status === 401) return { text: "", error: "Invalid Anthropic API key." }
      if (!res.ok) return { text: "", error: `Claude error: ${res.status}` }
      const data = await res.json()
      return { text: data.content?.[0]?.text || "No response" }
    }
    if (provider === "perplexity") {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: messages.map(m => ({ role: m.role, content: m.content })) }),
      })
      if (res.status === 401) return { text: "", error: "Invalid Perplexity API key." }
      if (!res.ok) return { text: "", error: `Perplexity error: ${res.status}` }
      const data = await res.json()
      return { text: data.choices?.[0]?.message?.content || "No response" }
    }
    return { text: "", error: `Unknown provider: ${provider}` }
  } catch (e: unknown) {
    return { text: "", error: `Network error: ${(e as Error).message}` }
  }
}

export function startVoiceRecorder(): { start: () => Promise<MediaRecorder | null>; } {
  let recorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  return {
    start: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        chunks = []
        recorder = new MediaRecorder(stream)
        return recorder
      } catch { return null }
    },
  }
}

export function getRecorderChunks(recorder: MediaRecorder): Promise<Blob> {
  return new Promise((resolve) => {
    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }))
  })
}