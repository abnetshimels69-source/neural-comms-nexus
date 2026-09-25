export type Lang = "en" | "am" | "om" | "ti" | "so" | "ar" | "fr"

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "om", label: "Afaan Oromo", native: "Afaan Oromoo" },
  { code: "ti", label: "Tigrinya", native: "ትግርኛ" },
  { code: "so", label: "Somali", native: "Soomaali" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "fr", label: "French", native: "Français" },
]

type Dict = Record<string, string>

const en: Dict = {
  chats: "Chats", contacts: "Contacts", groups: "Groups", channels: "Channels",
  ai_hub: "AI Hub", social: "Social", settings: "Settings", profile: "Profile",
  type_message: "Type a message...", send: "Send", reply: "Reply", edit: "Edit",
  delete: "Delete", copy: "Copy", forward: "Forward", pin: "Pin", unpin: "Unpin",
  star: "Star", recording: "Recording", hold_to_record: "Hold to record voice message",
  new_chat: "New Chat", new_group: "New Group", new_channel: "New Channel",
  add_contact: "Add Contact", search: "Search", search_placeholder: "Search messages, contacts...",
  online: "Online", offline: "Offline", last_seen: "Last seen",
  unread: "Unread", no_messages: "No messages yet", no_conversations: "No conversations",
  login: "Login", logout: "Logout", register: "Register", phone_number: "Phone Number",
  enter_otp: "Enter OTP Code", verify: "Verify", resend_code: "Resend Code",
  code_sent: "Code sent via SMS", invalid_code: "Invalid verification code",
  auth_config_needed: "SMS Auth Configuration Required",
  auth_config_msg: "Connect Firebase or Twilio for real OTP delivery. Configure in Settings > Authentication.",
  ai_connect: "Connect AI Provider", ai_api_key: "API Key", ai_model: "Model",
  ai_test: "Test Connection", ai_chat: "AI Chat", ai_prompt: "Enter your prompt...",
  ai_no_key: "No API key configured. Add your key in Settings.",
  ai_error_401: "Invalid API key. Check your provider dashboard.",
  ai_error_429: "Rate limited. Wait and try again.",
  ai_error_network: "Network error. Check your connection.",
  social_connect: "Connect Platform", social_config_needed: "Configuration Required",
  blocked: "Blocked", block: "Block", unblock: "Unblock",
  theme: "Theme", language: "Language", notifications: "Notifications",
  privacy: "Privacy", data_storage: "Data & Storage", clear_cache: "Clear Cache",
  connected: "Connected", disconnected: "Disconnected", testing: "Testing...",
  missing_key: "Missing API Key", invalid_key: "Invalid Key",
  members: "Members", admin: "Admin", subscriber: "Subscriber", subscribers: "Subscribers",
  broadcast: "Broadcast", post: "Post", write_post: "Write a post...",
  global_search: "Global Search", search_all: "Search across all content...",
  cancel: "Cancel", save: "Save", confirm: "Confirm", done: "Done",
  voice_call: "Voice Call", video_call: "Video Call", end_call: "End Call",
  calling: "Calling...", ringing: "Ringing...",
  pinned_messages: "Pinned Messages", reply_to: "Reply to",
  deleted: "This message was deleted", edited: "edited",
  delivered: "Delivered", read: "Read", sent: "Sent",
}

const am: Dict = {
  chats: "ውይይቶች", contacts: "እውቂያዎች", groups: "ቡድኖች", channels: "ጣቢያዎች",
  ai_hub: "AI ማዕከል", social: "ማህበራዊ", settings: "ቅንብሮች", profile: "መገለጫ",
  type_message: "መልዕክት ይጻፉ...", send: "ላክ", reply: "ምላሽ", edit: "አስተካክል",
  delete: "ሰርዝ", copy: "ቅዳ", forward: "አስተላልፍ", pin: "አሰይ", unpin: "አላሰይ",
  online: "በመስመር ላይ", offline: "ከመስመር ውጭ", login: "ግባ", logout: "ውጣ",
  register: "ተመዝገብ", phone_number: "ስልክ ቁጥር", search: "ፈልግ",
  new_chat: "አዲስ ውይይት", new_group: "አዲስ ቡድን", new_channel: "አዲስ ጣቢያ",
  add_contact: "እውቂያ ጨምር", no_messages: "እስካሁን መልዕክቶች የሉም",
  connected: "ተገናኝቷል", disconnected: "ተቋረጠ", save: "አስቀምጥ", cancel: "ሰርዝ",
  theme: "ገጽታ", language: "ቋንቋ", notifications: "ማሳወቂያዎች",
  privacy: "ግላዊነት", members: "አባላት", admin: "አስተዳዳሪ",
  recording: "በመቅዳት ላይ", blocked: "ታግዷል",
}

