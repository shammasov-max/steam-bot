'use client'

import SharedLayout from '../components/SharedLayout'
import AccountsPage from '../../src/pages/AccountsPage'
import { Account } from '../../src/types'

export default function AccountsRoute() {
    // Mock data for demonstration
    const mockAccounts: Account[] = [
        {
            id: '1',
            username: 'steamuser123',
            status: 'online',
            isLoggedIn: true,
            lastActivity: new Date(),
        },
        {
            id: '2',
            username: 'botaccount456',
            status: 'idle',
            isLoggedIn: true,
            lastActivity: new Date(Date.now() - 300000),
        },
        {
            id: '3',
            username: 'testuser789',
            status: 'offline',
            isLoggedIn: false,
        },
    ]

    return (
        <SharedLayout>
            <AccountsPage accounts={mockAccounts} />
        </SharedLayout>
    )
}
