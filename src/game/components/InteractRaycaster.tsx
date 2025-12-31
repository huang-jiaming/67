/**
 * InteractRaycaster.tsx - Interaction System
 * Handles raycasting from camera center to detect interactable objects
 * Manages the "hold to target" mechanic for finding 67s AND detecting decoys
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, useGamePhase, useTargets, useDecoys, useIsMobile } from '../state'
import { Target, Decoy } from '../types'
import { Vector3Tuple } from 'three'
import { playTargetFound, playHoverStart, playHoldProgress } from './Sfx'

interface InteractRaycasterProps {
  targetGroup: React.RefObject<THREE.Group | null>
  chestRef: React.RefObject<THREE.Group | null>
  chestPosition: Vector3Tuple
}

// Raycast constants
const CHEST_INTERACT_DISTANCE = 3.0
const TARGET_DOT_THRESHOLD = 0.85 // About 30 degrees - more forgiving

// Pre-allocated vectors to avoid GC
const _targetPos = new THREE.Vector3()
const _chestPos = new THREE.Vector3()
const _dirToTarget = new THREE.Vector3()
const _cameraDir = new THREE.Vector3()
const _screenCenter = new THREE.Vector2(0, 0)

/**
 * Check if player is in the vantage zone for angle-based targets
 */
function isInVantageZone(playerPos: THREE.Vector3, target: Target): boolean {
  if (!target.vantageZone) return true
  
  const vantagePos = new THREE.Vector3(...target.vantageZone.position)
  const distance = playerPos.distanceTo(vantagePos)
  // More forgiving radius for vantage zone
  return distance <= target.vantageZone.radius * 2
}

// Type for what we're hovering over
type HoverItem = { type: 'target'; item: Target } | { type: 'decoy'; item: Decoy } | null

/**
 * Central raycaster for interaction detection
 */
