import { Box, Divider } from '@mui/material'
import { ModelProvider, ModelSettings } from '../../../shared/types'

import OllamaSetting from './OllamaSetting'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function ModelSettingTab(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  return (
    <Box>
      <Divider sx={{ marginTop: '10px', marginBottom: '24px' }} />      
      {settingsEdit.aiProvider === ModelProvider.Ollama && (
        <OllamaSetting settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
      )}
    </Box>
  )
}
