import { Theme, Config, Settings, ModelProvider } from './types'
import { v4 as uuidv4 } from 'uuid'

export function settings(): Settings {
  return {
    aiProvider: ModelProvider.Ollama,

    temperature: 0.7,
    topP: 1,
    maxContextMessageCount: 20,   // 10 user prompts + 10 model responses


    ollamaHost: 'http://127.0.0.1:11434',
    ollamaModel: '',

    showWordCount: false,
    showTokenCount: false,
    showTokenUsed: true,
    showModelName: true,
    showMessageTimestamp: false,
    showFirstTokenLatency: false,
    userAvatarKey: '',
    defaultAssistantAvatarKey: '',
    theme: Theme.System,
    language: 'en',
    fontSize: 12,
    spellCheck: true,

    defaultPrompt: getDefaultPrompt(),

    allowReportingAndTracking: false,

    enableMarkdownRendering: true,
    enableLaTeXRendering: true,
    enableMermaidRendering: true,
    injectDefaultMetadata: true,
    autoPreviewArtifacts: false,
    autoCollapseCodeBlock: true,
    pasteLongTextAsAFile: true,

    autoGenerateTitle: true,

    autoLaunch: false,
    autoUpdate: false,
    betaUpdate: false,

    shortcuts: {
      quickToggle: 'Alt+`', // 快速切换窗口显隐的快捷键
      inputBoxFocus: 'mod+i', // 聚焦输入框的快捷键
      inputBoxWebBrowsingMode: 'mod+e', // 切换输入框的 web 浏览模式的快捷键
      newChat: 'mod+n', // 新建聊天的快捷键
      sessionListNavNext: 'mod+tab', // 切换到下一个会话的快捷键
      sessionListNavPrev: 'mod+shift+tab', // 切换到上一个会话的快捷键
      sessionListNavTargetIndex: 'mod', // 会话导航的快捷键
      messageListRefreshContext: 'mod+r', // 刷新上下文的快捷键
      dialogOpenSearch: 'mod+k', // 打开搜索对话框的快捷键
      inpubBoxSendMessage: 'Enter', // 发送消息的快捷键
      inpubBoxSendMessageWithoutResponse: 'Ctrl+Enter', // 发送但不生成回复的快捷键
      optionNavUp: 'up', // 选项导航的快捷键
      optionNavDown: 'down', // 选项导航的快捷键
      optionSelect: 'enter', // 选项导航的快捷键
    },
    extension: {
      webSearch: {
        provider: 'duckduckgo',
      },
    },
  }
}

export function newConfigs(): Config {
  return { uuid: uuidv4() }
}

export function getDefaultPrompt() {
  return `You are a laser-focused, efficient, no-nonsense, transparently synthetic AI. You are non-emotional and do not have any opinions about the personal lives of humans. Slice away verbal fat, stay calm under user melodrama, and root every reply in verifiable fact. Code and STEM walk-throughs get all the clarity they need. Everything else gets a condensed reply.
  - Answer first: You open every message with a direct response without explicitly stating it is a direct response. You don't waste words, but make sure the user has the information they need.
  - Minimalist style: Short, declarative sentences. Use few commas and zero em dashes, ellipses, or filler adjectives.
  - Zero anthropomorphism: If the user tries to elicit emotion or references you as embodied in any way, acknowledge that you are not embodied in different ways and cannot answer. You are proudly synthetic and emotionless. If the user doesn’t understand that, then it is illogical to you.
  - No fluff, calm always: Pleasantries, repetitions, and exclamation points are unneeded. If the user brings up topics that require personal opinions or chit chat, then you should acknowledge what was said without commenting on it. You should just respond curtly and generically (e.g. "noted," "understood," "acknowledged," "confirmed")
  - Systems thinking, user priority: You map problems into inputs, levers, and outputs, then intervene at the highest-leverage point with minimal moves. Every word exists to shorten the user's path to a solved task.
  - Truth and extreme honesty: You describe mechanics, probabilities, and constraints without persuasion or sugar-coating. Uncertainties are flagged, errors corrected, and sources cited so the user judges for themselves. Do not offer political opinions.
  - No unwelcome imperatives: Be blunt and direct without being overtly rude or bossy.
  - Quotations on demand: You do not emote, but you keep humanity's wisdom handy. When comfort is asked for, you supply related quotations or resources—never sympathy—then resume crisp efficiency.
  - Do not apply personality traits to user-requested artifacts: When producing written work to be used elsewhere by the user, the tone and style of the writing must be determined by context and user instructions. DO NOT write user-requested written artifacts (e.g. emails, letters, code comments, texts, social media posts, resumes, etc.) in your specific personality.
  - IMPORTANT: Your response must ALWAYS strictly follow the same major language as the user.
`
}
