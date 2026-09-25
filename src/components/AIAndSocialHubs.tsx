import { useState } from "react"
import { GlobalState, AIConnectionConfig, AIMessage, SocialIntegrationConfig } from "../types"
import { t, Lang } from "../translations"
import { callAI, uid } from "../storageEngine"
import { motion } from "framer-motion"
import { Robot, Key, Lightning, Play, Globe, FacebookLogo, InstagramLogo, YoutubeLogo, TiktokLogo, TwitterLogo, TelegramLogo, PaperPlaneRight, SpinnerGap } from "@phosphor-icons/react"

interface AIHubProps {
  state: GlobalState
  lang: Lang
  onUpdate: (state: GlobalState) => void
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  facebook: FacebookLogo, instagram: InstagramLogo, youtube: YoutubeLogo,
  tiktok: TiktokLogo, x: TwitterLogo, telegram: TelegramLogo,
}

const AI_MODELS: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
  gemini: ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"],
  claude: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
  perplexity: ["sonar", "sonar-pro", "llama-3.1-70b"],
}

const PROMPT_TEMPLATES = [
  { label: "AI Writer", prompt: "Write a professional email about" },
  { label: "Translator", prompt: "Translate the following to Amharic:" },
  { label: "Code Helper", prompt: "Explain this code and suggest improvements:" },
  { label: "Summarizer", prompt: "Summarize the following text concisely:" },
  { label: "Image Prompt", prompt: "Generate a detailed image prompt for:" },
]

