import { USE_LOCAL_API } from '@/variables'
import { ofetch } from 'ofetch'
import { afetch, uploadFile } from './request'
import * as cache from './cache'
import { uniq } from 'lodash'
import platform from '@/platform'

// ========== API ORIGIN 根据可用性维护 ==========
export let API_ORIGIN = 'http://localhost:8080'


/**
 * 按顺序测试 API 的可用性，只要有一个 API 域名可用，就终止测试并切换所有流量到该域名。
 * 在测试过程中，会根据服务器返回添加新的 API 域名，并缓存到本地
 */
async function testApiOrigins() {
  // 从缓存中获取已知的 API 域名列表
  let pool = await cache.store.getItem<string[] | null>('api_origins').catch(() => null)
  if (!pool) {
    pool = []
  }
  // 按顺序测试 API 的可用性
  let i = 0
  while (i < pool.length) {
    try {
      const origin: string = pool[i]
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 2000) // 2秒超时
      const res = await ofetch<{ data: { api_origins: string[] } }>(`${origin}/api/api_origins`, {
        signal: controller.signal,
        retry: 1,
      })
      // 如果服务器返回了新的 API 域名，则更新缓存
      if (res.data.api_origins.length > 0) {
        pool = uniq([...pool, ...res.data.api_origins])
      }
      // 如果当前 API 可用，则切换所有流量到该域名
      API_ORIGIN = origin
      pool = uniq([origin, ...pool]) // 将当前 API 域名添加到列表顶部
      await cache.store.setItem('api_origins', pool)
      return
    } catch (e) {
      i++
    }
  }
}

// 默认情况下，应用启动时立即测试并设置可用 API 域名，并且每小时测试一次并更新缓存
// 如果使用本地 API，则不进行测试
if (USE_LOCAL_API) {
  console.log('==================')
  console.log('Using local API')
  console.log('==================')
  API_ORIGIN = 'http://localhost:8002'
} else {
  console.log(`placeholder for prod testApiOrigins()`)
}


export interface DialogConfig {
  markdown: string
  buttons: { label: string; url: string }[]
}

export async function getDialogConfig(params: { uuid: string; language: string; version: string }) {
  type Response = {
    data: null | DialogConfig
  }
  const res = await ofetch<Response>(`${API_ORIGIN}/api/dialog_config`, {
    method: 'POST',
    retry: 3,
    body: params,
  })
  return res['data'] || null
}

export async function generateUploadUrl(params: { licenseKey: string; filename: string }) {
  type Response = {
    data: {
      url: string
      filename: string
    }
  }
  const res = await afetch(
    `${API_ORIGIN}/api/files/generate-upload-url`,
    {
      method: 'POST',
      headers: {
        Authorization: params.licenseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
    { parseChatboxRemoteError: true }
  )
  const json: Response = await res.json()
  return json['data']
}

export async function createUserFile<T extends boolean>(params: {
  licenseKey: string
  filename: string
  filetype: string
  returnContent: T
}) {
  type Response = {
    data: {
      uuid: string
      content: T extends true ? string : undefined
    }
  }
  const res = await afetch(
    `${API_ORIGIN}/api/files/create`,
    {
      method: 'POST',
      headers: {
        Authorization: params.licenseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
    { parseChatboxRemoteError: true }
  )
  const json: Response = await res.json()
  return json['data']
}

export async function uploadAndCreateUserFile(licenseKey: string, file: File) {
  const { url, filename } = await generateUploadUrl({
    licenseKey,
    filename: file.name,
  })
  await uploadFile(file, url)
  const result = await createUserFile({
    licenseKey,
    filename,
    filetype: file.type,
    returnContent: true,
  })
  const storageKey = `parseFile-${file.name}_${result.uuid}.${file.type.split('/')[1]}.txt`

  await platform.setStoreBlob(storageKey, result.content)
  return storageKey
}

export async function parseUserLinkPro(params: { licenseKey: string; url: string }) {
  type Response = {
    data: {
      uuid: string
      title: string
      content: string
    }
  }
  const res = await afetch(
    `${API_ORIGIN}/api/links/parse`,
    {
      method: 'POST',
      headers: {
        Authorization: params.licenseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        returnContent: true,
      }),
    },
    {
      parseChatboxRemoteError: true,
      retry: 2,
    }
  )
  const json: Response = await res.json()
  const storageKey = `parseUrl-${params.url}_${json['data']['uuid']}.txt`
  if (json['data']['content']) {
    await platform.setStoreBlob(storageKey, json['data']['content'])
  }
  return {
    key: json['data']['uuid'],
    title: json['data']['title'],
    storageKey,
  }
}

export async function parseUserLinkFree(params: { url: string }) {
  type Response = {
    title: string
    text: string
  }
  const res = await afetch(`https://cors-proxy.chatboxai.app/api/fetch-webpage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CHATBOX-PLATFORM': platform.type,
      'CHATBOX-VERSION': (await platform.getVersion()) || 'unknown',
    },
    body: JSON.stringify(params),
  })
  const json: Response = await res.json()
  return json
}

export async function webBrowsing(params: { licenseKey: string; query: string }) {
  type Response = {
    data: {
      uuid?: string
      query: string
      links: {
        title: string
        url: string
        content: string
      }[]
    }
  }
  const res = await afetch(
    `${API_ORIGIN}/api/tool/web-search`,
    {
      method: 'POST',
      headers: {
        Authorization: params.licenseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
    {
      parseChatboxRemoteError: true,
      retry: 2,
    }
  )
  const json: Response = await res.json()
  return json['data']
}