export function InteractRaycaster({
  chestPosition,
}: InteractRaycasterProps) {
  const { camera } = useThree()
  const phase = useGamePhase()
  const targets = useTargets()
  const decoys = useDecoys()
  const findTarget = useGameStore((s) => s.findTarget)
  const selectDecoy = useGameStore((s) => s.selectDecoy)
  const openChest = useGameStore((s) => s.openChest)
  const chestOpen = useGameStore((s) => s.chestOpen)
  const isPointerLocked = useGameStore((s) => s.isPointerLocked)
  const isMobile = useIsMobile()
  const mobileGameStarted = useGameStore((s) => s.mobileGameStarted)
  
  // Raycaster
  const raycaster = useRef(new THREE.Raycaster())
  
  // Interaction state
  const [hoveredItem, setHoveredItem] = useState<HoverItem>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [nearChest, setNearChest] = useState(false)
  
  const holdStartTime = useRef<number | null>(null)
  const lastProgressSound = useRef(0)
  
  // Update global state for HUD
  useEffect(() => {
    useGameStore.setState({
      hoveredTarget: hoveredItem?.type === 'target' ? hoveredItem.item : null,
      hoveredDecoy: hoveredItem?.type === 'decoy' ? hoveredItem.item : null,
      holdProgress,
      nearChest,
    })
  }, [hoveredItem, holdProgress, nearChest])
  
  // Check if player is actively playing (pointer locked on desktop, game started on mobile)
  const isPlayerActive = isMobile ? mobileGameStarted : isPointerLocked
  
  // Get hold seconds required for current hovered item
  const getHoldSeconds = (): number => {
    if (!hoveredItem) return 5
    return hoveredItem.item.holdSecondsRequired
  }
  
  // Mouse/touch handlers
  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    if (phase !== 'playing' || !isPlayerActive || chestOpen) return
    
    // On mobile, check if touch is on UI elements
    if (isMobile && 'touches' in e) {
      const touch = e.touches[0]
      const target = touch?.target as HTMLElement
      if (target?.closest('.mobile-controls, .hud, .tool-slot, .mobile-action-btn, .mobile-pause-btn')) {
        return
      }
    }
    
    if (hoveredItem) {
      // Check if target is already found or decoy already revealed
      if (hoveredItem.type === 'target' && hoveredItem.item.found) return
      if (hoveredItem.type === 'decoy' && hoveredItem.item.revealed) return
      
      setIsHolding(true)
      holdStartTime.current = Date.now()
      lastProgressSound.current = 0
    }
  }, [phase, isPlayerActive, chestOpen, hoveredItem, isMobile])
  
  const handleMouseUp = useCallback(() => {
    setIsHolding(false)
    holdStartTime.current = null
    setHoldProgress(0)
    lastProgressSound.current = 0
  }, [])
  
  // E key for chest interaction (desktop) - mobile uses button in HUD
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'KeyE' && nearChest && !chestOpen && phase === 'playing' && isPlayerActive) {
      openChest()
      // Exit pointer lock when opening chest (desktop only)
      if (!isMobile) {
        document.exitPointerLock()
      }
    }
  }, [nearChest, chestOpen, phase, openChest, isPlayerActive, isMobile])
  
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => handleMouseDown(e)
    const onTouchStart = (e: TouchEvent) => handleMouseDown(e)
    
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)
    
    // Touch support for mobile
    document.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchend', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseUp, handleKeyDown])
  
  // Raycast and hold progress update
  useFrame(() => {
    if (phase !== 'playing') {
      setHoveredItem(null)
      setNearChest(false)
      return
    }
    
    // When chest is open, don't detect targets or decoys
    if (chestOpen) {
      setHoveredItem(null)
      return
    }
    
    // Set raycaster from camera center
    raycaster.current.setFromCamera(_screenCenter, camera)
    
    // Check distance to chest
    _chestPos.set(chestPosition[0], chestPosition[1], chestPosition[2])
    const distToChest = camera.position.distanceTo(_chestPos)
    setNearChest(distToChest <= CHEST_INTERACT_DISTANCE)
    
    // Find best item to hover (closest that meets criteria)
    let foundHover: HoverItem = null
    let bestDot = TARGET_DOT_THRESHOLD
    
    // Check targets first
    for (const target of targets) {
      if (target.found) continue
      
      _targetPos.set(target.position[0], target.position[1], target.position[2])
      const distToTarget = camera.position.distanceTo(_targetPos)
      
      // Check if within interact radius (more forgiving)
      if (distToTarget > target.interactRadius + 1) continue
      
      // Check vantage zone for angle-based targets
      if (!isInVantageZone(camera.position, target)) continue
      
      // Check if looking at target
      _dirToTarget.copy(_targetPos).sub(camera.position).normalize()
      _cameraDir.set(0, 0, -1).applyQuaternion(camera.quaternion)
      const dot = _dirToTarget.dot(_cameraDir)
      
      // Find the target we're looking at most directly
      if (dot > bestDot) {
        bestDot = dot
        foundHover = { type: 'target', item: target }
      }
    }
    
    // Check decoys (same logic as targets)
    for (const decoy of decoys) {
      if (decoy.revealed) continue
      
      _targetPos.set(decoy.position[0], decoy.position[1], decoy.position[2])
      const distToDecoy = camera.position.distanceTo(_targetPos)
      
      // Check if within interact radius
      if (distToDecoy > decoy.interactRadius + 1) continue
      
      // Check if looking at decoy
      _dirToTarget.copy(_targetPos).sub(camera.position).normalize()
      _cameraDir.set(0, 0, -1).applyQuaternion(camera.quaternion)
      const dot = _dirToTarget.dot(_cameraDir)
      
      // Find the decoy we're looking at most directly
      if (dot > bestDot) {
        bestDot = dot
        foundHover = { type: 'decoy', item: decoy }
      }
    }
    
    // Update hovered state
    const prevItem = hoveredItem
    const currentItemId = foundHover?.item.id
    const prevItemId = prevItem?.item.id
    
    if (currentItemId !== prevItemId) {
      if (foundHover && !prevItem) {
        playHoverStart()
      }
      setHoveredItem(foundHover)
      
      // Reset hold if item changed
      setIsHolding(false)
      holdStartTime.current = null
      setHoldProgress(0)
    }
    
    // Update hold progress
    if (isHolding && hoveredItem && holdStartTime.current !== null) {
      const elapsed = (Date.now() - holdStartTime.current) / 1000
      const requiredTime = getHoldSeconds()
      const progress = Math.min(1, elapsed / requiredTime)
      setHoldProgress(progress)
      
      // Play progress sounds
      const progressStep = Math.floor(progress * 4)
      if (progressStep > lastProgressSound.current) {
        lastProgressSound.current = progressStep
        playHoldProgress(progress)
      }
      
      // Check if selection is complete
      if (progress >= 1) {
        if (hoveredItem.type === 'target') {
          findTarget(hoveredItem.item.id)
          playTargetFound()
        } else if (hoveredItem.type === 'decoy') {
          selectDecoy(hoveredItem.item.id)
          // Play a different sound for wrong selection (could add a "wrong" sound)
          // For now, just no victory sound
        }
        
        setIsHolding(false)
        holdStartTime.current = null
        setHoldProgress(0)
        setHoveredItem(null)
      }
    }
  })
  
  return null
}

// Extend game store with interaction state
declare module '../state' {
  interface GameState {
    hoveredTarget: Target | null
    hoveredDecoy: Decoy | null
    holdProgress: number
    nearChest: boolean
  }
}
