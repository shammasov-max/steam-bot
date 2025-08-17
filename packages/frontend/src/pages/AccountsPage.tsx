import React, { useState } from 'react'
import { Account } from '../types'
import SearchBox from '../components/UI/SearchBox'
import ViewSwitcher, { ViewType } from '../components/UI/ViewSwitcher'
import AccountsTable from '../components/Tables/AccountsTable'
import { Users, UserPlus, Upload, Download, Trash2, Play, Square, RefreshCw, Filter } from 'lucide-react'

interface AccountsPageProps {
  accounts: Account[]
}

const AccountsPage: React.FC<AccountsPageProps> = ({ accounts }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'idle' | 'busy'>('all')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('list')

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'idle': return 'text-yellow-400'
      case 'busy': return 'text-red-400'
      case 'offline': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusDot = (status: Account['status']) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'idle': return 'bg-yellow-400'
      case 'busy': return 'bg-red-400'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const selectAll = () => {
    setSelectedAccounts(filteredAccounts.map(acc => acc.id))
  }

  const selectNone = () => {
    setSelectedAccounts([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Import Accounts</h1>
        <div className="text-sm text-gray-300">
          {filteredAccounts.length} of {accounts.length} accounts
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search accounts by username..."
            className="flex-1 max-w-md"
          />

          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="idle">Idle</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="btn-primary flex items-center space-x-2">
            <UserPlus size={16} />
            <span>Add Account</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-300">
            {selectedAccounts.length} selected
          </span>
          <button onClick={selectAll} className="text-steam-green hover:text-steam-green/80">
            Select All
          </button>
          <span className="text-gray-500">|</span>
          <button onClick={selectNone} className="text-steam-green hover:text-steam-green/80">
            Select None
          </button>
        </div>
      </div>

      {selectedAccounts.length > 0 && (
        <div className="p-4 bg-steam-lightblue/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Bulk Actions:</span>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                <Play size={14} />
                <span>Start</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm">
                <Square size={14} />
                <span>Stop</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                <RefreshCw size={14} />
                <span>Restart</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'list' ? (
        <div className="grid gap-4">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedAccounts.includes(account.id)
                  ? 'border-steam-green bg-steam-green/10'
                  : 'border-steam-lightblue hover:border-steam-green/50 bg-steam-lightblue/20'
                }
              `}
              onClick={() => toggleAccount(account.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className="w-4 h-4 text-steam-green bg-steam-blue border-steam-lightblue rounded focus:ring-steam-green"
                  />

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-steam-lightblue rounded-full flex items-center justify-center">
                      <Users size={20} className="text-gray-300" />
                    </div>

                    <div>
                      <div className="font-medium text-white">{account.username}</div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(account.status)}`}></div>
                        <span className={getStatusColor(account.status)}>
                          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                        </span>
                        {account.isLoggedIn && (
                          <span className="text-green-400">• Logged In</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {account.lastActivity && (
                    <span className="text-xs text-gray-400">
                      Last: {account.lastActivity.toLocaleTimeString()}
                    </span>
                  )}
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-green-400">
                      <Play size={14} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-yellow-400">
                      <Square size={14} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AccountsTable
          accounts={filteredAccounts}
          selectedAccounts={selectedAccounts}
          onSelectionChange={setSelectedAccounts}
        />
      )}

      {filteredAccounts.length === 0 && searchTerm && (
        <div className="text-center py-12 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No accounts found</p>
          <p className="text-sm">Try adjusting your search terms or filters</p>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No accounts configured</p>
          <p className="text-sm">Add or import Steam accounts to get started</p>
        </div>
      )}
    </div>
  )
}

export default AccountsPage
