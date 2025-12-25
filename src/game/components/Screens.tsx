/**
 * Screens.tsx - Game Screens (Start, Pause, Win, Lose)
 * Full-screen overlays for different game states
 */

import { useState, useEffect } from 'react'
import { useGameStore, useDifficulty, useTimeRemaining, useFoundCount, useCurrentLevel } from '../state'
import { Difficulty } from '../types'
import { playButtonClick, playVictory, playGameOver } from './Sfx'

/**
 * Start/Menu Screen
 */
export function StartScreen() {
  const [showInstructions, setShowInstructions] = useState(false)
  const difficulty = useDifficulty()
  const setDifficulty = useGameStore((s) => s.setDifficulty)
  const startGame = useGameStore((s) => s.startGame)
  
  const handleDifficultySelect = (diff: Difficulty) => {
    playButtonClick()
    setDifficulty(diff)
  }
  
  const handlePlay = () => {
    playButtonClick()
    startGame()
  }
  
  return (
    <div className="start-screen">
      <h1>67</h1>
      <div className="subtitle">Escape Room</div>
      
      <div className="difficulty-select">
        <button
          className={`difficulty-btn easy ${difficulty === 'easy' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('easy')}
        >
          😊 Easy
        </button>
        <button
          className={`difficulty-btn normal ${difficulty === 'normal' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('normal')}
        >
          😐 Normal
        </button>
        <button
          className={`difficulty-btn hard ${difficulty === 'hard' ? 'selected' : ''}`}
          onClick={() => handleDifficultySelect('hard')}
        >
          😈 Hard
        </button>
      </div>
      
      <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        {difficulty === 'easy' && '90 seconds • 3s hold time • More obvious targets'}
        {difficulty === 'normal' && '60 seconds • 5s hold time • Standard challenge'}
        {difficulty === 'hard' && '45 seconds • 5s hold time • Hidden targets'}
      </div>
      
      <button className="play-btn" onClick={handlePlay}>
        ▶ PLAY
      </button>
      
      <div
        className="how-to-play"
        onClick={() => {
          playButtonClick()
          setShowInstructions(true)
        }}
      >
        ❓ How to Play
      </div>
      
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  )
}

/**
 * Instructions Modal
 */
function InstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 199,
        }}
        onClick={onClose}
      />
      <div className="instructions-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>🎯 How to Play</h2>
        <ul>
          <li><strong>Goal:</strong> Find 5 hidden "67" references before time runs out!</li>
          <li><strong>Move:</strong> WASD keys to walk, Mouse to look around</li>
          <li><strong>Target:</strong> Aim at a "67" and <strong>hold mouse button</strong> for 5 seconds to confirm</li>
          <li><strong>Chest:</strong> Press E near the chest to get powerups</li>
          <li><strong>Tools:</strong> Press 1-4 to use tools in your inventory</li>
          <li><strong>Pause:</strong> Press ESC to pause the game</li>
        </ul>
        <h3 style={{ marginTop: '1rem', color: '#4ECDC4' }}>🔧 Tools</h3>
        <ul>
          <li>💡 <strong>Hint:</strong> Shows the nearest unfound target</li>
          <li>❄️ <strong>Time Freeze:</strong> Pauses timer for 5 seconds</li>
          <li>⏰ <strong>Time Add:</strong> Adds 10 seconds</li>
          <li>🔍 <strong>Reveal:</strong> Shows direction of remaining targets</li>
        </ul>
      </div>
    </>
  )
}

/**
 * Pause Menu
 */
export function PauseMenu() {
  const resumeGame = useGameStore((s) => s.resumeGame)
  const restartLevel = useGameStore((s) => s.restartLevel)
  const goToMenu = useGameStore((s) => s.goToMenu)
  
  return (
    <div className="pause-menu">
      <h2>⏸️ PAUSED</h2>
      <button
        className="resume-btn"
        onClick={() => {
          playButtonClick()
          resumeGame()
        }}
      >
        ▶ Resume
      </button>
      <button
        className="restart-btn"
        onClick={() => {
          playButtonClick()
          restartLevel()
        }}
      >
        🔄 Restart
      </button>
      <button
        className="exit-btn"
        onClick={() => {
          playButtonClick()
          goToMenu()
        }}
      >
        🚪 Exit
      </button>
    </div>
  )
}

/**
 * Win Screen
 */
export function WinScreen() {
  const timeRemaining = useTimeRemaining()
  const foundCount = useFoundCount()
  const currentLevel = useCurrentLevel()
  const nextLevel = useGameStore((s) => s.nextLevel)
  const goToMenu = useGameStore((s) => s.goToMenu)
  
  // Play victory sound on mount
  useEffect(() => {
    playVictory()
  }, [])
  
  return (
    <div className="end-screen win">
      <h1>🎉 VICTORY! 🎉</h1>
      <div className="stats">
        <div>Room: {currentLevel.name}</div>
        <div>Time Remaining: {Math.floor(timeRemaining)}s</div>
        <div>Targets Found: {foundCount}/5</div>
      </div>
      <button
        className="next-btn"
        onClick={() => {
          playButtonClick()
          nextLevel()
        }}
      >
        Next Room →
      </button>
      <button
        className="menu-btn"
        onClick={() => {
          playButtonClick()
          goToMenu()
        }}
      >
        Main Menu
      </button>
    </div>
  )
}

/**
 * Lose Screen
 */
/**
 * Ending Transition Overlay
 * Shows when time runs out before the lose screen
 */
export function EndingTransition() {
  const [shake, setShake] = useState(true)
  
  // Play explosion sound and trigger shake
  useEffect(() => {
    playGameOver()
    
    // Stop shake after animation
    const timer = setTimeout(() => setShake(false), 500)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,71,87,0.3) 0%, rgba(0,0,0,0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: shake ? 'shake 0.5s ease' : undefined,
      }}
    >
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
          @keyframes explode {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div
        style={{
          fontSize: '8rem',
          animation: 'explode 0.5s ease-out',
        }}
      >
        💥
      </div>
    </div>
  )
}

export function LoseScreen() {
  const foundCount = useFoundCount()
  const currentLevel = useCurrentLevel()
  const restartLevel = useGameStore((s) => s.restartLevel)
  const goToMenu = useGameStore((s) => s.goToMenu)
  
  return (
    <div className="end-screen lose">
      <h1>💥 TIME'S UP! 💥</h1>
      <div className="stats">
        <div>Room: {currentLevel.name}</div>
        <div>Targets Found: {foundCount}/5</div>
        <div style={{ color: '#ff4757', marginTop: '1rem' }}>
          So close! Try again?
        </div>
      </div>
      <button
        className="retry-btn"
        onClick={() => {
          playButtonClick()
          restartLevel()
        }}
      >
        🔄 Retry
      </button>
      <button
        className="menu-btn"
        onClick={() => {
          playButtonClick()
          goToMenu()
        }}
      >
        Main Menu
      </button>
    </div>
  )
}

