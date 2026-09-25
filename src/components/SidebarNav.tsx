import { AppView, GlobalState } from "../types"
import { t, Lang } from "../translations"
import { motion } from "framer-motion"
import { ChatCircle, Users, UsersThree, Broadcast, Robot, ShareNetwork, Gear, UserCircle, MagnifyingGlass, WifiHigh } from "@phosphor-icons/react"

const NAV_ITEMS: { view: AppView; icon: React.ElementType; key: string }[] = [
  { view: "chats", icon: ChatCircle, key: "chats" },
  { view: "contacts", icon: Users, key: "contacts" },
  { view: "groups", icon: UsersThree, key: "groups" },
  { view: "channels", icon: Broadcast, key: "channels" },
  { view: "ai", icon: Robot, key: "ai_hub" },
  { view: "social", icon: ShareNetwork, key: "social" },
  { view: "settings", icon: Gear, key: "settings" },
  { view: "profile", icon: UserCircle, key: "profile" },
]

interface Props {
  activeView: AppView
  onViewChange: (v: AppView) => void
  state: GlobalState
  lang: Lang
  onSearchOpen: () => void
}

export default function SidebarNav({ activeView, onViewChange, state, lang, onSearchOpen }: Props) {
  const unreadTotal = state.conversations.reduce((s, c) => s + c.unreadCount, 0)

  return (
    <nav className="flex flex-col h-full w-16 lg:w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 shrink-0">
      <div className="p-3 lg:p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
            AB
          </div>
          <span className="hidden lg:block text-white font-semibold text-sm tracking-tight">AB Chat</span>
        </div>
      </div>

      <button onClick={onSearchOpen} className="mx-2 lg:mx-3 mt-3 flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-xs">
        <MagnifyingGlass size={16} weight="bold" />
        <span className="hidden lg:block">{t("search", lang)}</span>
        <kbd className="hidden lg:inline ml-auto text-[10px] bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>
      </button>

      <div className="flex-1 py-3 space-y-0.5 px-1.5 lg:px-2">
        {NAV_ITEMS.map(({ view, icon: Icon, key }) => {
          const active = activeView === view
          const badge = view === "chats" && unreadTotal > 0 ? unreadTotal : undefined
          return (
            <motion.button
              key={view}
              onClick={() => onViewChange(view)}
              whileTap={{ scale: 0.96 }}
              className={`relative w-full flex items-center gap-2.5 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              <span className="hidden lg:block">{t(key, lang)}</span>
              {badge && (
                <span className="absolute top-1 right-1 lg:static lg:ml-auto min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {badge}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <WifiHigh size={16} className="text-emerald-400" />
          <span className="hidden lg:block text-[11px] text-slate-500">Online</span>
        </div>
      </div>
    </nav>
  )
}
