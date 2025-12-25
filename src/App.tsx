/**
 * App.tsx - Root application component
 * Sets up the game canvas and providers
 */

import { GameRoot } from './game/GameRoot'
import { NetProvider } from './game/net/NetProvider'

function App() {
  return (
    <NetProvider>
      <GameRoot />
    </NetProvider>
  )
}

export default App

