import { Box, Button, Divider, Typography } from '@mui/material'
import { ModelProvider, ModelSettings } from '../../../shared/types'
import OllamaSetting from './OllamaSetting'
import { useTranslation } from 'react-i18next'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function ModelSettingTab(props: ModelConfigProps) {
  const { t } = useTranslation();
  const { settingsEdit, setSettingsEdit } = props;
  const aiProvider = settingsEdit.aiProvider;

  return (
    <>
      <Box>
        <Typography variant="caption" className="opacity-50">
          {t('Model Provider')}:
        </Typography>
        <div className="flex items-end justify-between">
          <Button variant="contained" disableElevation>
            <Typography className="text-left" maxWidth={200} noWrap>
              {aiProvider || 'Unknown AI Provider'}
            </Typography>
          </Button>
        </div>

        <Divider sx={{ marginTop: '10px', marginBottom: '14px' }} />

        {settingsEdit.aiProvider === ModelProvider.Ollama && (
          <OllamaSetting settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
        )}
      </Box>
    </>
  )
}
