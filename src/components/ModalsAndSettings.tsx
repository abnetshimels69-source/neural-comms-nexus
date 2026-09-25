import { useState } from "react"
import { GlobalState, Contact, Group, Channel, AppSettings } from "../types"
import { t, Lang, LANGUAGES } from "../translations"
import { uid } from "../storageEngine"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Trash, ShieldCheck, Bell, Palette, Database, Globe, Lock, Key, UserCircle, Phone, IdentificationCard, Megaphone, UsersThree, MagnifyingGlass } from "@phosphor-icons/react"

export function AuthModal({ lang, onLogin, onClose }: { lang: Lang; onLogin: (p: string, n: string) => void; onClose: () => void }) {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{step === "phone" ? t("register", lang) : step === "otp" ? t("enter_otp", lang) : "Set Profile"}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        {step === "phone" && (
          <div className="space-y-3">
            <label className="text-xs text-slate-400">{t("phone_number", lang)}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 911 234 567" className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button onClick={() => { if (phone.length < 8) { setError("Enter valid phone"); return } setError(""); setStep("otp") }} className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">{t("verify", lang)}</button>
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-[11px] text-amber-300 font-medium flex items-center gap-1"><Key size={12} /> {t("auth_config_needed", lang)}</p>
              <p className="text-[10px] text-amber-200/70 mt-1">{t("auth_config_msg", lang)}</p>
            </div>
          </div>
        )}
        {step === "otp" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">{t("code_sent", lang)}: <span className="text-white font-mono">{phone}</span></p>
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-white text-center font-mono tracking-[0.5em] placeholder-slate-500 outline-none focus:border-emerald-500/50" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button onClick={() => { if (otp.length !== 6) { setError("Enter 6-digit code"); return } setStep("name") }} className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400">{t("verify", lang)}</button>
            <button onClick={() => setStep("phone")} className="w-full text-xs text-slate-400 hover:text-white">{t("resend_code", lang)}</button>
          </div>
        )}
        {step === "name" && (
          <div className="space-y-3">
            <label className="text-xs text-slate-400">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button onClick={() => { if (!name.trim()) { setError("Enter name"); return } onLogin(phone, name.trim()) }} className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400">{t("done", lang)}</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export function GlobalSearch({ state, lang, onSelect, onClose }: { state: GlobalState; lang: Lang; onSelect: (id: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const results = query.length > 1 ? state.conversations.flatMap(c => c.messages.filter(m => m.text.toLowerCase().includes(query.toLowerCase())).map(m => ({ conv: c, msg: m }))).slice(0, 20) : []
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
          <MagnifyingGlass size={18} className="text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t("search_all", lang)} className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none" autoFocus />
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xs">{t("cancel", lang)}</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.length > 1 && <p className="p-4 text-xs text-slate-500 text-center">No results</p>}
          {results.map(({ conv, msg }) => (
            <button key={msg.id} onClick={() => { onSelect(conv.id); onClose() }} className="w-full text-left px-4 py-3 hover:bg-slate-800/60 border-b border-slate-800/30">
              <p className="text-xs text-emerald-400 mb-0.5">{conv.participantIds.map(p => state.contacts.find(c => c.id === p)?.name || "You").join(", ")}</p>
              <p className="text-sm text-slate-300 truncate">{msg.text}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function SettingsPanel({ state, lang, onUpdate }: { state: GlobalState; lang: Lang; onUpdate: (s: GlobalState) => void }) {
  const upd = (partial: Partial<AppSettings>) => onUpdate({ ...state, settings: { ...state.settings, ...partial } })
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck size={22} className="text-emerald-400" /> {t("settings", lang)}</h2>
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5"><Palette size={14} /> {t("theme", lang)}</h3>
        <div className="flex gap-2">{(["dark", "light"] as const).map(th => (
          <button key={th} onClick={() => upd({ theme: th })} className={"px-4 py-2 rounded-lg text-xs font-medium " + (state.settings.theme === th ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800/60 text-slate-400 border border-slate-700/40")}>{th === "dark" ? "🌙 Dark" : "☀️ Light"}</button>
        ))}</div>
      </section>
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5"><Globe size={14} /> {t("language", lang)}</h3>
        <div className="grid grid-cols-2 gap-2">{LANGUAGES.map(l => (
          <button key={l.code} onClick={() => upd({ language: l.code })} className={"px-3 py-2 rounded-lg text-xs font-medium text-left " + (state.settings.language === l.code ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800/60 text-slate-400 border border-slate-700/40")}>
            <span className="block">{l.native}</span><span className="text-[10px] opacity-60">{l.label}</span>
          </button>
        ))}</div>
      </section>
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5"><Bell size={14} /> {t("notifications", lang)}</h3>
        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
          <span className="text-sm text-slate-300">Push Notifications</span>
          <button onClick={() => upd({ notifications: !state.settings.notifications })} className={"w-10 h-5 rounded-full " + (state.settings.notifications ? "bg-emerald-500" : "bg-slate-600")}><div className={"w-4 h-4 rounded-full bg-white mx-0.5 " + (state.settings.notifications ? "translate-x-5" : "")} /></button>
        </label>
      </section>
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5"><Lock size={14} /> {t("privacy", lang)}</h3>
        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
          <span className="text-sm text-slate-300">Read Receipts</span>
          <button onClick={() => upd({ readReceipts: !state.settings.readReceipts })} className={"w-10 h-5 rounded-full " + (state.settings.readReceipts ? "bg-emerald-500" : "bg-slate-600")}><div className={"w-4 h-4 rounded-full bg-white mx-0.5 " + (state.settings.readReceipts ? "translate-x-5" : "")} /></button>
        </label>
        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
          <span className="text-sm text-slate-300">Last Seen Visible</span>
          <button onClick={() => upd({ lastSeenVisible: !state.settings.lastSeenVisible })} className={"w-10 h-5 rounded-full " + (state.settings.lastSeenVisible ? "bg-emerald-500" : "bg-slate-600")}><div className={"w-4 h-4 rounded-full bg-white mx-0.5 " + (state.settings.lastSeenVisible ? "translate-x-5" : "")} /></button>
        </label>
      </section>
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5"><Database size={14} /> {t("data_storage", lang)}</h3>
        <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-2">All data stored locally. No data leaves this device.</p>
          <button onClick={() => { localStorage.removeItem("ab_chat_state_v1"); window.location.reload() }} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20 hover:bg-red-500/20">{t("clear_cache", lang)}</button>
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5"><Key size={14} /> Auth Config</h3>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-[11px] text-amber-300 mb-1">Firebase Auth (Recommended)</p>
          <p className="text-[10px] text-slate-400">Add to .env for real SMS OTP:</p>
          <pre className="mt-2 text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded font-mono">{`VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=x.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project`}</pre>
        </div>
      </section>
    </div>
  )
}

export function ContactsPanel({ state, lang, onUpdate, onOpenChat }: { state: GlobalState; lang: Lang; onUpdate: (s: GlobalState) => void; onOpenChat: (id: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [nName, setNName] = useState("")
  const [nPhone, setNPhone] = useState("")
  const add = () => {
    if (!nName.trim() || !nPhone.trim()) return
    const c: Contact = { id: uid(), userId: "user_self", name: nName.trim(), phone: nPhone.trim(), isBlocked: false, addedAt: Date.now() }
    onUpdate({ ...state, contacts: [...state.contacts, c] })
    setNName(""); setNPhone(""); setAdding(false)
  }
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><UserCircle size={22} className="text-cyan-400" /> {t("contacts", lang)}</h2>
        <button onClick={() => setAdding(!adding)} className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400"><Plus size={18} /></button>
      </div>
      {adding && (
        <div className="p-4 space-y-2 border-b border-slate-800/40">
          <input value={nName} onChange={e => setNName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50" />
          <input value={nPhone} onChange={e => setNPhone(e.target.value)} placeholder="+251..." className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50" />
          <button onClick={add} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium">{t("add_contact", lang)}</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30">
        {state.contacts.map(c => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-bold">{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="text-sm text-white font-medium truncate">{c.name}</p><p className="text-[11px] text-slate-500 font-mono">{c.phone}</p></div>
            <button onClick={() => onOpenChat(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-emerald-400"><Phone size={14} /></button>
            <button onClick={() => onUpdate({ ...state, contacts: state.contacts.filter(x => x.id !== c.id) })} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400"><Trash size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GroupsPanel({ state, lang, onUpdate }: { state: GlobalState; lang: Lang; onUpdate: (s: GlobalState) => void }) {
  const [creating, setCreating] = useState(false)
  const [gn, setGn] = useState("")
  const [gd, setGd] = useState("")
  const create = () => {
    if (!gn.trim()) return
    const g: Group = { id: uid(), name: gn.trim(), description: gd.trim(), createdBy: "user_self", members: [{ userId: "user_self", role: "admin", joinedAt: Date.now() }], createdAt: Date.now() }
    onUpdate({ ...state, groups: [...state.groups, g] }); setGn(""); setGd(""); setCreating(false)
  }
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><UsersThree size={22} className="text-purple-400" /> {t("groups", lang)}</h2>
        <button onClick={() => setCreating(!creating)} className="p-2 rounded-lg bg-purple-500/15 text-purple-400"><Plus size={18} /></button>
      </div>
      {creating && <div className="p-4 space-y-2 border-b border-slate-800/40"><input value={gn} onChange={e => setGn(e.target.value)} placeholder="Group name" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none" /><input value={gd} onChange={e => setGd(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none" /><button onClick={create} className="px-4 py-2 rounded-lg bg-purple-500 text-white text-xs">{t("new_group", lang)}</button></div>}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.groups.map(g => (
          <div key={g.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">{g.name.charAt(0)}</div>
            <div className="flex-1"><h3 className="text-sm font-medium text-white">{g.name}</h3><p className="text-[11px] text-slate-500">{g.members.length} {t("members", lang)} · {g.description}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChannelsPanel({ state, lang, onUpdate }: { state: GlobalState; lang: Lang; onUpdate: (s: GlobalState) => void }) {
  const [creating, setCreating] = useState(false)
  const [cn, setCn] = useState("")
  const [cd, setCd] = useState("")
  const [pt, setPt] = useState<Record<string, string>>({})
  const create = () => {
    if (!cn.trim()) return
    const ch: Channel = { id: uid(), name: cn.trim(), description: cd.trim(), createdBy: "user_self", subscribers: ["user_self"], posts: [], createdAt: Date.now() }
    onUpdate({ ...state, channels: [...state.channels, ch] }); setCn(""); setCd(""); setCreating(false)
  }
  const publish = (cid: string) => {
    const text = pt[cid]?.trim(); if (!text) return
    const post = { id: uid(), channelId: cid, authorId: "user_self", text, timestamp: Date.now(), reactions: {} }
    onUpdate({ ...state, channels: state.channels.map(c => c.id === cid ? { ...c, posts: [...c.posts, post] } : c) })
    setPt({ ...pt, [cid]: "" })
  }
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Megaphone size={22} className="text-orange-400" /> {t("channels", lang)}</h2>
        <button onClick={() => setCreating(!creating)} className="p-2 rounded-lg bg-orange-500/15 text-orange-400"><Plus size={18} /></button>
      </div>
      {creating && <div className="p-4 space-y-2 border-b border-slate-800/40"><input value={cn} onChange={e => setCn(e.target.value)} placeholder="Channel name" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none" /><input value={cd} onChange={e => setCd(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none" /><button onClick={create} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs">{t("new_channel", lang)}</button></div>}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.channels.map(ch => (
          <div key={ch.id} className="rounded-xl bg-slate-800/40 border border-slate-700/40 overflow-hidden">
            <div className="p-4 border-b border-slate-700/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold text-sm">{ch.name.charAt(0)}</div>
              <div className="flex-1"><h3 className="text-sm font-medium text-white">{ch.name}</h3><p className="text-[11px] text-slate-500">{ch.subscribers.length} {t("subscribers", lang)}</p></div>
            </div>
            <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
              {ch.posts.map(p => <div key={p.id} className="p-2 rounded-lg bg-slate-900/40 text-xs text-slate-300">{p.text}<span className="block text-[10px] text-slate-500 mt-1">{new Date(p.timestamp).toLocaleString()}</span></div>)}
            </div>
            <div className="p-3 border-t border-slate-700/30 flex gap-2">
              <input value={pt[ch.id] || ""} onChange={e => setPt({ ...pt, [ch.id]: e.target.value })} placeholder={t("write_post", lang)} className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/40 text-xs text-white placeholder-slate-500 outline-none" />
              <button onClick={() => publish(ch.id)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs">{t("post", lang)}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfilePanel({ state, lang, onUpdate, onLogout }: { state: GlobalState; lang: Lang; onUpdate: (s: GlobalState) => void; onLogout: () => void }) {
  const user = state.currentUser
  const [editName, setEditName] = useState(user?.displayName || "")
  const save = () => { if (!user || !editName.trim()) return; onUpdate({ ...state, currentUser: { ...user, displayName: editName.trim() } }) }
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2"><IdentificationCard size={22} className="text-emerald-400" /> {t("profile", lang)}</h2>
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 text-xl font-bold">{(user?.displayName || "?").charAt(0)}</div>
        <div className="flex-1"><input value={editName} onChange={e => setEditName(e.target.value)} onBlur={save} className="bg-transparent text-white font-semibold text-lg outline-none border-b border-transparent focus:border-emerald-500/50" /><p className="text-xs text-slate-500 mt-1 font-mono">{user?.phone}</p></div>
      </div>
      <button onClick={onLogout} className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-2"><X size={16} /> {t("logout", lang)}</button>
    </div>
  )
}