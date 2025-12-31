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
  
  // SVG circle parameters for background progress ring
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  
  // Color interpolation from white to gold as progress increases
  const hue = 45 // Gold
  const saturation = Math.round(progress * 100)
  const lightness = 60 + (1 - progress) * 30
  const strokeColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  
  // Calculate swing animation speed based on progress (faster as we get closer)
  const swingDuration = 0.3 - progress * 0.15 // 0.3s to 0.15s
  
  return (
    <div className="hold-progress">
      <svg viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          className="bg"
          cx="40"
          cy="40"
          r={radius}
        />
        {/* Progress circle */}
        <circle
          className="progress"
          cx="40"
          cy="40"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            stroke: strokeColor,
          }}
        />
      </svg>
      
      {/* Pickaxe icon with swing animation */}
      <div 
        className="pickaxe-container"
        style={{
          animation: `pickaxeSwing ${swingDuration}s ease-in-out infinite`,
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="pickaxe-icon"
          style={{
            filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
          }}
        >
          {/* Pickaxe head */}
          <path 
            d="M14.5 3L13 1.5L4.5 10L6 11.5L14.5 3Z" 
            fill="#6B7280"
            stroke="#374151"
            strokeWidth="0.5"
          />
          <path 
            d="M11 6.5L9.5 5L1 13.5L2.5 15L11 6.5Z" 
            fill="#6B7280"
            stroke="#374151"
            strokeWidth="0.5"
          />
          {/* Pickaxe handle */}
          <path 
            d="M12 12L22 22" 
            stroke="#8B4513"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path 
            d="M12 12L22 22" 
            stroke="#A0522D"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Sparkle effect when near completion */}
          {progress > 0.7 && (
            <>
              <circle cx="6" cy="8" r="1" fill="#FFD700" opacity={progress > 0.9 ? 1 : 0.6}>
                <animate attributeName="opacity" values="1;0.3;1" dur="0.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="4" cy="11" r="0.8" fill="#FFD700" opacity={progress > 0.85 ? 1 : 0.4}>
                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.4s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      </div>
      
      {/* Progress percentage */}
      <div className="label" style={{ bottom: '-25px', top: 'auto' }}>
        {Math.round(progress * 100)}%
      </div>
      
      {/* Inline styles for animation */}
      <style>{`
        @keyframes pickaxeSwing {
          0%, 100% { transform: translate(-50%, -50%) rotate(-30deg); }
          50% { transform: translate(-50%, -50%) rotate(15deg); }
        }
        
        .pickaxe-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          transform-origin: center center;
        }
        
        .pickaxe-icon {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  )
}
