/**
 * App.tsx - Root application component
 * Sets up the game canvas and providers
 */

import { useState, useEffect } from 'react'
import { GameRoot } from './game/GameRoot'
import { NetProvider } from './game/net/NetProvider'
import { SharedScoreModal } from './components/SharedScoreModal'
import { getShareDataFromUrl, ShareData } from './lib/share'

function App() {
  const [shareData, setShareData] = useState<ShareData | null>(null)
  
  // Check for share parameter on mount
  useEffect(() => {
    const data = getShareDataFromUrl()
    if (data) {
      setShareData(data)
    }
  }, [])
  
  const handleCloseShareModal = () => {
    setShareData(null)
  }
  
  return (
    <NetProvider>
      <GameRoot />
      {shareData && (
        <SharedScoreModal 
          shareData={shareData} 
          onClose={handleCloseShareModal} 
        />
      )}
    </NetProvider>
  )
}

export default App