const om: Dict = {
  chats: "Haasawwan", contacts: "Quunnamtii", groups: "Garee", channels: "Chaanaawwan",
  ai_hub: "Dubartuu AI", social: "Hawaasummaa", settings: "Qindaaʼinnoo", profile: "Piroofaayilii",
  type_message: "Ergaa barreessi...", send: "Ergi", reply: "Deebisi", edit: "Gulaali",
  delete: "Balleessi", copy: "Coppii", forward: "Itti fufi", online: "Onlaayinii",
  offline: "Offlaayinii", login: "Galmee", logout: "Baʼi", register: "Galmee haaraa",
  search: "Barbaadi", connected: "Walqabate", save: "Olkaaʼi", cancel: "Haqi",
  theme: "Bifa", language: "Afaan", notifications: "Beeksisawwan",
}

const ti: Dict = {
  chats: "ዝርርባት", contacts: "ርክባት", groups: "ጉጅለታት", channels: "ጣብያት",
  ai_hub: "ማእከል AI", social: "ማሕበራዊ", settings: "ቅጥዕታት", profile: "መፍለጢ",
  type_message: "መልእኽቲ ጽሓፍ...", send: "ስደድ", reply: "መልሲ", edit: "ኣዐርዮ",
  delete: "ኣውጽእ", online: "ኦንላይን", offline: "ኦፍላይን", login: "እተው",
  search: "ድለ", connected: "ተተኣሳሲሩ", save: "ኣቐምጥ", cancel: "ሰርዝ",
}

const so: Dict = {
  chats: "Sheekooyin", contacts: "Xiriirrada", groups: "Kooxaha", channels: "Kanaalada",
  ai_hub: "Xarunta AI", social: "Bulshada", settings: "Habaynta", profile: "Astaanta",
  type_message: "Qor fariin...", send: "Dir", reply: "U jawaab", edit: "Wax ka beddel",
  delete: "Tirtir", online: "Khadka tooska ah", offline: "Ka baxsan",
  login: "Gal", search: "Raadi", connected: "Xiran", save: "Kaydi", cancel: "Jooji",
}

const ar: Dict = {
  chats: "المحادثات", contacts: "جهات الاتصال", groups: "المجموعات", channels: "القنوات",
  ai_hub: "مركز الذكاء الاصطناعي", social: "التواصل", settings: "الإعدادات", profile: "الملف الشخصي",
  type_message: "اكتب رسالة...", send: "إرسال", reply: "رد", edit: "تعديل",
  delete: "حذف", online: "متصل", offline: "غير متصل", login: "تسجيل الدخول",
  search: "بحث", connected: "متصل", save: "حفظ", cancel: "إلغاء",
}

const fr: Dict = {
  chats: "Discussions", contacts: "Contacts", groups: "Groupes", channels: "Canaux",
  ai_hub: "Centre IA", social: "Social", settings: "Paramètres", profile: "Profil",
  type_message: "Tapez un message...", send: "Envoyer", reply: "Répondre", edit: "Modifier",
  delete: "Supprimer", online: "En ligne", offline: "Hors ligne", login: "Connexion",
  search: "Rechercher", connected: "Connecté", save: "Enregistrer", cancel: "Annuler",
}

const translations: Record<Lang, Dict> = { en, am, om, ti, so, ar, fr }

export function t(key: string, lang: Lang = "en"): string {
  return translations[lang]?.[key] || translations.en[key] || key
}
