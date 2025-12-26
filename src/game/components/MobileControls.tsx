/**
 * MobileControls.tsx - Mobile Touch Controls
 * Virtual joystick for movement and touch areas for camera look
 * Only renders on mobile/touch devices
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { useGameStore, useGamePhase, useIsMobile } from '../state'

// Joystick constants
const JOYSTICK_SIZE = 120
const KNOB_SIZE = 50
const JOYSTICK_MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2

interface TouchPosition {
  x: number
  y: number
}

/**
 * Virtual Joystick Component
 * Provides WASD-like movement input for mobile
 */
export function MobileControls() {
  const isMobile = useIsMobile()
  const phase = useGamePhase()
  const chestOpen = useGameStore((s) => s.chestOpen)
  const setMobileJoystick = useGameStore((s) => s.setMobileJoystick)
  const setMobileGameStarted = useGameStore((s) => s.setMobileGameStarted)
  const mobileGameStarted = useGameStore((s) => s.mobileGameStarted)
  
  // Joystick state
  const joystickRef = useRef<HTMLDivElement>(null)
  const [knobPosition, setKnobPosition] = useState<TouchPosition>({ x: 0, y: 0 })
  const [isJoystickActive, setIsJoystickActive] = useState(false)
  const joystickTouchId = useRef<number | null>(null)
  const joystickCenter = useRef<TouchPosition>({ x: 0, y: 0 })
  
  // Don't render on desktop
  if (!isMobile) return null
  
  // Don't render when not playing or chest is open
  if (phase !== 'playing' || chestOpen) return null

  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Start the game on mobile when joystick is touched
    if (!mobileGameStarted) {
      setMobileGameStarted(true)
    }
    
    const touch = e.touches[0]
    if (!joystickRef.current) return
    
    const rect = joystickRef.current.getBoundingClientRect()
    joystickCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    joystickTouchId.current = touch.identifier
    setIsJoystickActive(true)
    
    updateJoystick(touch.clientX, touch.clientY)
  }
  
  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (!isJoystickActive || joystickTouchId.current === null) return
    
    // Find the correct touch
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === joystickTouchId.current) {
        updateJoystick(e.touches[i].clientX, e.touches[i].clientY)
        break
      }
    }
  }
  
  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    
    // Check if our touch ended
    let touchEnded = true
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === joystickTouchId.current) {
        touchEnded = false
        break
      }
    }
    
    if (touchEnded) {
      setIsJoystickActive(false)
      joystickTouchId.current = null
      setKnobPosition({ x: 0, y: 0 })
      setMobileJoystick({ x: 0, y: 0 })
    }
  }
  
  const updateJoystick = (touchX: number, touchY: number) => {
    const dx = touchX - joystickCenter.current.x
    const dy = touchY - joystickCenter.current.y
    
    // Calculate distance from center
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Clamp to max distance
    const clampedDistance = Math.min(distance, JOYSTICK_MAX_DISTANCE)
    const angle = Math.atan2(dy, dx)
    
    const clampedX = Math.cos(angle) * clampedDistance
    const clampedY = Math.sin(angle) * clampedDistance
    
    setKnobPosition({ x: clampedX, y: clampedY })
    
    // Normalize to -1 to 1 range
    const normalizedX = clampedX / JOYSTICK_MAX_DISTANCE
    const normalizedY = -clampedY / JOYSTICK_MAX_DISTANCE // Invert Y for forward = positive
    
    setMobileJoystick({ x: normalizedX, y: normalizedY })
  }
  
  return (
    <div className="mobile-controls">
      {/* Virtual Joystick */}
      <div
        ref={joystickRef}
        className="joystick"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        style={{
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
        }}
      >
        <div
          className="joystick-knob"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
          }}
        />
      </div>
    </div>
  )
}

/**
 * Touch Look Handler Component
 * Handles camera look via touch dragging outside joystick area
 * This is a separate component to be used in PlayerController
 */
export function useTouchLook(
  onLookDelta: (deltaX: number, deltaY: number) => void,
  joystickBounds: { left: number; top: number; right: number; bottom: number } | null
) {
  const isMobile = useIsMobile()
  const phase = useGamePhase()
  const chestOpen = useGameStore((s) => s.chestOpen)
  const mobileGameStarted = useGameStore((s) => s.mobileGameStarted)
  const setMobileGameStarted = useGameStore((s) => s.setMobileGameStarted)
  
  const lookTouchId = useRef<number | null>(null)
  const lastTouchPos = useRef<TouchPosition>({ x: 0, y: 0 })
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile || phase !== 'playing' || chestOpen) return
    
    // Find a touch that's not in the joystick area
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      
      // Skip if touch is in joystick bounds
      if (joystickBounds) {
        if (
          touch.clientX >= joystickBounds.left &&
          touch.clientX <= joystickBounds.right &&
          touch.clientY >= joystickBounds.top &&
          touch.clientY <= joystickBounds.bottom
        ) {
          continue
        }
      }
      
      // Skip if touch is on UI elements
      const target = touch.target as HTMLElement
      if (target.closest('.mobile-controls, .hud, .tool-slot, .mobile-action-btn, .mobile-pause-btn')) {
        continue
      }
      
      // Start the game on first look touch
      if (!mobileGameStarted) {
        setMobileGameStarted(true)
      }
      
      // Use this touch for looking
      lookTouchId.current = touch.identifier
      lastTouchPos.current = { x: touch.clientX, y: touch.clientY }
      break
    }
  }, [isMobile, phase, chestOpen, joystickBounds, mobileGameStarted, setMobileGameStarted])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (lookTouchId.current === null) return
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === lookTouchId.current) {
        const deltaX = touch.clientX - lastTouchPos.current.x
        const deltaY = touch.clientY - lastTouchPos.current.y
        
        lastTouchPos.current = { x: touch.clientX, y: touch.clientY }
        onLookDelta(deltaX, deltaY)
        break
      }
    }
  }, [onLookDelta])
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null
        break
      }
    }
  }, [])
  
  useEffect(() => {
    if (!isMobile) return
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd])
}

