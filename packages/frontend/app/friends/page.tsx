'use client'

import SharedLayout from '../components/SharedLayout'
import FriendsPage from '../../src/pages/FriendsPage'
import { Friend } from '../../src/types'

export default function FriendsRoute() {
  // Mock data for demonstration
  const mockFriends: Friend[] = [
    {
      id: '1',
      steamId: '76561198000000001',
      name: 'John Doe',
      status: 'online',
      lastMessage: 'Hey, how are you?',
      lastSeen: new Date()
    },
    {
      id: '2',
      steamId: '76561198000000002',
      name: 'Jane Smith',
      status: 'away',
      lastMessage: 'Thanks for the game!',
      lastSeen: new Date(Date.now() - 1800000)
    }
  ]

  return (
    <SharedLayout>
      <FriendsPage friends={mockFriends} />
    </SharedLayout>
  )
}
