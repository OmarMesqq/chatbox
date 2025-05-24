import { cachified } from '@epic-web/cachified'
import { truncate } from 'lodash'
import { SearchResultItem } from 'src/shared/types'
import { getExtensionSettings } from '@/stores/settingActions'
import WebSearch from './base'
import { DuckDuckGoSearch } from './duckduckgo'

const MAX_CONTEXT_ITEMS = 10

// 根据配置的搜索提供方来选择搜索服务
function getSearchProviders() {
  const settings = getExtensionSettings()

  const selectedProviders: WebSearch[] = []
  const provider = settings.webSearch.provider

  switch (provider) {
    case 'duckduckgo':
      selectedProviders.push(new DuckDuckGoSearch())
      break
    default:
      console.error(`getSearchProviders.unsupportedSearchProvider: ${provider}`)
  }

  return selectedProviders
}

async function _searchRelatedResults(query: string, signal?: AbortSignal) {
  const providers = getSearchProviders()
  const results = await Promise.all(
    providers.map(async (provider) => {
      try {
        const result = await provider.search(query, signal)
        console.debug(`web search result for "${query}":`, result.items)
        return result
      } catch (err) {
        console.error(err)
        return { items: [] }
      }
    })
  )

  const items: SearchResultItem[] = []

  // add items in turn
  let i = 0
  let hasMore = false
  do {
    hasMore = false
    for (const result of results) {
      const item = result.items[i]
      if (item) {
        hasMore = true
        items.push(item)
      } else {
        continue
      }
    }
    i++
  } while (hasMore && items.length < MAX_CONTEXT_ITEMS)

  console.debug('web search items', items)

  return items.map((item) => ({
    title: item.title,
    snippet: truncate(item.snippet, { length: 150 }),
    link: item.link,
  }))
}

const cache = new Map()

export const webSearchExecutor = async (
  { query }: { query: string },
  { abortSignal }: { abortSignal?: AbortSignal }
) => {
  const searchResults = await cachified({
    cache,
    key: `search-context:${query}`,
    ttl: 1000 * 60 * 5,
    getFreshValue: () => _searchRelatedResults(query, abortSignal),
  })
  return { query, searchResults }
}

export type { SearchResultItem }
