/**
 * HoldProgressUI.tsx - Pickaxe Mining Progress Indicator
 * Shows a swinging pickaxe animation when holding on a target
 */

interface HoldProgressUIProps {
  progress: number  // 0 to 1
  isActive: boolean
}

/**
 * Pickaxe mining animation for hold-to-confirm mechanic
 */
export function HoldProgressUI({ progress, isActive }: HoldProgressUIProps) {
  if (!isActive || progress <= 0) {
    return null
  }
  
  // Calculate swing animation speed based on progress (faster as we get closer)
  const swingDuration = 0.4 - progress * 0.25 // 0.4s to 0.15s
  
  // Progress bar width
  const barWidth = progress * 100
  
  // Color based on progress
  const barColor = progress > 0.8 ? '#FFD700' : progress > 0.5 ? '#FFA500' : '#4ECDC4'
  
  return (
    <div className="hold-progress" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '120px',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* Pickaxe icon with swing animation */}
      <div 
        style={{
          width: '60px',
          height: '60px',
          animation: `pickaxeSwing ${swingDuration}s ease-in-out infinite`,
          transformOrigin: 'bottom right',
        }}
      >
        <svg 
          viewBox="0 0 64 64" 
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
          }}
        >
          {/* Pickaxe handle */}
          <line 
            x1="20" y1="20" 
            x2="58" y2="58" 
            stroke="#5D3A1A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line 
            x1="20" y1="20" 
            x2="58" y2="58" 
            stroke="#8B5A2B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Pickaxe head - left prong */}
          <path 
            d="M8 4 L20 20 L12 24 L2 10 Z" 
            fill="#71717A"
            stroke="#52525B"
            strokeWidth="1"
          />
          
          {/* Pickaxe head - right prong */}
          <path 
            d="M4 8 L20 20 L24 12 L10 2 Z" 
            fill="#A1A1AA"
            stroke="#71717A"
            strokeWidth="1"
          />
          
          {/* Metal shine */}
          <path 
            d="M6 6 L14 14" 
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Sparkles when near completion */}
          {progress > 0.6 && (
            <>
              <circle cx="8" cy="16" r="2" fill="#FFD700">
                <animate attributeName="opacity" values="1;0.2;1" dur="0.2s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;3;2" dur="0.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="16" cy="8" r="2" fill="#FFD700">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.25s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          {progress > 0.85 && (
            <>
              <circle cx="4" cy="12" r="1.5" fill="#FFFFFF">
                <animate attributeName="opacity" values="1;0;1" dur="0.15s" repeatCount="indefinite" />
              </circle>
              <circle cx="12" cy="4" r="1.5" fill="#FFFFFF">
                <animate attributeName="opacity" values="0;1;0" dur="0.15s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      </div>
      
      {/* Progress bar below pickaxe */}
      <div style={{
        width: '80px',
        height: '8px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '4px',
        marginTop: '8px',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.3)',
      }}>
        <div style={{
          width: `${barWidth}%`,
          height: '100%',
          background: barColor,
          borderRadius: '2px',
          transition: 'width 0.1s ease-out',
          boxShadow: progress > 0.7 ? `0 0 8px ${barColor}` : 'none',
        }} />
      </div>
      
      {/* Percentage text */}
      <div style={{
        marginTop: '4px',
        fontFamily: 'var(--font-display)',
        fontSize: '0.9rem',
        color: 'white',
        textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
      }}>
        {Math.round(progress * 100)}%
      </div>
      
      {/* Inline keyframes */}
      <style>{`
        @keyframes pickaxeSwing {
          0%, 100% { transform: rotate(-25deg); }
          50% { transform: rotate(25deg); }
        }
      `}</style>
    </div>
  )
}
