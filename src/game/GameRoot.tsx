/**
 * GameRoot.tsx - Main Game Component
 * Orchestrates the game loop, screens, and 3D canvas
 * Acts as the root state machine for game phases
 */

import { useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore, useGamePhase, useCurrentLevel, useIsMobile } from './state'
import { StartScreen, PauseMenu, WinScreen, LoseScreen, EndingTransition } from './components/Screens'
import { HUD } from './components/HUD'
import { GameScene } from './components/GameScene'
import { MobileControls } from './components/MobileControls'

/**
 * Main game root component
 * Handles phase-based rendering and global keyboard events
 */
export function GameRoot() {
  const phase = useGamePhase()
  const currentLevel = useCurrentLevel()
  const pauseGame = useGameStore((s) => s.pauseGame)
  const resumeGame = useGameStore((s) => s.resumeGame)
  const isPointerLocked = useGameStore((s) => s.isPointerLocked)
  const chestOpen = useGameStore((s) => s.chestOpen)
  const closeChest = useGameStore((s) => s.closeChest)
  const isMobile = useIsMobile()
  const mobileGameStarted = useGameStore((s) => s.mobileGameStarted)
  
  // Handle escape key for pause
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (chestOpen) {
        closeChest()
        return
      }
      if (phase === 'playing') {
        pauseGame()
        // Exit pointer lock
        document.exitPointerLock?.()
      } else if (phase === 'paused') {
        resumeGame()
      }
    }
  }, [phase, pauseGame, resumeGame, chestOpen, closeChest])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  // Render appropriate screen based on phase
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Start Screen */}
      {phase === 'menu' && <StartScreen />}
      
      {/* Game Canvas - always rendered when not in menu */}
      {phase !== 'menu' && (
        <>
          <Canvas
            className="game-canvas"
            shadows
            camera={{ 
              fov: 70, 
              near: 0.1, 
              far: 100,
              position: [0, 1.6, 4],
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #87CEEB 0%, #a8c0d0 100%)',
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
            }}
            onCreated={({ gl }) => {
              gl.setClearColor('#a8c0d0')
            }}
          >
            <Suspense fallback={null}>
              <GameScene level={currentLevel} />
            </Suspense>
          </Canvas>
          
          {/* HUD Overlay */}
          {(phase === 'playing' || phase === 'paused') && <HUD />}
          
          {/* Mobile Controls */}
          {phase === 'playing' && <MobileControls />}
          
          {/* Pause Menu */}
          {phase === 'paused' && <PauseMenu />}
          
          {/* Ending Transition */}
          {phase === 'ending' && <EndingTransition />}
          
          {/* Win Screen */}
          {phase === 'won' && <WinScreen />}
          
          {/* Lose Screen */}
          {phase === 'lost' && <LoseScreen />}
        </>
      )}
      
      {/* Click/Tap to play prompt - only show when not in a modal */}
      {phase === 'playing' && !chestOpen && (
        // Desktop: show when not pointer locked
        // Mobile: show when game hasn't started
        (isMobile ? !mobileGameStarted : !isPointerLocked) && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.85)',
              color: 'white',
              padding: '2rem 3rem',
              borderRadius: 16,
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              textAlign: 'center',
              zIndex: 100,
              border: '4px solid #4ECDC4',
              cursor: 'pointer',
              maxWidth: isMobile ? '85%' : 'auto',
            }}
            onClick={() => {
              // On mobile, tapping the overlay starts the game
              if (isMobile) {
                useGameStore.getState().setMobileGameStarted(true)
              }
              // On desktop, clicking will trigger pointer lock via canvas
            }}
            onTouchStart={(e) => {
              // Prevent default to avoid double-tap zoom
              e.preventDefault()
              useGameStore.getState().setMobileGameStarted(true)
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              🎯 {isMobile ? 'Tap to Start Playing' : 'Click to Start Playing'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {isMobile 
                ? 'Use joystick to move, drag screen to look' 
                : 'Timer starts when you click'}
            </div>
          </div>
        )
      )}
    </div>
  )
}

