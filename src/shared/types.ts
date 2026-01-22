import { LanguageModelUsage } from 'ai'
import pick from 'lodash/pick'
import { v4 as uuidv4 } from 'uuid'

export interface SearchResultItem {
  title: string
  link: string
  snippet: string
}

export interface SearchResult {
  items: SearchResultItem[]
}

export interface MessageFile {
  id: string
  name: string
  fileType: string
  url?: string
  storageKey?: string
}

export interface MessageLink {
  id: string
  url: string
  title: string
  storageKey?: string
}

export interface MessagePicture {
  url?: string
  storageKey?: string
  loading?: boolean
}

export const MessageRoleEnum = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant',
  Tool: 'tool',
} as const

export type MessageRole = (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum]

export type MessageTextPart = { type: 'text'; text: string }
export type MessageImagePart = { type: 'image'; storageKey: string }
export type MessageToolCallPart<Args = unknown, Result = unknown> = {
  type: 'tool-call'
  state: 'call' | 'result'
  toolCallId: string
  toolName: string
  args: Args
  result?: Result
}

export type MessageContentParts = (MessageTextPart | MessageImagePart | MessageToolCallPart)[]
export type StreamTextResult = {
  contentParts: MessageContentParts
  reasoningContent?: string
  usage?: LanguageModelUsage
}

// Chatbox 应用的消息类型
export interface Message {
  id: string // 当role为tool时，id为toolCallId

  role: MessageRole
  // 把这个字段注释是为了避免新的引用，兼容老数据的时候还是可以读取
  // content?: string // contentParts 有值的时候用contentParts
  name?: string // 之前不知道是干什么的，现在用于role=tool时存储tool name

  cancel?: () => void
  generating?: boolean

  aiProvider?: ModelProvider
  model?: string

  files?: MessageFile[] // chatboxai 专用
  links?: MessageLink[] // chatboxai 专用

  // webBrowsing?: MessageWebBrowsing // chatboxai 专用, （已废弃）
  // toolCalls?: MessageToolCalls // 已废弃，使用contentParts代替

  reasoningContent?: string
  contentParts: MessageContentParts

  errorCode?: number
  error?: string
  errorExtra?: {
    [key: string]: any
  }
  status?: (
    | {
        type: 'sending_file'
        mode?: 'local'
      }
    | {
        type: 'loading_webpage'
        mode?: 'local'
      }
  )[]

  wordCount?: number // 当前消息的字数
  tokenCount?: number // 当前消息的 token 数量
  tokensUsed?: number // 生成当前消息的 token 使用量
  timestamp?: number // 当前消息的时间戳
  firstTokenLatency?: number // AI 回答首字耗时(毫秒) - 从发送请求到接收到第一个字的时间间隔
}

export type SettingWindowTab = 'ai' | 'display' | 'chat' | 'advanced' | 'extension'

export type ExportChatScope = 'all_threads' | 'current_thread'

export type ExportChatFormat = 'Markdown' | 'TXT' | 'HTML'

export type SessionType = 'chat'

export function isChatSession(session: Session) {
  return session.type === 'chat';
}

export interface Session {
  id: string
  type?: SessionType // undefined 为了兼容老版本 chat
  name: string
  picUrl?: string
  messages: Message[]
  starred?: boolean
  assistantAvatarKey?: string // 助手头像的 key
  settings?: Partial<ReturnType<typeof settings2SessionSettings>>
  threads?: SessionThread[] // 历史话题列表
  threadName?: string // 当前话题名称
  messageForksHash?: Record<
    string,
    {
      position: number // 当前分叉列表的游标
      lists: {
        id: string // fork list id
        messages: Message[]
      }[]
      createdAt: number
    }
  > // 消息 ID 对应的分叉数据
}

export type SessionMeta = Pick<Session, 'id' | 'name' | 'starred' | 'assistantAvatarKey' | 'picUrl' | 'type'>

// 话题
export interface SessionThread {
  id: string
  name: string
  messages: Message[]
  createdAt: number
}

export interface SessionThreadBrief {
  id: string
  name: string
  createdAt?: number
  createdAtLabel?: string
  firstMessageId: string
  messageCount: number
}

export function settings2SessionSettings(settings: ModelSettings) {
  return pick(settings, [
    'aiProvider',

    'maxContextMessageCount',
    'temperature',
    'topP',

    'ollamaHost',
    'ollamaModel',
  ])
}

export function createMessage(role: MessageRole = MessageRoleEnum.User, content: string = ''): Message {
  return {
    id: uuidv4(),
    contentParts: content ? [{ type: 'text', text: content }] : [], // 防止为 undefined 或 null
    role: role,
    timestamp: new Date().getTime(),
  }
}

export enum ModelProvider {
  Ollama = 'ollama',
}

