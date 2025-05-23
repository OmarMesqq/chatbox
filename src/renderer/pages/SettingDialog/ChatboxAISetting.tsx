import { Tooltip, Button, ButtonGroup, Card, Typography, Box } from '@mui/material'
import { ChatboxAILicenseDetail, ModelSettings } from '../../../shared/types'
import { Trans, useTranslation } from 'react-i18next'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PasswordTextField from '../../components/PasswordTextField'
import ChatboxAIModelSelect from '../../components/model-select/ChatboxAIModelSelect'
import { CHATBOX_BUILD_TARGET } from '@/variables'
import LinearProgress, { LinearProgressProps, linearProgressClasses } from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'
import { Accordion, AccordionSummary, AccordionDetails } from '../../components/Accordion'
import React, { useEffect, useState } from 'react'
import * as remote from '@/packages/remote'
import CircularProgress from '@mui/material/CircularProgress'
import platform from '@/platform'
import * as premiumActions from '@/stores/premiumActions'
import { useAtomValue } from 'jotai'
import { languageAtom } from '@/stores/atoms'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function ChatboxAISetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  const activated = premiumActions.useAutoValidate()
  const [loading, setLoading] = useState(false)
  const [tip, setTip] = useState<React.ReactNode | null>(null)
  const language = useAtomValue(languageAtom)

  const onInputChange = (value: string) => {
    setLoading(false)
    setTip(null)
    setSettingsEdit({ ...settingsEdit, licenseKey: value })
  }

  const activate = async () => {
    setLoading(true)
    setTip(null)
    try {
      const result = await premiumActions.activate(settingsEdit.licenseKey || '')
      if (!result.valid) {
        switch (result.error) {
          case 'reached_activation_limit':
            setTip(
              <Box className="text-red-500">
                <Trans
                  i18nKey="This license key has reached the activation limit, <a>click here</a> to manage license and devices to deactivate old devices."
                  components={{
                    a: (
                      <a
                        href={`https://chatboxai.app/redirect_app/manage_license/${language}`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                  }}
                />
              </Box>
            )
            break
          case 'not_found':
            setTip(<Box className="text-red-500">{t('License not found, please check your license key')}</Box>)
            break
          case 'expired':
            setTip(<Box className="text-red-500">{t('License expired, please check your license key')}</Box>)
            break
        }
      }
    } catch (e: any) {
      setTip(
        <Box className="text-red-500">
          {t('Failed to activate license, please check your license key and network connection')}
          <br />
          {`${e?.message}`.slice(0, 100)}
        </Box>
      )
    }
    setLoading(false)
  }

  // 自动激活
  useEffect(() => {
    if (
      settingsEdit.licenseKey &&
      settingsEdit.licenseKey.length >= 36 &&
      !settingsEdit.licenseInstances?.[settingsEdit.licenseKey] // 仅当 license key 还没激活
    ) {
      activate()
    }
  }, [settingsEdit.licenseKey])

  return (
    <Box>
      <Box>
        <PasswordTextField
          label={t('Chatbox AI License')}
          value={settingsEdit.licenseKey || ''}
          setValue={onInputChange}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
          disabled={activated}
        />
        <Box>
          <ButtonGroup disabled={loading} sx={{ display: 'block', marginBottom: '15px' }}>
            {tip}
            {activated && (
              <>
                <span className="text-green-700 text-xs mr-2">{t('License Activated')}</span>
                <Button
                  variant="text"
                  onClick={() => {
                    premiumActions.deactivate()
                  }}
                >
                  {t('clean')}({t('Deactivate')})
                </Button>
              </>
            )}
            {!activated && (
              <Button variant={settingsEdit.licenseKey ? 'outlined' : 'text'} onClick={activate}>
                {loading ? t('Activating...') : t('Activate License')}
              </Button>
            )}
          </ButtonGroup>
        </Box>
        <ChatboxAIModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
        {CHATBOX_BUILD_TARGET === 'mobile_app' ? (
          <DetailCardForMobileApp licenseKey={settingsEdit.licenseKey} activated={activated} />
        ) : (
          <DetailCard licenseKey={settingsEdit.licenseKey} activated={activated} />
        )}
      </Box>
    </Box>
  )
}

// 详细信息卡片
function DetailCard(props: { licenseKey?: string; activated: boolean }) {
  const { licenseKey, activated } = props
  const { t } = useTranslation()
  return (
    <Card sx={{ marginTop: '20px', padding: '10px 14px' }} elevation={3}>
      {activated && (
        <Box>
          <Box className="mb-2">
            <ActivedButtonGroup />
          </Box>
          <LicenseDetail licenseKey={licenseKey} />
        </Box>
      )}
      {!activated && <InactivedButtonGroup />}
      <Box className="mt-2" sx={{ opacity: activated ? '0.5' : undefined }}>
        <Typography>{t('Chatbox AI offers a user-friendly AI solution to help you enhance productivity')}</Typography>
        <Box>
          {[
            t('Smartest AI-Powered Services for Rapid Access'),
            t('Vision, Drawing, File Understanding and more'),
            t('Hassle-free setup'),
            t('Ideal for work and study'),
          ].map((item) => (
            <Box key={item} sx={{ display: 'flex', margin: '4px 0' }}>
              <CheckCircleOutlineIcon color={activated ? 'success' : 'action'} />
              <b style={{ marginLeft: '5px' }}>{item}</b>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  )
}

// 移动应用的详细信息卡片
function DetailCardForMobileApp(props: { licenseKey?: string; activated: boolean }) {
  const { licenseKey, activated } = props
  const { t } = useTranslation()
  return activated ? (
    <Card sx={{ marginTop: '20px', padding: '14px' }} elevation={3}>
      <span
        style={{
          fontWeight: 'bold',
          backgroundColor: 'green',
          color: 'white',
          padding: '2px 4px',
        }}
      >
        {t('License Activated')}!
      </span>
      <ActivedButtonGroup />
      <LicenseDetail licenseKey={licenseKey} />
    </Card>
  ) : null
}

// 激活后的按钮组
function ActivedButtonGroup() {
  const { t } = useTranslation()
  const language = useAtomValue(languageAtom)
  return (
    <Box sx={{ marginTop: '10px' }}>
      <Button
        variant="outlined"
        sx={{ marginRight: '10px' }}
        onClick={() => {
          platform.openLink(`https://example.com`)
        }}
      >
        {t('Manage License and Devices')}
      </Button>
      <Button
        variant="outlined"
        // color='warning'
        sx={{ marginRight: '10px' }}
        onClick={() => {
          premiumActions.deactivate()
        }}
      >
        {t('Deactivate')}
      </Button>
      <Button
        variant="text"
        sx={{ marginRight: '10px' }}
        onClick={() => {
          platform.openLink('https://example.com')
        }}
      >
        {t('View More Plans')}
      </Button>
    </Box>
  )
}

// 未激活时的按钮组
function InactivedButtonGroup() {
  const { t } = useTranslation()
  const language = useAtomValue(languageAtom)
  return (
    <Box sx={{ marginTop: '10px' }}>
      <Button
        variant="contained"
        sx={{
          marginRight: '10px',
          fontWeight: 'bold',
          padding: '8px 24px',
          backgroundColor: '#10b981',
          color: 'white',
          boxShadow: '0 2px 4px rgba(16,185,129,0.2)',
          '&:hover': {
            backgroundColor: '#059669',
            boxShadow: '0 4px 8px rgba(16,185,129,0.3)',
          },
        }}
        onClick={() => {
          platform.openLink('https://example.com')
        }}
      >
        {t('Get License')}
      </Button>
      <Button
        variant="text"
        sx={{ marginRight: '10px' }}
        onClick={() => {
          platform.openLink(`https://example.com`)
        }}
      >
        {t('Retrieve License')}
      </Button>
    </Box>
  )
}

function BorderLinearProgress(props: LinearProgressProps) {
  return (
    <_BorderLinearProgress
      variant="determinate"
      {...props}
      color={
        props.value !== undefined && props.value <= 10
          ? 'error'
          : props.value !== undefined && props.value <= 20
          ? 'warning'
          : 'inherit'
      }
    />
  )
}

const _BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 5,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {},
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}))

function LicenseDetail(props: { licenseKey?: string }) {
  const { licenseKey } = props
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<boolean>(false)
  const [licenseDetail, setLicenseDetail] = useState<ChatboxAILicenseDetail | null>(null)
  const onChange = (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded)
    if (!newExpanded) {
      setLicenseDetail(null)
      return
    }
    if (!licenseKey) {
      return
    }
    remote.getLicenseDetailRealtime({ licenseKey }).then((res) => {
      if (res) {
        setTimeout(() => {
          setLicenseDetail(res)
        }, 200) // 太快了，看不到加载效果
      }
    })
  }
  return (
    <Accordion expanded={expanded} onChange={onChange} className="mb-4">
      <AccordionSummary>
        <div>
          <span className="font-bold text-green-700 block">{t('License Activated')}!</span>
          <span className="opacity-50 text-xs font-light block">
            {t('Click to view license details and quota usage')}
          </span>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {licenseDetail ? (
          <>
            <Box className="grid sm:grid-cols-2">
              <Tooltip title={`${(licenseDetail.remaining_quota_35 * 100).toFixed(2)} %`}>
                <Box className="mr-4 mb-4">
                  <Typography className="">{t('Chatbox AI Standard Model Quota')}</Typography>
                  <BorderLinearProgress
                    className="mt-1"
                    variant="determinate"
                    value={Math.floor(licenseDetail.remaining_quota_35 * 100)}
                  />
                </Box>
              </Tooltip>
              <Tooltip title={`${(licenseDetail.remaining_quota_4 * 100).toFixed(2)} %`}>
                <Box className="mr-4 mb-4">
                  <Typography className="">{t('Chatbox AI Advanced Model Quota')}</Typography>
                  <BorderLinearProgress
                    className="mt-1"
                    variant="determinate"
                    value={Math.floor(licenseDetail.remaining_quota_4 * 100)}
                  />
                </Box>
              </Tooltip>
              <Tooltip
                title={`${licenseDetail.image_total_quota - licenseDetail.image_used_count} / ${
                  licenseDetail.image_total_quota
                }`}
              >
                <Box className="mr-4 mb-4">
                  <Typography>{t('Chatbox AI Image Quota')}</Typography>
                  <BorderLinearProgress
                    className="mt-1"
                    variant="determinate"
                    value={Math.floor(licenseDetail.remaining_quota_image * 100)}
                  />
                </Box>
              </Tooltip>
            </Box>
            <Box className="grid grid-cols-2">
              <Box className="mr-4 mb-4">
                <Typography className="">{t('Quota Reset')}</Typography>
                <Typography className="">
                  <span className="font-bold">{new Date(licenseDetail.token_refreshed_time).toLocaleDateString()}</span>
                </Typography>
              </Box>
              {licenseDetail.token_expire_time && (
                <Box className="mr-4 mb-4">
                  <Typography className="">{t('License Expiry')}</Typography>
                  <Typography className="">
                    <span className="font-bold">{new Date(licenseDetail.token_expire_time).toLocaleDateString()}</span>
                  </Typography>
                </Box>
              )}
              <Box className="mr-4 mb-4">
                <Typography className="">{t('License Plan Overview')}</Typography>
                <Typography>
                  <span className="font-bold">{licenseDetail.name}</span>
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box className="flex items-center justify-center">
            <CircularProgress />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}
