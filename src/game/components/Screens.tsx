/**
 * Screens.tsx - Game Screens (Start, Pause, Win)
 * Full-screen overlays for different game states
 * No more Lose screen since the game has no timer!
 */

import { useState, useEffect } from 'react'
import { useGameStore, useDifficulty, useTimeElapsed, useWrongSelections, useFoundCount, useCurrentLevel, useIsMobile, usePlayerName, useFinalScore } from '../state'
import { Difficulty, PENALTY_SECONDS } from '../types'
import { playButtonClick, playVictory } from './Sfx'
import { shareNative, copyToClipboard, generateShareUrl, ShareData } from '../../lib/share'

/**
 * Name Entry Screen - First screen shown
 */
export function NameEntryScreen() {
  const [name, setName] = useState('')
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const setPhase = useGameStore((s) => s.setPhase)
  
  const handleSubmit = (playerName: string) => {
    playButtonClick()
    setPlayerName(playerName)
    setPhase('menu')
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit(name.trim())
    }
  }
  
  return (
    <div className="start-screen">
      <h1>67</h1>
      <div className="subtitle">Escape Room</div>
      
      <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
          Enter your name:
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your name..."
          maxLength={20}
          autoFocus
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '1.2rem',
            borderRadius: '8px',
            border: '2px solid #4ECDC4',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            width: '250px',
            textAlign: 'center',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>
      
      <button
        className="play-btn"
        onClick={() => handleSubmit(name.trim() || 'Guest')}
        style={{ marginBottom: '0.75rem' }}
      >
        {name.trim() ? '▶ Continue' : '👤 Play as Guest'}
      </button>
      
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
        Your plays will be logged
      </div>
    </div>
  )
}

/**
 * Start/Menu Screen
 */
