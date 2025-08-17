import React from 'react'
import { Grid, List } from 'lucide-react'

export type ViewType = 'list' | 'table'

interface ViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  className?: string
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ 
  currentView, 
  onViewChange, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center bg-steam-blue rounded-lg border border-steam-lightblue overflow-hidden ${className}`}>
      <button
        onClick={() => onViewChange('list')}
        className={`
          flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors
          ${currentView === 'list' 
            ? 'bg-steam-green text-white' 
            : 'text-gray-300 hover:text-white hover:bg-steam-lightblue/30'
          }
        `}
        title="List View"
      >
        <List size={16} />
        <span className="hidden sm:inline">List</span>
      </button>
      
      <button
        onClick={() => onViewChange('table')}
        className={`
          flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors border-l border-steam-lightblue
          ${currentView === 'table' 
            ? 'bg-steam-green text-white' 
            : 'text-gray-300 hover:text-white hover:bg-steam-lightblue/30'
          }
        `}
        title="Table View"
      >
        <Grid size={16} />
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  )
}

export default ViewSwitcher
