import React, { useState, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent, FilterChangedEvent, SortChangedEvent } from 'ag-grid-community'
import { ProxyServer } from '../types'
import SearchBox from '../components/UI/SearchBox'
import { Wifi, WifiOff, Plus, Upload, Download, Trash2, RefreshCw } from 'lucide-react'
import 'ag-grid-community/styles/ag-grid.css'
import '../styles/ag-grid-steam-theme.css'

// Custom cell renderers
const StatusRenderer = (params: any) => {
  const { status } = params.data
  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <Wifi size={14} />
      case 'disconnected': return <WifiOff size={14} />
      case 'error': return <WifiOff size={14} />
      default: return <WifiOff size={14} />
    }
  }

  return (
    <div className={`status-badge ${status}`}>
      <div className={`status-dot ${status}`}></div>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

const AccountsRenderer = (params: any) => {
  const { accounts } = params.data
  if (!accounts || accounts.length === 0) {
    return <span className="text-gray-400">No accounts</span>
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {accounts.slice(0, 3).map((account: string, index: number) => (
        <span key={index} className="account-tag">
          {account}
        </span>
      ))}
      {accounts.length > 3 && (
        <span className="account-tag">
          +{accounts.length - 3} more
        </span>
      )}
    </div>
  )
}

const ActionsRenderer = (params: any) => {
  const { data } = params
  
  const handleConnect = () => {
    console.log('Connect proxy:', data.id)
  }
  
  const handleTest = () => {
    console.log('Test proxy:', data.id)
  }
  
  const handleDelete = () => {
    console.log('Delete proxy:', data.id)
  }
  
  return (
    <div className="flex space-x-1">
      <button 
        onClick={handleConnect}
        className="steam-action-button success"
        title="Connect"
      >
        <RefreshCw size={12} />
      </button>
      <button 
        onClick={handleTest}
        className="steam-action-button"
        title="Test"
      >
        Test
      </button>
      <button 
        onClick={handleDelete}
        className="steam-action-button danger"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

const ProxyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const [proxies] = useState<ProxyServer[]>([
    {
      id: '1',
      host: '192.168.1.100',
      port: 8080,
      username: 'proxyuser',
      password: '********',
      status: 'connected',
      accounts: ['steamuser123', 'botaccount456']
    },
    {
      id: '2',
      host: '10.0.0.50',
      port: 3128,
      status: 'disconnected',
      accounts: []
    },
    {
      id: '3',
      host: 'proxy.example.com',
      port: 8888,
      username: 'user',
      password: '********',
      status: 'error',
      accounts: ['testuser789']
    },
    {
      id: '4',
      host: '203.142.71.33',
      port: 8080,
      status: 'connected',
      accounts: ['demouser001']
    },
    {
      id: '5',
      host: 'premium-proxy.net',
      port: 1080,
      username: 'premiumuser',
      password: '********',
      status: 'connected',
      accounts: ['account001', 'account002', 'account003']
    },
    {
      id: '6',
      host: '198.51.100.10',
      port: 8080,
      status: 'disconnected',
      accounts: []
    },
    {
      id: '7',
      host: 'secure-proxy.com',
      port: 3128,
      username: 'secureuser',
      password: '********',
      status: 'connected',
      accounts: ['securebot001', 'securebot002']
    },
    {
      id: '8',
      host: '203.0.113.25',
      port: 1080,
      status: 'error',
      accounts: ['errorbot001']
    }
  ])

  // Column definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Host',
      field: 'host',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => {
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono">{params.value}</span>
          </div>
        )
      }
    },
    {
      headerName: 'Port',
      field: 'port',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 80,
      cellRenderer: (params: any) => {
        return <span className="font-mono">{params.value}</span>
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: StatusRenderer,
      filterParams: {
        filterOptions: ['equals'],
        suppressAndOrCondition: true,
      }
    },
    {
      headerName: 'Username',
      field: 'username',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        return params.value ? (
          <span className="text-gray-300">{params.value}</span>
        ) : (
          <span className="text-gray-500 italic">No auth</span>
        )
      }
    },
    {
      headerName: 'Assigned Accounts',
      field: 'accounts',
      sortable: false,
      filter: false,
      flex: 1,
      minWidth: 200,
      cellRenderer: AccountsRenderer
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: ActionsRenderer,
      pinned: 'right'
    }
  ], [])

  // Default column definition
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), [])

  // Filter the data based on search term
  const filteredProxies = useMemo(() => {
    if (!searchTerm) return proxies
    
    return proxies.filter(proxy => 
      proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proxy.port.toString().includes(searchTerm) ||
      (proxy.username && proxy.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      proxy.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proxy.accounts.some(account => account.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [proxies, searchTerm])

  // Grid event handlers
  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit()
  }, [])

  const onFilterChanged = useCallback((params: FilterChangedEvent) => {
    console.log('Filter changed:', params.api.getFilterModel())
  }, [])

  const onSortChanged = useCallback((params: SortChangedEvent) => {
    console.log('Sort changed:', params.api.getSortModel())
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Import Proxy</h1>
        <div className="text-sm text-gray-300">
          {filteredProxies.length} of {proxies.length} proxy servers
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search proxies by host, port, username, status, or accounts..."
          className="flex-1 max-w-md"
        />
        
        <div className="flex items-center space-x-4">
          <button className="btn-primary flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Proxy</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Upload size={16} />
            <span>Import List</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Test All</span>
          </button>
        </div>
      </div>

      <div className="ag-theme-steam" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={filteredProxies}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onSortChanged={onSortChanged}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={false}
          rowMultiSelectWithClick={true}
          suppressMovableColumns={false}
          enableCellTextSelection={true}
          pagination={false}
          headerHeight={40}
          rowHeight={50}
        />
      </div>

      {filteredProxies.length === 0 && searchTerm && (
        <div className="text-center py-12 text-gray-400">
          <Wifi size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No proxies found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      )}

      {proxies.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Wifi size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No proxy servers configured</p>
          <p className="text-sm">Add proxy servers to route your bot traffic</p>
        </div>
      )}

      <div className="text-xs text-gray-400 space-y-1">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Click column headers to sort by that field</li>
          <li>Use the filter icons in column headers for advanced filtering</li>
          <li>Select multiple rows using Ctrl/Cmd + click</li>
          <li>Resize columns by dragging the column borders</li>
        </ul>
      </div>
    </div>
  )
}

export default ProxyPage
