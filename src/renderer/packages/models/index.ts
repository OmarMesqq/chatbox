
import { Settings, Config, ModelProvider } from '../../../shared/types'

import Ollama from './ollama'

import type { ModelInterface } from './types'


export function getModel(setting: Settings, config: Config): ModelInterface {
  switch (setting.aiProvider) {
    case ModelProvider.Ollama:
      return new Ollama(setting)
    
    default:
      throw new Error('Cannot find model with provider: ' + setting.aiProvider)
  }
}

export const aiProviderNameHash: Record<ModelProvider, string> = {
  [ModelProvider.Ollama]: 'Ollama API',
}

export const AIModelProviderMenuOptionList = [
  {
    value: ModelProvider.Ollama,
    label: aiProviderNameHash[ModelProvider.Ollama],
    disabled: false,
  },
]