export interface ModelSettings {
  aiProvider: ModelProvider // 当前应用中使用的provider（虽然可以配很多，但实际同时只能使用一个）

  ollamaHost: string
  ollamaModel: string

  temperature: number // 0-2
  topP: number // 0-1
  maxContextMessageCount: number  // amount of messages for the model to recall
}

export type ModelMeta = {
  [key: string]: {
    contextWindow: number
    maxOutput?: number
    functionCalling?: boolean
    vision?: boolean
    reasoning?: boolean
  }
}

export interface ExtensionSettings {
  webSearch: {
    provider: 'duckduckgo'
  }
}

export interface Settings extends ModelSettings {
  showWordCount?: boolean
  showTokenCount?: boolean
  showTokenUsed?: boolean
  showModelName?: boolean
  showMessageTimestamp?: boolean
  showFirstTokenLatency?: boolean

  theme: Theme
  language: Language
  languageInited?: boolean
  fontSize: number
  spellCheck: boolean

  // disableQuickToggleShortcut?: boolean // 是否关闭快捷键切换窗口显隐（弃用，为了兼容历史数据，这个字段永远不要使用）

  defaultPrompt?: string // 新会话的默认 prompt

  proxy?: string // 代理地址

  allowReportingAndTracking: boolean // 是否允许错误报告和事件追踪

  userAvatarKey?: string // 用户头像的 key
  defaultAssistantAvatarKey?: string // 默认助手头像的 key

  enableMarkdownRendering: boolean
  enableMermaidRendering: boolean
  enableLaTeXRendering: boolean
  injectDefaultMetadata: boolean // 是否注入默认附加元数据（如模型名称、当前日期）
  autoPreviewArtifacts: boolean // 是否自动展开预览 artifacts
  autoCollapseCodeBlock: boolean // 是否自动折叠代码块
  pasteLongTextAsAFile: boolean // 是否将长文本粘贴为文件

  autoGenerateTitle: boolean

  autoLaunch: boolean
  autoUpdate: boolean // 是否自动检查更新
  betaUpdate: boolean // 是否自动检查 beta 更新
  shortcuts: ShortcutSetting

  extension: ExtensionSettings
}

export interface ShortcutSetting {
  // windowQuickToggle: string // 快速切换窗口显隐的快捷键
  quickToggle: ShortcutToggleWindowValue

  inputBoxFocus: string // 聚焦输入框的快捷键
  inputBoxWebBrowsingMode: string // 切换输入框的 web 浏览模式的快捷键
  newChat: string // 新建聊天的快捷键
  sessionListNavNext: string // 切换到下一个会话的快捷键
  sessionListNavPrev: string // 切换到上一个会话的快捷键
  sessionListNavTargetIndex: string // 切换到指定会话的快捷键
  messageListRefreshContext: string // 刷新上下文的快捷键
  dialogOpenSearch: string // 打开搜索对话框的快捷键
  optionNavUp: string // 选项导航的快捷键
  optionNavDown: string // 选项导航的快捷键
  optionSelect: string // 选项导航的快捷键
  inpubBoxSendMessage: ShortcutSendValue
  inpubBoxSendMessageWithoutResponse: ShortcutSendValue
}

export const shortcutSendValues = ['', 'Enter', 'Ctrl+Enter', 'Command+Enter', 'Shift+Enter', 'Ctrl+Shift+Enter']
export type ShortcutSendValue = (typeof shortcutSendValues)[number]
export const shortcutToggleWindowValues = [
  '',
  'Alt+`',
  'Alt+Space',
  'Ctrl+Alt+Space',
  // 'Command+Space', // 系统快捷键冲突
  'Ctrl+Space', // 系统快捷键冲突
  // 'Command+Alt+Space', 系统快捷键冲突
]
export type ShortcutToggleWindowValue = (typeof shortcutToggleWindowValues)[number]

export type ShortcutName = keyof ShortcutSetting

export type Language =
  | 'en'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'de'
  | 'fr'
  | 'pt-PT'
  | 'es'
  | 'ar'
  | 'it-IT'
  | 'sv'
  | 'nb-NO'

export interface Config {
  uuid: string
}

export interface Toast {
  id: string
  content: string
}

export enum Theme {
  Dark,
  Light,
  System,
}


export interface ModelOptionGroup {
  group_name?: string
  options: {
    label: string
    value: string
    recommended?: boolean
  }[]
  // hidden?: boolean
  collapsable?: boolean
}

export function copyMessage(source: Message): Message {
  return {
    ...source,
    cancel: undefined,
    id: uuidv4(),
  }
}

export function copyThreads(source?: SessionThread[]): SessionThread[] | undefined {
  if (!source) {
    return undefined
  }
  return source.map((thread) => ({
    ...thread,
    messages: thread.messages.map(copyMessage),
    createdAt: Date.now(),
    id: uuidv4(),
  }))
}