export function StartScreen() {
  const [showInstructions, setShowInstructions] = useState(false)
  const difficulty = useDifficulty()
  const playerName = usePlayerName()
  const setDifficulty = useGameStore((s) => s.setDifficulty)
  const startGame = useGameStore((s) => s.startGame)
  const setPhase = useGameStore((s) => s.setPhase)
  
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
      
      <div 
        style={{ 
          color: '#4ECDC4', 
          marginTop: '0.5rem', 
          fontSize: '1.1rem',
          cursor: 'pointer',
        }}
        onClick={() => {
          playButtonClick()
          setPhase('name_entry')
        }}
        title="Click to change name"
      >
        Welcome, {playerName || 'Guest'}! ✏️
      </div>
      
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
        {difficulty === 'easy' && '3s hold time • 2 decoys • Easier to spot'}
        {difficulty === 'normal' && '4s hold time • 4 decoys • Balanced challenge'}
        {difficulty === 'hard' && '5s hold time • 6 decoys • Many traps!'}
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
 * Instructions Modal - Shows different instructions for mobile vs desktop
 */
function InstructionsModal({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile()
  
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
          <li><strong>Goal:</strong> Find 5 hidden "67" references as fast as possible!</li>
          <li><strong>Scoring:</strong> Your score = Time + Penalties (lower is better!)</li>
          <li><strong>⚠️ Decoys:</strong> Watch out for fake items (76, 7:06, etc.) - selecting them adds +{PENALTY_SECONDS}s penalty!</li>
          {isMobile ? (
            <>
              <li><strong>Move:</strong> Use the joystick (bottom-left) to walk</li>
              <li><strong>Look:</strong> Drag anywhere on screen to look around</li>
              <li><strong>Target:</strong> Look at a "67" and <strong>hold touch</strong> to confirm</li>
              <li><strong>Chest:</strong> Tap the button when near the chest</li>
              <li><strong>Tools:</strong> Tap tools at bottom to use them</li>
              <li><strong>Pause:</strong> Tap ⏸️ button (top-right)</li>
            </>
          ) : (
            <>
              <li><strong>Move:</strong> WASD keys to walk, Mouse to look around</li>
              <li><strong>Target:</strong> Aim at a "67" and <strong>hold mouse button</strong> to confirm</li>
              <li><strong>Chest:</strong> Press E near the chest to get powerups</li>
              <li><strong>Tools:</strong> Press 1-4 to use tools in your inventory</li>
              <li><strong>Pause:</strong> Press ESC to pause the game</li>
            </>
          )}
        </ul>
        <h3 style={{ marginTop: '1rem', color: '#4ECDC4' }}>🔧 Tools</h3>
        <ul>
          <li>💡 <strong>Hint:</strong> Shows the nearest unfound target (not decoys!)</li>
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
 * Win Screen - Shows score breakdown
 */
export function WinScreen() {
  const timeElapsed = useTimeElapsed()
  const wrongSelections = useWrongSelections()
  const finalScore = useFinalScore()
  const foundCount = useFoundCount()
  const currentLevel = useCurrentLevel()
  const playerName = usePlayerName()
  const difficulty = useDifficulty()
  const nextLevel = useGameStore((s) => s.nextLevel)
  const goToMenu = useGameStore((s) => s.goToMenu)
  const addToast = useGameStore((s) => s.addToast)
  
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  
  // Play victory sound on mount
  useEffect(() => {
    playVictory()
  }, [])
  
  // Format time nicely
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
    }
    return `${secs}.${ms}s`
  }
  
  // Get score rating
  const getScoreRating = (score: number): { emoji: string; text: string; color: string } => {
    if (score < 30) return { emoji: '🏆', text: 'LEGENDARY!', color: '#FFD700' }
    if (score < 45) return { emoji: '🌟', text: 'AMAZING!', color: '#FF6B35' }
    if (score < 60) return { emoji: '⭐', text: 'Great!', color: '#4ECDC4' }
    if (score < 90) return { emoji: '👍', text: 'Good job!', color: '#7bed9f' }
    return { emoji: '✓', text: 'Completed', color: '#a8a8a8' }
  }
  
  const rating = getScoreRating(finalScore)
  const penaltyTime = wrongSelections * PENALTY_SECONDS
  
  // Handle share score
  const handleShare = async () => {
    playButtonClick()
    
    const shareData: ShareData = {
      playerName: playerName || 'Guest',
      score: finalScore,
      level: currentLevel.name,
      difficulty,
    }
    
    // Try native share first (mobile-friendly)
    const shared = await shareNative(shareData)
    
    if (!shared) {
      // Fallback to clipboard
      const url = generateShareUrl(shareData)
      const copied = await copyToClipboard(url)
      
      if (copied) {
        setShareStatus('copied')
        addToast('Link copied!', 'success')
        setTimeout(() => setShareStatus('idle'), 2000)
      } else {
        addToast('Failed to copy link', 'warning')
      }
    }
  }
  
  return (
    <div className="end-screen win">
      <h1>🎉 VICTORY! 🎉</h1>
      
      {/* Score rating */}
      <div style={{ fontSize: '2rem', color: rating.color, marginBottom: '0.5rem' }}>
        {rating.emoji} {rating.text}
      </div>
      
      <div className="stats" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Room: {currentLevel.name}</div>
        
        {/* Score breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem 1rem', textAlign: 'left' }}>
          <div>⏱️ Time:</div>
          <div style={{ textAlign: 'right' }}>{formatTime(timeElapsed)}</div>
          
          {wrongSelections > 0 && (
            <>
              <div style={{ color: '#ff4757' }}>❌ Wrong selections:</div>
              <div style={{ textAlign: 'right', color: '#ff4757' }}>+{penaltyTime}s ({wrongSelections}×{PENALTY_SECONDS})</div>
            </>
          )}
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem', fontWeight: 'bold' }}>
            📊 Final Score:
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: rating.color }}>
            {formatTime(finalScore)}
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.6 }}>
          Targets Found: {foundCount}/5
        </div>
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
        onClick={handleShare}
        style={{
          padding: '0.8rem 2rem',
          margin: '0.5rem',
          fontFamily: "'Fredoka One', cursive",
          fontSize: '1.2rem',
          background: shareStatus === 'copied' ? '#7bed9f' : '#667eea',
          color: 'white',
          border: '4px solid #2c3e50',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => {
          if (shareStatus === 'idle') {
            e.currentTarget.style.background = '#764ba2'
          }
        }}
        onMouseLeave={(e) => {
          if (shareStatus === 'idle') {
            e.currentTarget.style.background = '#667eea'
          }
        }}
      >
        {shareStatus === 'copied' ? '✓ Copied!' : '🔗 Share Score'}
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
