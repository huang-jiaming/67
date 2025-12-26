/**
 * HUD.tsx - Heads-Up Display
 * In-game overlay showing timer, found count, inventory, and prompts
 */

import { useEffect, useRef } from 'react'
import {
  useGameStore,
  useTimeRemaining,
  useTimerFrozen,
  useFoundCount,
  useInventory,
  useToasts,
  useRevealQuadrant,
  useCurrentLevel,
  useIsMobile,
} from '../state'
import { HoldProgressUI } from './HoldProgressUI'
import { ChestUI } from './Chest'
import { playToolUse, playTimerWarning, playTimeFreeze, playTimeAdd, playButtonClick } from './Sfx'

/**
 * Main HUD component
 */
export function HUD() {
  const timeRemaining = useTimeRemaining()
  const timerFrozen = useTimerFrozen()
  const foundCount = useFoundCount()
  const requiredCount = useGameStore((s) => s.requiredCount)
  const inventory = useInventory()
  const toasts = useToasts()
  const revealQuadrant = useRevealQuadrant()
  const currentLevel = useCurrentLevel()
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex)
  const chestOpen = useGameStore((s) => s.chestOpen)
  const nearChest = useGameStore((s) => s.nearChest)
  const hoveredTarget = useGameStore((s) => s.hoveredTarget)
  const holdProgress = useGameStore((s) => s.holdProgress)
  const useTool = useGameStore((s) => s.useTool)
  const isMobile = useIsMobile()
  const pauseGame = useGameStore((s) => s.pauseGame)
  const openChest = useGameStore((s) => s.openChest)
  
  // Play warning sound when time is low
  const lastWarningRef = useRef(0)
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0 && !timerFrozen) {
      const second = Math.floor(timeRemaining)
      if (second !== lastWarningRef.current) {
        lastWarningRef.current = second
        playTimerWarning()
      }
    }
  }, [timeRemaining, timerFrozen])
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Handle tool usage via keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chestOpen) return
      
      // Number keys 1-4 for tools
      const keyNum = parseInt(e.key)
      if (keyNum >= 1 && keyNum <= 4) {
        const tool = inventory[keyNum - 1]
        if (tool) {
          // Play appropriate sound
          switch (tool.type) {
            case 'time_freeze':
              playTimeFreeze()
              break
            case 'time_add':
              playTimeAdd()
              break
            default:
              playToolUse()
          }
          useTool(tool.id)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inventory, useTool, chestOpen])
  
  // Determine timer state
  const timerClass = timerFrozen
    ? 'timer frozen'
    : timeRemaining <= 10
    ? 'timer danger'
    : 'timer'
  
  return (
    <div className="hud">
      {/* Level indicator */}
      <div className="level-indicator">
        📍 Room {currentLevelIndex + 1}: {currentLevel.name}
      </div>
      
      {/* Timer */}
      <div className={timerClass}>
        {timerFrozen ? '❄️ ' : '⏱️ '}
        {formatTime(timeRemaining)}
      </div>
      
      {/* Found counter */}
      <div className="found-counter">
        🎯 <span className="found">{foundCount}</span> / {requiredCount}
      </div>
      
      {/* Crosshair */}
      <div className={`crosshair ${hoveredTarget ? 'active' : ''}`} />
      
      {/* Hold progress */}
      <HoldProgressUI
        progress={holdProgress}
        isActive={!!hoveredTarget && holdProgress > 0}
      />
      
      {/* Tools inventory */}
      <div className="tools-inventory">
        {[0, 1, 2, 3].map((slot) => {
          const tool = inventory[slot]
          return (
            <div
              key={slot}
              className={`tool-slot ${tool ? '' : 'empty'}`}
              onClick={() => {
                if (tool) {
                  playToolUse()
                  useTool(tool.id)
                }
              }}
              title={tool ? `${tool.name}: ${tool.description}` : 'Empty slot'}
            >
              {tool ? tool.icon : ''}
              <span className="key-hint">{slot + 1}</span>
            </div>
          )
        })}
      </div>
      
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
      
      {/* Reveal quadrant hint */}
      {revealQuadrant && (
        <div className="quadrant-hint">
          🔍 Look {revealQuadrant.toUpperCase()}!
        </div>
      )}
      
      {/* Time frozen overlay */}
      {timerFrozen && (
        <div className="time-frozen-overlay">
          ❄️ TIME FROZEN ❄️
        </div>
      )}
      
      {/* Chest interaction prompt - different for mobile vs desktop */}
      {nearChest && !chestOpen && (
        isMobile ? (
          <button
            className="mobile-action-btn chest-btn"
            onClick={(e) => {
              e.stopPropagation()
              playButtonClick()
              openChest()
            }}
            onTouchStart={(e) => e.stopPropagation()}
          >
            📦 Open Chest
          </button>
        ) : (
          <div className="interact-prompt">
            Press <kbd>E</kbd> to open chest
          </div>
        )
      )}
      
      {/* Mobile pause button */}
      {isMobile && !chestOpen && (
        <button
          className="mobile-pause-btn"
          onClick={(e) => {
            e.stopPropagation()
            playButtonClick()
            pauseGame()
          }}
          onTouchStart={(e) => e.stopPropagation()}
        >
          ⏸️
        </button>
      )}
      
      {/* Chest backdrop and UI */}
      {chestOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 75,
              cursor: 'default',
              pointerEvents: 'auto',
            }}
            onClick={() => useGameStore.getState().closeChest()}
          />
          <ChestUI />
        </>
      )}
    </div>
  )
}

