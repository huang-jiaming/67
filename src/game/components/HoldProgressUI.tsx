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
    <div className="hold-progress-pickaxe">
      {/* Pickaxe icon with swing animation */}
      <div 
        className="pickaxe-swing"
        style={{
          animationDuration: `${swingDuration}s`,
        }}
      >
        <svg viewBox="0 0 64 64" className="pickaxe-svg">
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
              <circle cx="8" cy="16" r="2" fill="#FFD700" className="sparkle-1" />
              <circle cx="16" cy="8" r="2" fill="#FFD700" className="sparkle-2" />
            </>
          )}
          {progress > 0.85 && (
            <>
              <circle cx="4" cy="12" r="1.5" fill="#FFFFFF" className="sparkle-3" />
              <circle cx="12" cy="4" r="1.5" fill="#FFFFFF" className="sparkle-4" />
            </>
          )}
        </svg>
      </div>
      
      {/* Progress bar below pickaxe */}
      <div className="pickaxe-progress-bar">
        <div 
          className="pickaxe-progress-fill"
          style={{
            width: `${barWidth}%`,
            background: barColor,
            boxShadow: progress > 0.7 ? `0 0 8px ${barColor}` : 'none',
          }} 
        />
      </div>
      
      {/* Percentage text */}
      <div className="pickaxe-label">
        {Math.round(progress * 100)}%
      </div>
    </div>
  )
}
