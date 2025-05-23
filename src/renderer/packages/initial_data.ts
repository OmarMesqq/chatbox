import { Session } from '../../shared/types'
import { migrateMessage } from '@/utils/message'

export const defaultSessionsForEN: Session[] = [
  {
    id: 'justchat-b612-406a-985b-3ab4d2c482ff',
    name: 'Just chat',
    type: 'chat',
    messages: [
      {
        id: 'a700be6c-cbdd-43a3-b572-49e7a921c059',
        role: 'system' as const,
        content: 'You are a helpful assistant.',
      },
    ].map(migrateMessage),
    starred: false,
  }
]

