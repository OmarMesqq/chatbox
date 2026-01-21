import {
  ModelProvider,
  ModelSettings,
  Session,
  createMessage,
  isChatSession
} from '@/../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '@/components/Accordion'
import EditableAvatar from '@/components/EditableAvatar'
import { ImageInStorage, handleImageInputAndSave } from '@/components/Image'
import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import { OllamaModelSelect } from '@/components/model-select/OllamaModelSelect'
import TemperatureSlider from '@/components/TemperatureSlider'
import TopPSlider from '@/components/TopPSlider'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import { OllamaHostInput } from '@/pages/SettingDialog/OllamaSetting'
import { StorageKeyGenerator } from '@/storage/StoreStorage'
import * as atoms from '@/stores/atoms'
import { getSession, saveSession } from '@/stores/sessionStorageMutations'
import * as sessionActions from '@/stores/sessionActions'
import { getMessageText } from '@/utils/message'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import ImageIcon from '@mui/icons-material/Image'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { OPENAI_MAX_CONTEXT_MESSAGE_COUNT } from '@/MAGIC_NUMBER'

const SessionSettings = NiceModal.create(({ chatConfigDialogSessionId }: { chatConfigDialogSessionId: string }) => {
  const modal = useModal()
  const { t } = useTranslation()
  const isSmallScreen = useIsSmallScreen()
  const globalSettings = useAtomValue(atoms.settingsAtom)
  const theme = useTheme()

  const chatConfigDialogSession = getSession(chatConfigDialogSessionId || '')
  const [editingData, setEditingData] = React.useState<Session | null>(chatConfigDialogSession || null)
  useEffect(() => {
    if (!chatConfigDialogSession) {
      setEditingData(null)
    } else {
      setEditingData({
        ...chatConfigDialogSession,
        settings: chatConfigDialogSession.settings ? { ...chatConfigDialogSession.settings } : undefined,
      })
    }
  }, [chatConfigDialogSessionId])

  const [systemPrompt, setSystemPrompt] = React.useState('')
  useEffect(() => {
    if (!chatConfigDialogSession) {
      setSystemPrompt('')
    } else {
      const systemMessage = chatConfigDialogSession.messages.find((m) => m.role === 'system')
      setSystemPrompt(systemMessage ? getMessageText(systemMessage) : '')
    }
  }, [chatConfigDialogSessionId])

  const onReset = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (chatConfigDialogSession) {
      setEditingData({
        ...chatConfigDialogSession,
        settings: undefined,
      })
    }
  }


  const onCancel = () => {
    if (chatConfigDialogSession) {
      setEditingData({
        ...chatConfigDialogSession,
      })
    }
    modal.resolve()
    modal.hide()
  }
  const onSave = () => {
    if (!chatConfigDialogSession || !editingData) {
      return
    }
    if (editingData.name === '') {
      editingData.name = chatConfigDialogSession.name
    }
    editingData.name = editingData.name.trim()
    if (systemPrompt === '') {
      editingData.messages = editingData.messages.filter((m) => m.role !== 'system')
    } else {
      const systemMessage = editingData.messages.find((m) => m.role === 'system')
      if (systemMessage) {
        systemMessage.contentParts = [{ type: 'text', text: systemPrompt.trim() }]
      } else {
        editingData.messages.unshift(createMessage('system', systemPrompt.trim()))
      }
    }
    saveSession(editingData)
    // setChatConfigDialogSessionId(null)
    modal.resolve()
    modal.hide()
  }

  if (!chatConfigDialogSession || !editingData) {
    return null
  }

  return (
    <Dialog
      {...muiDialogV5(modal)}
      onClose={() => {
        modal.resolve()
        modal.hide()
      }}
      fullWidth
    >
      <DialogTitle>{t('Conversation Settings')}</DialogTitle>
      <DialogContent>
        <DialogContentText></DialogContentText>
        <EditableAvatar
          onChange={(event) => {
            const key = StorageKeyGenerator.picture(`assistant-avatar:${chatConfigDialogSession?.id}`)
            handleImageInputAndSave(event, key, () => setEditingData({ ...editingData, assistantAvatarKey: key }))
          }}
          onRemove={() => {
            setEditingData({ ...editingData, assistantAvatarKey: undefined })
          }}
          removable={!!editingData.assistantAvatarKey}
          sx={{
            backgroundColor:
              editingData.picUrl !== undefined
                ? theme.palette.background.default
                : theme.palette.primary.main,
          }}
        >
          {editingData.assistantAvatarKey ? (
            <ImageInStorage
              storageKey={editingData.assistantAvatarKey}
              className="object-cover object-center w-full h-full"
            />
          ) : editingData.picUrl ? (
            <img src={editingData.picUrl} className="object-cover object-center w-full h-full" />
          ) : globalSettings.defaultAssistantAvatarKey ? (
            <ImageInStorage
              storageKey={globalSettings.defaultAssistantAvatarKey}
              className="object-cover object-center w-full h-full"
            />
          ) : (
            <SmartToyIcon fontSize="large" />
          )}
        </EditableAvatar>
        <TextField
          autoFocus={!isSmallScreen}
          margin="dense"
          label={t('name')}
          type="text"
          fullWidth
          variant="outlined"
          value={editingData.name}
          onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
        />
        <Accordion defaultExpanded={!!editingData.settings} className="mt-2">
          <AccordionSummary aria-controls="panel1a-content">
            <div className="flex flex-row w-full justify-between items-center">
              <Typography>{t('Specific model settings')}</Typography>
              {editingData.settings && (
                <Button size="small" variant="text" color="warning" onClick={onReset}>
                  {t('Reset to Global Settings')}
                </Button>
              )}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {isChatSession(chatConfigDialogSession) && (
              <ChatConfig dataEdit={editingData} setDataEdit={setEditingData} />
            )}
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button onClick={onSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  )
})

