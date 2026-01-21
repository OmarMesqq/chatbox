import Markdown from '@/components/Markdown'
import Page from '@/components/Page'
import { Box, Button } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import useVersion from '../hooks/useVersion'
import * as i18n from '../i18n'
import platform from '../platform'
import iconPNG from '../static/icon.png'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const { t, i18n: _i18n } = useTranslation()

  const versionHook = useVersion()

  return (
    <Page title="About Chatbox">
      <div className="max-w-3xl mx-auto">
        <Box sx={{ textAlign: 'center', padding: '0 20px' }}>
          <img src={iconPNG} style={{ width: '100px', margin: 0, display: 'inline-block' }} />
          <h3 style={{ margin: '4px 0 5px 0' }}>
            Chatbox
            {/\d/.test(versionHook.version) ? `(v${versionHook.version})` : ''}
          </h3>
          <p className="p-0 m-0">{t('about-slogan')}</p>
          <p className="p-0 m-0 opacity-60 text-xs">{t('about-introduction')}</p>
          <p className="p-0 m-0 text-center text-xs opacity-70">
            Inspired by the amazing project{' '}
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => platform.openLink('https://github.com/Bin-Huang/chatbox')}
            >
              Chatbox
            </span>
          </p>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
          className="mt-1 mb-4"
        >
          <Button
            variant="outlined"
            onClick={() => platform.openLink(`https://github.com/OmarMesqq/chatbox`)}
          >
            {t('Check Update')}
          </Button>

        </Box>

        <Box>
          <h4 className="text-center mb-1 mt-2">{t('Changelog')}</h4>
          <Box className="px-6">
            <Markdown>{i18n.changelog()}</Markdown>
          </Box>
        </Box>
      </div>
    </Page>
  )
}
