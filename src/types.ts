export interface User {
  id: string
  phone: string
  displayName: string
  avatar?: string
  status: string
  lastSeen: number
  isOnline: boolean
}

export interface AuthSession {
  userId: string
  token: string
  createdAt: number
  expiresAt: number
  phoneNumber: string
  isVerified: boolean
}

export interface Contact {
  id: string
  userId: string
  name: string
  phone: string
  avatar?: string
  isBlocked: boolean
  addedAt: number
}

export interface GroupMember {
  userId: string
  role: "admin" | "member"
  joinedAt: number
}

export interface Group {
  id: string
  name: string
  avatar?: string
  createdBy: string
  members: GroupMember[]
  createdAt: number
  description: string
}

export interface ChannelPost {
  id: string
  channelId: string
  authorId: string
  text: string
  timestamp: number
  reactions: Record<string, string[]>
}

export interface Channel {
  id: string
  name: string
  description: string
  avatar?: string
  createdBy: string
  subscribers: string[]
  posts: ChannelPost[]
  createdAt: number
}

export type MessageType = "text" | "image" | "video" | "audio" | "document"
export type MessageStatus = "sending" | "sent" | "delivered" | "read"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  type: MessageType
  mediaUrl?: string
  voiceDuration?: number
  status: MessageStatus
  replyToId?: string
  isPinned: boolean
  isEdited: boolean
  reactions: Record<string, string[]>
  timestamp: number
  deletedForEveryone?: boolean
}

export interface Conversation {
  id: string
  type: "direct" | "group" | "channel"
  participantIds: string[]
  messages: Message[]
  lastActivity: number
  unreadCount: number
}

export type AIProvider = "openai" | "gemini" | "claude" | "perplexity"
export type AIConnectionState = "connected" | "missing_key" | "invalid" | "testing" | "error"

export interface AIConnectionConfig {
  provider: AIProvider
  apiKey: string
  model: string
  state: AIConnectionState
  lastTestAt?: number
  errorMessage?: string
  usageCount: number
}

export interface AIMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  provider: AIProvider
  model: string
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: number
  provider: AIProvider
}

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "tiktok" | "x" | "telegram"

export interface SocialIntegrationConfig {
  platform: SocialPlatform
  clientId: string
  clientSecret: string
  accessToken: string
  isConnected: boolean
  missingConfigReason?: string
  lastSyncAt?: number
}

export type AppView = "chats" | "contacts" | "groups" | "channels" | "ai" | "social" | "settings" | "profile"

export type ThemeMode = "dark" | "light"

export interface AppSettings {
  theme: ThemeMode
  language: string
  notifications: boolean
  readReceipts: boolean
  lastSeenVisible: boolean
}

export interface GlobalState {
  auth: AuthSession | null
  currentUser: User | null
  contacts: Contact[]
  conversations: Conversation[]
  groups: Group[]
  channels: Channel[]
  aiConnections: AIConnectionConfig[]
  aiConversations: AIConversation[]
  socialConfigs: SocialIntegrationConfig[]
  settings: AppSettings
  blockedUsers: string[]
}