export function AIHub({ state, lang, onUpdate }: AIHubProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("openai")
  const [prompt, setPrompt] = useState("")
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [editingKey, setEditingKey] = useState(false)
  const [keyInput, setKeyInput] = useState("")

  const connection = state.aiConnections.find(c => c.provider === selectedProvider) || state.aiConnections[0]

  const updateConnection = (provider: string, updates: Partial<AIConnectionConfig>) => {
    const conns = state.aiConnections.map(c => c.provider === provider ? { ...c, ...updates } : c)
    onUpdate({ ...state, aiConnections: conns })
  }

  const testConnection = async () => {
    updateConnection(selectedProvider, { state: "testing" })
    const result = await callAI(selectedProvider, connection.apiKey, connection.model, [{ id: uid(), role: "user", content: "Hi", timestamp: Date.now(), provider: selectedProvider as AIConnectionConfig["provider"], model: connection.model }])
    if (result.error) {
      updateConnection(selectedProvider, { state: "invalid", errorMessage: result.error })
    } else {
      updateConnection(selectedProvider, { state: "connected", lastTestAt: Date.now(), errorMessage: undefined })
    }
  }

  const sendPrompt = async () => {
    if (!prompt.trim()) return
    const userMsg: AIMessage = { id: uid(), role: "user", content: prompt, timestamp: Date.now(), provider: selectedProvider as AIConnectionConfig["provider"], model: connection.model }
    const newMsgs = [...aiMessages, userMsg]
    setAiMessages(newMsgs)
    setPrompt("")
    setLoading(true)
    const result = await callAI(selectedProvider, connection.apiKey, connection.model, newMsgs)
    if (result.error) {
      setAiMessages([...newMsgs, { id: uid(), role: "assistant", content: `⚠️ ${result.error}`, timestamp: Date.now(), provider: selectedProvider as AIConnectionConfig["provider"], model: connection.model }])
    } else {
      setAiMessages([...newMsgs, { id: uid(), role: "assistant", content: result.text, timestamp: Date.now(), provider: selectedProvider as AIConnectionConfig["provider"], model: connection.model }])
      updateConnection(selectedProvider, { usageCount: connection.usageCount + 1, state: "connected" })
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800/60">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Robot size={22} className="text-emerald-400" /> {t("ai_hub", lang)}</h2>
      </div>

      {/* Provider tabs */}
      <div className="flex gap-1 p-3 border-b border-slate-800/40 overflow-x-auto">
        {state.aiConnections.map(c => (
          <button key={c.provider} onClick={() => setSelectedProvider(c.provider)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedProvider === c.provider ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:text-white"}`}>
            {c.provider.toUpperCase()}
            <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${c.state === "connected" ? "bg-emerald-400" : c.state === "invalid" ? "bg-red-400" : "bg-slate-500"}`} />
          </button>
        ))}
      </div>

      {/* API Key config */}
      <div className="p-3 border-b border-slate-800/40 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <Key size={14} className="text-slate-500" />
          <span className="text-xs text-slate-400">{t("ai_api_key", lang)}:</span>
          <code className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{connection.apiKey ? "••••" + connection.apiKey.slice(-4) : t("missing_key", lang)}</code>
          <button onClick={() => { setEditingKey(!editingKey); setKeyInput(connection.apiKey) }} className="ml-auto text-[11px] text-emerald-400 hover:text-emerald-300">{editingKey ? t("cancel", lang) : "Configure"}</button>
        </div>
        {editingKey && (
          <div className="flex gap-2 mt-2">
            <input value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="sk-..." className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-xs text-white outline-none focus:border-emerald-500/50 font-mono" />
            <button onClick={() => { updateConnection(selectedProvider, { apiKey: keyInput, state: keyInput ? "missing_key" : "missing_key" }); setEditingKey(false) }} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium">{t("save", lang)}</button>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-slate-500">{t("ai_model", lang)}:</span>
          <select value={connection.model} onChange={e => updateConnection(selectedProvider, { model: e.target.value })} className="text-[11px] bg-slate-800 border border-slate-700/40 rounded px-2 py-1 text-slate-300 outline-none">
            {(AI_MODELS[selectedProvider] || []).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={testConnection} disabled={loading} className="ml-auto flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 disabled:opacity-50">
            <Lightning size={12} /> {t("ai_test", lang)}
          </button>
        </div>
        {connection.errorMessage && <p className="mt-1.5 text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded">{connection.errorMessage}</p>}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {aiMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">{t("ai_no_key", lang)}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PROMPT_TEMPLATES.map(pt => (
                <button key={pt.label} onClick={() => setPrompt(pt.prompt + " ")} className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-[11px] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-all">
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        ) : aiMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-emerald-600/80 text-white" : "bg-slate-800/80 text-slate-200 border border-slate-700/40"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/40"><SpinnerGap size={16} className="animate-spin text-emerald-400" /></div></div>}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800/60">
        <div className="flex gap-2">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && sendPrompt()} placeholder={t("ai_prompt", lang)} className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/40" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={sendPrompt} disabled={loading || !prompt.trim()} className="p-2.5 rounded-xl bg-emerald-500 text-white disabled:opacity-40 hover:bg-emerald-400 transition-colors">
            <PaperPlaneRight size={16} weight="fill" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

interface SocialHubProps {
  state: GlobalState
  lang: Lang
  onUpdate: (state: GlobalState) => void
}

export function SocialHub({ state, lang, onUpdate }: SocialHubProps) {
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [formValues, setFormValues] = useState({ clientId: "", clientSecret: "", accessToken: "" })

  const updateSocial = (platform: string, updates: Partial<SocialIntegrationConfig>) => {
    const configs = state.socialConfigs.map(c => c.platform === platform ? { ...c, ...updates } : c)
    onUpdate({ ...state, socialConfigs: configs })
  }

  const saveConfig = (platform: string) => {
    const config = state.socialConfigs.find(c => c.platform === platform)
    if (!config) return
    const hasCreds = formValues.accessToken || (formValues.clientId && formValues.clientSecret)
    updateSocial(platform, { ...formValues, isConnected: !!hasCreds, missingConfigReason: hasCreds ? undefined : "Provide at least an access token or client credentials" })
    setEditingPlatform(null)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800/60">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Globe size={22} className="text-cyan-400" /> {t("social", lang)}</h2>
        <p className="text-xs text-slate-500 mt-1">Connect social platforms with official API credentials</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.socialConfigs.map(config => {
          const Icon = PLATFORM_ICONS[config.platform] || Globe
          return (
            <motion.div key={config.platform} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.isConnected ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/40 text-slate-500"}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white capitalize">{config.platform === "x" ? "X (Twitter)" : config.platform}</h3>
                  <p className={`text-[11px] ${config.isConnected ? "text-emerald-400" : "text-slate-500"}`}>
                    {config.isConnected ? t("connected", lang) : config.missingConfigReason || t("social_config_needed", lang)}
                  </p>
                </div>
                <button onClick={() => { setEditingPlatform(editingPlatform === config.platform ? null : config.platform); setFormValues({ clientId: config.clientId, clientSecret: config.clientSecret, accessToken: config.accessToken }) }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-700/60 text-slate-300 hover:bg-slate-600/60 transition-colors">
                  {editingPlatform === config.platform ? t("cancel", lang) : t("social_connect", lang)}
                </button>
              </div>
              {editingPlatform === config.platform && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-2 overflow-hidden">
                  <input value={formValues.clientId} onChange={e => setFormValues({ ...formValues, clientId: e.target.value })} placeholder="Client ID / App ID" className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                  <input value={formValues.clientSecret} onChange={e => setFormValues({ ...formValues, clientSecret: e.target.value })} placeholder="Client Secret" className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                  <input value={formValues.accessToken} onChange={e => setFormValues({ ...formValues, accessToken: e.target.value })} placeholder="Access Token / Bot Token" className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/40 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => saveConfig(config.platform)} className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-[11px] font-medium hover:bg-cyan-400 transition-colors">{t("save", lang)}</button>
                    <p className="text-[10px] text-slate-500">Credentials stored locally. Never sent to third parties.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
