import { useState, useEffect, useCallback } from "react"
import { AppView, GlobalState, Conversation } from "./types"
import { Lang } from "./translations"
import { loadState, saveState, uid, createMessage, simulateDelivery } from "./storageEngine"
import { AnimatePresence } from "framer-motion"
import SidebarNav from "./components/SidebarNav"
import ChatView from "./components/ChatView"
import { AIHub, SocialHub } from "./components/AIAndSocialHubs"
import { AuthModal, GlobalSearch, SettingsPanel, ContactsPanel, GroupsPanel, ChannelsPanel, ProfilePanel } from "./components/ModalsAndSettings"
import { motion } from "framer-motion"
import { ChatCircle, Plus, MagnifyingGlass, WifiHigh } from "@phosphor-icons/react"

export default function App() {
  const [state, setState] = useState<GlobalState>(() => loadState())
  const [view, setView] = useState<AppView>("chats")
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [mobileChat, setMobileChat] = useState(false)

  const lang = state.settings.language as Lang

  useEffect(() => { saveState(state) }, [state])

  const updateState = useCallback((s: GlobalState) => setState(s), [])

  const handleLogin = (phone: string, name: string) => {
    const user = { id: "user_self", phone, displayName: name, status: "Available", lastSeen: Date.now(), isOnline: true }
    const auth = { userId: "user_self", token: uid(), createdAt: Date.now(), expiresAt: Date.now() + 86400000 * 30, phoneNumber: phone, isVerified: true }
    setState(prev => ({ ...prev, currentUser: user, auth }))
    setShowAuth(false)
  }

  const handleLogout = () => {
    setState(prev => ({ ...prev, auth: null, currentUser: null }))
    setView("chats")
    setSelectedConv(null)
  }

  const handleSelectConv = (id: string) => {
    setSelectedConv(id)
    setMobileChat(true)
    setState(prev => ({ ...prev, conversations: prev.conversations.map(c => c.id === id ? { ...c, unreadCount: 0 } : c) }))
  }

  const handleSendMessage = (text: string, type: "text" | "audio" = "text", extra?: { voiceDuration?: number; replyToId?: string }) => {
    if (!selectedConv) return
    const msg = createMessage(selectedConv, "user_self", text, type, extra)
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => c.id === selectedConv ? { ...c, messages: [...c.messages, msg], lastActivity: Date.now() } : c)
    }))
    simulateDelivery(msg, state)
  }

  const handleDeleteMessage = (msgId: string, forEveryone: boolean) => {
    if (!selectedConv) return
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => {
        if (c.id !== selectedConv) return c
        if (forEveryone) return { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, deletedForEveryone: true, text: "" } : m) }
        return { ...c, messages: c.messages.filter(m => m.id !== msgId) }
      })
    }))
  }

  const handleEditMessage = (msgId: string, newText: string) => {
    if (!selectedConv) return
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => c.id === selectedConv ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, text: newText, isEdited: true } : m) } : c)
    }))
  }

  const handlePinMessage = (msgId: string) => {
    if (!selectedConv) return
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => c.id === selectedConv ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m) } : c)
    }))
  }

  const handleOpenChatWithContact = (contactId: string) => {
    const existing = state.conversations.find(c => c.type === "direct" && c.participantIds.includes(contactId) && c.participantIds.includes("user_self"))
    if (existing) { setView("chats"); handleSelectConv(existing.id); return }
    const conv: Conversation = { id: uid(), type: "direct", participantIds: ["user_self", contactId], messages: [], lastActivity: Date.now(), unreadCount: 0 }
    setState(prev => ({ ...prev, conversations: [conv, ...prev.conversations] }))
    setView("chats"); handleSelectConv(conv.id)
  }

  const conversation = selectedConv ? state.conversations.find(c => c.id === selectedConv) || null : null

  if (!state.auth) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <ChatCircle size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">AB Chat</h1>
          <p className="text-sm text-slate-400 max-w-xs">Secure multilingual messaging with AI integration</p>
          <button onClick={() => setShowAuth(true)} className="px-8 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-all">
            Get Started
          </button>
        </div>
        <AnimatePresence>{showAuth && <AuthModal lang={lang} onLogin={handleLogin} onClose={() => setShowAuth(false)} />}</AnimatePresence>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden">
      <SidebarNav activeView={view} onViewChange={v => { setView(v); setMobileChat(false) }} state={state} lang={lang} onSearchOpen={() => setShowSearch(true)} />

      <div className={"flex-1 flex overflow-hidden " + (view === "chats" ? "flex-row" : "")}>
        {/* Conversation list for chats view */}
        {view === "chats" && (
          <div className={"w-full sm:w-80 lg:w-96 border-r border-slate-800/60 flex flex-col shrink-0 overflow-hidden " + (mobileChat ? "hidden sm:flex" : "flex")}>
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">{lang === "am" ? "ውይቶች" : lang === "om" ? "Marii'ota" : lang === "ti" ? "ዝርርባት" : lang === "so" ? "Sheekooyin" : lang === "ar" ? "المحادثات" : lang === "fr" ? "Discussions" : "Conversations"}</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowSearch(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"><MagnifyingGlass size={16} /></button>
                <button onClick={() => handleOpenChatWithContact(state.contacts[0]?.id || "")} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"><Plus size={16} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {state.conversations.sort((a, b) => b.lastActivity - a.lastActivity).map(conv => {
                const otherId = conv.participantIds.find(p => p !== "user_self") || ""
                const contact = state.contacts.find(c => c.id === otherId)
                const lastMsg = conv.messages[conv.messages.length - 1]
                return (
                  <motion.button key={conv.id} whileTap={{ scale: 0.98 }} onClick={() => handleSelectConv(conv.id)} className={"w-full text-left px-4 py-3 border-b border-slate-800/30 hover:bg-slate-800/40 transition-colors flex items-center gap-3 " + (selectedConv === conv.id ? "bg-slate-800/60 border-l-2 border-l-emerald-500" : "")}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-sm font-bold shrink-0">
                      {(contact?.name || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">{contact?.name || "Unknown"}</span>
                        {lastMsg && <span className="text-[10px] text-slate-500 shrink-0 ml-1">{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-slate-500 truncate">{lastMsg?.deletedForEveryone ? "Message deleted" : lastMsg?.text || "No messages"}</span>
                        {conv.unreadCount > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{conv.unreadCount}</span>}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
              {state.conversations.length === 0 && (
                <div className="p-8 text-center">
                  <ChatCircle size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No conversations yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className={"flex-1 flex flex-col overflow-hidden " + (view === "chats" && !mobileChat ? "hidden sm:flex" : "flex")}>
          {view === "chats" && (
            <ChatView
              conversation={conversation}
              state={state}
              lang={lang}
              onBack={() => setMobileChat(false)}
              onUpdate={(conv) => setState(prev => ({ ...prev, conversations: prev.conversations.map(c => c.id === conv.id ? conv : c) }))}
            />
          )}
          {view === "ai" && <AIHub state={state} lang={lang} onUpdate={updateState} />}
          {view === "social" && <SocialHub state={state} lang={lang} onUpdate={updateState} />}
          {view === "contacts" && <ContactsPanel state={state} lang={lang} onUpdate={updateState} onOpenChat={handleOpenChatWithContact} />}
          {view === "groups" && <GroupsPanel state={state} lang={lang} onUpdate={updateState} />}
          {view === "channels" && <ChannelsPanel state={state} lang={lang} onUpdate={updateState} />}
          {view === "settings" && <SettingsPanel state={state} lang={lang} onUpdate={updateState} />}
          {view === "profile" && <ProfilePanel state={state} lang={lang} onUpdate={updateState} onLogout={handleLogout} />}
        </div>
      </div>

      <AnimatePresence>
        {showSearch && <GlobalSearch state={state} lang={lang} onSelect={handleSelectConv} onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </div>
  )
}