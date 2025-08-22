'use client'

import SharedLayout from '../components/SharedLayout'
import ConsolePage from '../../src/pages/ConsolePage'
import { Console as ConsoleEntry } from '../../src/types'

export default function ConsoleRoute() {
  // Mock data for demonstration
  const mockConsoleEntries: ConsoleEntry[] = [
    {
      id: '1',
      timestamp: new Date(),
      level: 'info',
      message: 'Steam Bot Multichat started successfully',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000),
      level: 'success',
      message: 'Account [user123] logged in successfully',
      account: 'user123'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000),
      level: 'warning',
      message: 'Proxy connection unstable for account [user456]',
      account: 'user456'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 180000),
      level: 'error',
      message: 'Failed to send message to friend [friend789]',
    }
  ]

  return (
    <SharedLayout>
      <ConsolePage entries={mockConsoleEntries} />
    </SharedLayout>
  )
}
