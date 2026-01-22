import MaxContextMessageCountSlider from '@/components/MaxContextMessageCountSlider'
import { OllamaModelSelect } from '@/components/model-select/OllamaModelSelect'
import TemperatureSlider from '@/components/TemperatureSlider'
import TextFieldReset from '@/components/TextFieldReset'
import { languageAtom } from '@/stores/atoms'
import { Stack, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from '@/../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '@/components/Accordion'

export function OllamaHostInput(props: {
  ollamaHost: string
  setOllamaHost: (host: string) => void
  className?: string
}) {
  const { t } = useTranslation()
  const language = useAtomValue(languageAtom)
  return (
    <>
      <TextFieldReset
        label={t('api host')}
        value={props.ollamaHost}
        defaultValue="http://localhost:11434"
        onValueChange={props.setOllamaHost}
        fullWidth
        className={props.className}
      />
    </>
  )
}

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function OllamaSetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  return (
    <Stack spacing={2}>
      <OllamaHostInput
        ollamaHost={settingsEdit.ollamaHost}
        setOllamaHost={(v) => setSettingsEdit({ ...settingsEdit, ollamaHost: v })}
      />
      <OllamaModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
      <Accordion>
        <AccordionSummary aria-controls="panel1a-content">
          <Typography>{t('Advanced')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MaxContextMessageCountSlider
            value={settingsEdit.maxContextMessageCount}
            onChange={(v) => setSettingsEdit({ ...settingsEdit, maxContextMessageCount: v })}
          />
          <TemperatureSlider
            value={settingsEdit.temperature}
            onChange={(v) => setSettingsEdit({ ...settingsEdit, temperature: v })}
          />
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}
