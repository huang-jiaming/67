/**
 * HoldProgressUI.tsx - Circular Hold Progress Indicator
 * Shows progress when holding mouse on a target
 */


interface HoldProgressUIProps {
  progress: number  // 0 to 1
  isActive: boolean
}

/**
 * Circular progress indicator for hold-to-confirm mechanic
 */
export function HoldProgressUI({ progress, isActive }: HoldProgressUIProps) {
  if (!isActive || progress <= 0) {
    return null
  }
  
  // SVG circle parameters
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  
  // Color interpolation from white to gold as progress increases
  const hue = 45 // Gold
  const saturation = Math.round(progress * 100)
  const lightness = 60 + (1 - progress) * 30
  const strokeColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  
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
      <div className="label">
        {Math.round(progress * 100)}%
      </div>
    </div>
  )
}

