import { useState, useRef, useEffect, useCallback } from "react"
import { Conversation, Message, GlobalState, Contact } from "../types"
import { t, Lang } from "../translations"
import { createMessage, simulateDelivery, uid } from "../storageEngine"
import { motion, AnimatePresence } from "framer-motion"
import { PaperPlaneRight, Microphone, Paperclip, Phone, VideoCamera, PushPin, Pencil, Trash, ArrowLeft, Check, Checks, X, MagnifyingGlass } from "@phosphor-icons/react"

interface Props {
  conversation: Conversation | null
  state: GlobalState
  lang: Lang
  onBack: () => void
  onUpdate: (conv: Conversation) => void
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function StatusTicks({ status }: { status: Message["status"] }) {
  if (status === "sending") return <span className="text-slate-500 text-[10px]">○</span>
  if (status === "sent") return <Check size={12} className="text-slate-400" />
  if (status === "delivered") return <Checks size={12} className="text-slate-400" />
  return <Checks size={12} className="text-emerald-400" />
}

export default function ChatView({ conversation, state, lang, onBack, onUpdate }: Props) {
  const [input, setInput] = useState("")
  const [recording, setRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editing, setEditing] = useState<Message | null>(null)
  const [showActions, setShowActions] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => { scrollToBottom() }, [conversation?.messages.length, scrollToBottom])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950/50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-4">
            <PaperPlaneRight size={28} className="text-slate-600" />
          </div>
          <p className="text-slate-500 text-sm">{t("no_conversations", lang)}</p>
        </div>
      </div>
    )
  }

  const getContactName = (id: string): string => {
    if (id === "user_self") return "You"
    const c = state.contacts.find(ct => ct.id === id || ct.userId === id)
    return c?.name || "Unknown"
  }

  const sendMessage = () => {
    if (!input.trim() && !replyTo) return
    const msg = createMessage(conversation.id, "user_self", input.trim(), "text", {
      replyToId: replyTo?.id,
    })
    const updated: Conversation = {
      ...conversation,
      messages: [...conversation.messages, msg],
      lastActivity: Date.now(),
    }
    onUpdate(updated)
    setInput("")
    setReplyTo(null)
    simulateDelivery(msg, state)
  }

  const handleVoiceStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      recorderRef.current = rec
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        const msg = createMessage(conversation.id, "user_self", "Voice message", "audio", {
          mediaUrl: url, voiceDuration: recordTime,
        })
        onUpdate({ ...conversation, messages: [...conversation.messages, msg], lastActivity: Date.now() })
        stream.getTracks().forEach(tr => tr.stop())
      }
      rec.start()
      setRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
    } catch { setRecording(false) }
  }

  const handleVoiceStop = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop()
    }
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const deleteMessage = (msgId: string) => {
    const updated = { ...conversation, messages: conversation.messages.map(m => m.id === msgId ? { ...m, deletedForEveryone: true, text: "" } : m) }
    onUpdate(updated)
    setShowActions(null)
  }

  const pinMessage = (msgId: string) => {
    const updated = { ...conversation, messages: conversation.messages.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m) }
    onUpdate(updated)
    setShowActions(null)
  }

  const editMessage = (msg: Message) => {
    setEditing(msg)
    setInput(msg.text)
    setShowActions(null)
  }

  const saveEdit = () => {
    if (!editing) return
    const updated = { ...conversation, messages: conversation.messages.map(m => m.id === editing.id ? { ...m, text: input, isEdited: true } : m) }
    onUpdate(updated)
    setEditing(null)
    setInput("")
  }

  const filteredMessages = searchQuery
    ? conversation.messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversation.messages

  const pinned = conversation.messages.filter(m => m.isPinned)

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/30">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
        <button onClick={onBack} className="lg:hidden p-1 text-slate-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-bold">
          {getContactName(conversation.participantIds.find(p => p !== "user_self") || "").charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">
            {getContactName(conversation.participantIds.find(p => p !== "user_self") || "")}
          </h2>
          <p className="text-[11px] text-emerald-400">{t("online", lang)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <MagnifyingGlass size={18} />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <VideoCamera size={18} />
          </button>
        </div>
      </header>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-800/40">
            <div className="p-2">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t("search", lang)} className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50" autoFocus />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned banner */}
      {pinned.length > 0 && !searchOpen && (
        <div className="px-4 py-2 bg-emerald-500/5 border-b border-emerald-500/10 flex items-center gap-2">
          <PushPin size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-300 truncate">{pinned[pinned.length - 1].text}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {filteredMessages.map((msg) => {
          const isMine = msg.senderId === "user_self"
          if (msg.deletedForEveryone) {
            return <div key={msg.id} className="text-center py-2 text-xs text-slate-600 italic">{t("deleted", lang)}</div>
          }
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={"flex " + (isMine ? "justify-end" : "justify-start")}
            >
              <div className="relative group max-w-[75%] lg:max-w-[60%]">
                <div className={"px-3 py-2.5 rounded-2xl text-sm leading-relaxed " + (isMine ? "bg-emerald-600/90 text-white rounded-br-md" : "bg-slate-800/80 text-slate-100 rounded-bl-md border border-slate-700/40")}>
                  {msg.replyToId && (
                    <div className="mb-1.5 pl-2 border-l-2 border-white/30 text-[11px] opacity-70 truncate">
                      {conversation.messages.find(m => m.id === msg.replyToId)?.text}
                    </div>
                  )}
                  {msg.type === "audio" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Microphone size={14} className="opacity-70" />
                      <div className="flex items-center gap-0.5 h-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="w-0.5 rounded-full bg-white/60" style={{ height: (4 + i * 1.1) + "px" }} />
                        ))}
                      </div>
                      <span className="text-[10px] opacity-70">{Math.floor((msg.voiceDuration || 0) / 60)}:{String((msg.voiceDuration || 0) % 60).padStart(2, "0")}</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    {msg.isEdited && <span className="text-[9px] opacity-50">{t("edited", lang)}</span>}
                    <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
                    {isMine && <StatusTicks status={msg.status} />}
                  </div>
                </div>
                {/* Reactions */}
                {Object.keys(msg.reactions).length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {Object.entries(msg.reactions).map(([emoji]) => (
                      <span key={emoji} className="text-xs bg-slate-800/80 border border-slate-700/40 rounded-full px-1.5 py-0.5">{emoji}</span>
                    ))}
                  </div>
                )}
                {/* Actions */}
                <button
                  onClick={() => setShowActions(showActions === msg.id ? null : msg.id)}
                  className="absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-slate-900/80 border border-slate-700/40"
                  style={{ [isMine ? "left" : "right"]: "-28px" }}
                >
                  <span className="text-slate-400 text-xs">⋯</span>
                </button>
                <AnimatePresence>
                  {showActions === msg.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-8 z-20 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl py-1 min-w-[140px]" style={{ [isMine ? "left" : "right"]: 0 }}>
                      <button onClick={() => { setReplyTo(msg); setShowActions(null) }} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/60 flex items-center gap-2"><ArrowLeft size={12} /> {t("reply", lang)}</button>
                      {isMine && <button onClick={() => editMessage(msg)} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/60 flex items-center gap-2"><Pencil size={12} /> {t("edit", lang)}</button>}
                      <button onClick={() => pinMessage(msg.id)} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/60 flex items-center gap-2"><PushPin size={12} /> {msg.isPinned ? t("unpin", lang) : t("pin", lang)}</button>
                      <button onClick={() => deleteMessage(msg.id)} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"><Trash size={12} /> {t("delete", lang)}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-slate-800/60 border-t border-slate-700/40 flex items-center gap-2">
          <ArrowLeft size={14} className="text-emerald-400" />
          <span className="text-xs text-slate-300 truncate flex-1">{replyTo.text}</span>
          <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* Composer */}
      <div className="px-4 py-3 border-t border-slate-800/60 bg-slate-900/40">
        {recording ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400">{t("recording", lang)}</span>
            </div>
            <span className="text-sm text-white font-mono">{Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, "0")}</span>
            <div className="flex-1" />
            <button onClick={handleVoiceStop} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors">
              {t("send", lang)}
            </button>
            <button onClick={() => { setRecording(false); if (timerRef.current) clearInterval(timerRef.current); if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop() }} className="p-2 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <button className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); editing ? saveEdit() : sendMessage() } }}
                placeholder={editing ? t("edit", lang) + ": " + editing.text.slice(0, 20) : t("type_message", lang)}
                rows={1}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/40 resize-none max-h-32"
              />
            </div>
            {editing ? (
              <button onClick={saveEdit} className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                <Check size={18} />
              </button>
            ) : input.trim() ? (
              <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                <PaperPlaneRight size={18} weight="fill" />
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.9 }} onPointerDown={handleVoiceStart} className="p-2.5 rounded-xl bg-slate-700/60 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors border border-slate-600/40">
                <Microphone size={18} />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}