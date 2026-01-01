/**
 * SharedScoreModal.tsx - Modal for displaying shared scores
 * Shows when the app loads with a ?share= URL parameter
 */

import { ShareData, formatScore, cleanShareFromUrl } from '../lib/share'
import { useGameStore } from '../game/state'
import { playButtonClick } from '../game/components/Sfx'

interface SharedScoreModalProps {
  shareData: ShareData
  onClose: () => void
}

export function SharedScoreModal({ shareData, onClose }: SharedScoreModalProps) {
  const startGame = useGameStore((s) => s.startGame)
  
  const handlePlayNow = () => {
    playButtonClick()
    cleanShareFromUrl()
    onClose()
    startGame()
  }
  
  const handleMaybeLater = () => {
    playButtonClick()
    cleanShareFromUrl()
    onClose()
  }
  
  // Get difficulty emoji
  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '😊'
      case 'hard': return '😈'
      default: return '😐'
    }
  }
  
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 299,
        }}
        onClick={handleMaybeLater}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          padding: '2.5rem',
          borderRadius: '20px',
          border: '6px solid #4ECDC4',
          boxShadow: '0 0 60px rgba(78, 205, 196, 0.4), 8px 8px 0 rgba(0,0,0,0.3)',
          zIndex: 300,
          textAlign: 'center',
          maxWidth: '90%',
          width: '400px',
          animation: 'fadeIn 0.5s ease',
        }}
      >
        {/* Trophy icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          🏆
        </div>
        
        {/* Challenge text */}
        <h2
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.8rem',
            color: '#ffe66d',
            marginBottom: '1.5rem',
            textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          Score Challenge!
        </h2>
        
        {/* Player score info */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.3rem',
              color: '#4ECDC4',
              marginBottom: '0.75rem',
            }}
          >
            {shareData.playerName || 'A player'}
          </div>
          
          <div style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            scored
          </div>
          
          <div
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '2.5rem',
              color: '#7bed9f',
              textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
              marginBottom: '0.5rem',
            }}
          >
            {formatScore(shareData.score)}
          </div>
          
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
            on <strong style={{ color: '#ff6b35' }}>{shareData.level}</strong>
            <span style={{ marginLeft: '0.5rem' }}>
              {getDifficultyEmoji(shareData.difficulty)} {shareData.difficulty}
            </span>
          </div>
        </div>
        
        {/* Challenge message */}
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            marginBottom: '1.5rem',
          }}
        >
          Can you beat this score?
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handlePlayNow}
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.4rem',
              padding: '1rem 2rem',
              background: '#ff6b35',
              color: 'white',
              border: '4px solid #2c3e50',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)'
              e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.2)'
            }}
          >
            ▶ Play Now
          </button>
          
          <button
            onClick={handleMaybeLater}
            style={{
              fontFamily: "'Rubik', sans-serif",
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </>
  )
}

