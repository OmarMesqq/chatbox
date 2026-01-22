import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Box, Grid } from '@mui/material'
import CleanWidnow from '@/pages/CleanWindow'
import useAppTheme from '@/hooks/useAppTheme'
import useShortcut from '@/hooks/useShortcut'
import useScreenChange, { useSidebarWidth } from '@/hooks/useScreenChange'
import * as remote from '@/packages/remote'
import { useI18nEffect } from '@/hooks/useI18nEffect'
import Toasts from '@/components/Toasts'
import * as settingActions from '@/stores/settingActions'
import RemoteDialogWindow from '@/pages/RemoteDialogWindow'
import { useSystemLanguageWhenInit } from '@/hooks/useDefaultSystemLanguage'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import * as atoms from '@/stores/atoms'
import SearchDialog from '@/pages/SearchDialog'
import Sidebar from '@/Sidebar'
import PictureDialog from '@/pages/PictureDialog'
import platform from '@/platform'
import { getOS } from '@/packages/navigator'
import ExitFullscreenButton from '@/components/ExitFullscreenButton'
import NiceModal from '@ebay/nice-modal-react'
import '@/modals'

function Root() {
  const navigate = useNavigate()
  const spellCheck = useAtomValue(atoms.spellCheckAtom)
  const language = useAtomValue(atoms.languageAtom)

  const setOpenAboutDialog = useSetAtom(atoms.openAboutDialogAtom)

  
  useEffect(() => {
    // 通过定时器延迟启动，防止处理状态底层存储的异步加载前错误的初始数据
    const tid = setTimeout(() => {
      ;(async () => {
        
        // 是否需要弹出设置窗口
        if (settingActions.needEditSetting()) {
          const res = await NiceModal.show('welcome')
          if (res) {
            if (res === 'custom') {
              await NiceModal.show('provider-selector')
            }
            navigate({
              to: '/settings',
            })
          }

          return
        }
        // 是否需要弹出关于窗口（更新后首次启动）
        // 目前仅在桌面版本更新后首次启动、且网络环境为"外网"的情况下才自动弹窗
        const shouldShowAboutDialogWhenStartUp = await platform.shouldShowAboutDialogWhenStartUp()
        if (shouldShowAboutDialogWhenStartUp) {
          setOpenAboutDialog(true)
          return
        }
      })()
    }, 2000)

    return () => clearTimeout(tid)
  }, [])

  const [showSidebar] = useAtom(atoms.showSidebarAtom)
  const sidebarWidth = useSidebarWidth()
  return (
    <Box className="box-border App" spellCheck={spellCheck} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {platform.type === 'desktop' && (getOS() === 'Windows' || getOS() === 'Linux') && <ExitFullscreenButton />}
      <Grid container className="h-full">
        <Sidebar />
        <Box
          className="h-full w-full"
          sx={{
            flexGrow: 1,
            ...(showSidebar
              ? language === 'ar'
                ? { paddingRight: { sm: `${sidebarWidth}px` } }
                : { paddingLeft: { sm: `${sidebarWidth}px` } }
              : {}),
          }}
        >
          <Outlet />
        </Box>
      </Grid>

      {/* 对话设置 */}
      {/* <AppStoreRatingDialog /> */}
      {/* 代码预览 */}
      {/* <ArtifactDialog /> */}
      {/* 对话列表清理 */}
      {/* <ChatConfigWindow /> */}
      {/* 似乎未使用 */}
      <CleanWidnow />
      {/* 对话列表清理 */}
      {/* <ClearConversationListWindow /> */}
      {/* 导出聊天记录 */}
      {/* <ExportChatDialog /> */}
      {/* 编辑消息 */}
      {/* <MessageEditDialog /> */}
      {/* 添加链接 */}
      {/* <OpenAttachLinkDialog /> */}
      {/* 图片预览 */}
      <PictureDialog />
      {/* 似乎是从后端拉一个弹窗的配置 */}
      <RemoteDialogWindow />
      {/* 手机端举报内容 */}
      {/* <ReportContentDialog /> */}
      {/* 搜索 */}
      <SearchDialog />
      {/* 没有配置模型时的欢迎弹窗 */}
      {/* <WelcomeDialog /> */}
      <Toasts />
    </Box>
  )
}

export const Route = createRootRoute({
  component: () => {
    useI18nEffect()
    useSystemLanguageWhenInit()
    useShortcut()
    useScreenChange()
    const theme = useAppTheme()
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NiceModal.Provider>
          <Root />
        </NiceModal.Provider>
      </ThemeProvider>
    )
  },
})
