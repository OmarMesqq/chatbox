import SimpleSelect from '@/components/SimpleSelect'
import { Box, FormGroup, Link, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Settings } from '../../../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '../../components/Accordion'

interface Props {
  settingsEdit: Settings
  setSettingsEdit: (settings: Settings) => void
}

export default function ExtensionSettingTab(props: Props) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()

  return (
    <Box>
      <Accordion expanded={true}>
        <AccordionSummary aria-controls="panel1a-content">
          <Typography>{t('Web Search')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <FormGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('Search Provider')}
              </Typography>
              <SimpleSelect
                label={t('Search Provider')}
                value={settingsEdit.extension?.webSearch?.provider ?? 'build-in'}
                onChange={(provider) => {
                  setSettingsEdit({
                    ...settingsEdit,
                    extension: {
                      ...settingsEdit.extension,
                      webSearch: {
                        ...settingsEdit.extension?.webSearch,
                        provider,
                      },
                    },
                  })
                }}
                options={[
                  { value: 'build-in', label: 'Chatbox' },
                ]}
              />
            </FormGroup>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