export default SessionSettings

function ChatConfig(props: { dataEdit: Session; setDataEdit: (data: Session) => void }) {
  const { dataEdit, setDataEdit } = props

  // 全局设置
  const [globalSettings, setGlobalSettings] = useAtom(atoms.settingsAtom)
  // 会话生效设置 = 全局设置 + 会话设置
  const mergedSettings = sessionActions.mergeSettings(globalSettings, dataEdit.settings || {}, dataEdit.type || 'chat')
  // 修改当前会话设置
  const updateSettingsEdit = (updated: Partial<ModelSettings>) => {
    setDataEdit({
      ...dataEdit,
      settings: {
        ...(dataEdit.settings || {}),
        ...updated,
      },
    })
  }
  const specificSettings = dataEdit.settings || {}

  return (
    <>
      <Divider sx={{ margin: '16px 0' }} />
      
      {mergedSettings.aiProvider === ModelProvider.Ollama && (
        <>
          <OllamaHostInput
            ollamaHost={mergedSettings.ollamaHost}
            setOllamaHost={(v) => updateSettingsEdit({ ollamaHost: v })}
            className={specificSettings.ollamaHost === undefined ? 'opacity-50' : ''}
          />
          <OllamaModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.ollamaModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      <MaxContextMessageCountSlider
        value={toBeRemoved_getContextMessageCount(
          OPENAI_MAX_CONTEXT_MESSAGE_COUNT,
          mergedSettings.maxContextMessageCount
        )}
        onChange={(v) => updateSettingsEdit({ maxContextMessageCount: v })}
        className={'opacity-50'}
      />
      <TemperatureSlider
        value={mergedSettings.temperature}
        onChange={(v) => updateSettingsEdit({ temperature: v })}
        className={specificSettings.temperature === undefined ? 'opacity-50' : ''}
      />
      <TopPSlider
        topP={mergedSettings.topP}
        setTopP={(v) => updateSettingsEdit({ topP: v })}
        className={specificSettings.topP === undefined ? 'opacity-50' : ''}
      />
    </>
  )
}
