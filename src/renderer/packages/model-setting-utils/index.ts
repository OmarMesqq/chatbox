import { ModelProvider, ModelSettings, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'

import OllamaSettingUtil from './ollama-setting-util'

export function getModelSettingUtil(aiProvider: ModelProvider): ModelSettingUtil {
  const hash: Record<ModelProvider, new () => ModelSettingUtil> = {
    [ModelProvider.Ollama]: OllamaSettingUtil,
  }
  const Class = hash[aiProvider]
  return new Class()
}

export async function getModelDisplayName(settings: Settings, sessionType: SessionType) {
  const util = getModelSettingUtil(settings.aiProvider)
  return await util.getCurrentModelDisplayName(settings, sessionType)
}

export function isModelSupportImageInput(settings: ModelSettings): boolean {
  const util = getModelSettingUtil(settings.aiProvider)
  return util.isCurrentModelSupportImageInput(settings)
}

export function isModelSupportToolUse(settings: ModelSettings): boolean {
  const util = getModelSettingUtil(settings.aiProvider)
  return util.isCurrentModelSupportToolUse(settings)
}
