/**
 * InteractRaycaster.tsx - Interaction System
 * Handles raycasting from camera center to detect interactable objects
 * Manages the "hold to target" mechanic for finding 67s
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, useGamePhase, useTargets } from '../state'
import { Target } from '../types'
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

/**
 * Central raycaster for interaction detection
 */
export function InteractRaycaster({
  chestPosition,
}: InteractRaycasterProps) {
  const { camera } = useThree()
  const phase = useGamePhase()
  const targets = useTargets()
  const findTarget = useGameStore((s) => s.findTarget)
  const openChest = useGameStore((s) => s.openChest)
  const chestOpen = useGameStore((s) => s.chestOpen)
  const isPointerLocked = useGameStore((s) => s.isPointerLocked)
  
  // Raycaster
  const raycaster = useRef(new THREE.Raycaster())
  
  // Interaction state (exposed to HUD via global store)
  const [hoveredTarget, setHoveredTarget] = useState<Target | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [nearChest, setNearChest] = useState(false)
  
  const holdStartTime = useRef<number | null>(null)
  const lastProgressSound = useRef(0)
  
  // Update global state for HUD
  useEffect(() => {
    useGameStore.setState({
      hoveredTarget,
      holdProgress,
      nearChest,
    })
  }, [hoveredTarget, holdProgress, nearChest])
  
  // Mouse/touch handlers
  const handleMouseDown = useCallback(() => {
    if (phase !== 'playing' || !isPointerLocked || chestOpen) return
    
    if (hoveredTarget && !hoveredTarget.found) {
      setIsHolding(true)
      holdStartTime.current = Date.now()
      lastProgressSound.current = 0
    }
  }, [phase, isPointerLocked, chestOpen, hoveredTarget])
  
  const handleMouseUp = useCallback(() => {
    setIsHolding(false)
    holdStartTime.current = null
    setHoldProgress(0)
    lastProgressSound.current = 0
  }, [])
  
  // E key for chest interaction
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'KeyE' && nearChest && !chestOpen && phase === 'playing' && isPointerLocked) {
      openChest()
      // Exit pointer lock when opening chest
      document.exitPointerLock()
    }
  }, [nearChest, chestOpen, phase, openChest, isPointerLocked])
  
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)
    
    // Touch support
    document.addEventListener('touchstart', handleMouseDown)
    document.addEventListener('touchend', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchstart', handleMouseDown)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseUp, handleKeyDown])
  
  // Raycast and hold progress update
  useFrame(() => {
    if (phase !== 'playing') {
      setHoveredTarget(null)
      setNearChest(false)
      return
    }
    
    // When chest is open, don't detect targets
    if (chestOpen) {
      setHoveredTarget(null)
      return
    }
    
    // Set raycaster from camera center
    raycaster.current.setFromCamera(_screenCenter, camera)
    
    // Check distance to chest
    _chestPos.set(chestPosition[0], chestPosition[1], chestPosition[2])
    const distToChest = camera.position.distanceTo(_chestPos)
    setNearChest(distToChest <= CHEST_INTERACT_DISTANCE)
    
    // Find best target to hover (closest that meets criteria)
    let foundHover: Target | null = null
    let bestDot = TARGET_DOT_THRESHOLD
    
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
        foundHover = target
      }
    }
    
    // Update hovered state
    if (foundHover !== hoveredTarget) {
      if (foundHover && !hoveredTarget) {
        playHoverStart()
      }
      setHoveredTarget(foundHover)
      
      // Reset hold if target changed
      setIsHolding(false)
      holdStartTime.current = null
      setHoldProgress(0)
    }
    
    // Update hold progress
    if (isHolding && hoveredTarget && holdStartTime.current !== null) {
      const elapsed = (Date.now() - holdStartTime.current) / 1000
      const progress = Math.min(1, elapsed / hoveredTarget.holdSecondsRequired)
      setHoldProgress(progress)
      
      // Play progress sounds
      const progressStep = Math.floor(progress * 4)
      if (progressStep > lastProgressSound.current) {
        lastProgressSound.current = progressStep
        playHoldProgress(progress)
      }
      
      // Check if target is found
      if (progress >= 1) {
        findTarget(hoveredTarget.id)
        playTargetFound()
        setIsHolding(false)
        holdStartTime.current = null
        setHoldProgress(0)
        setHoveredTarget(null)
      }
    }
  })
  
  return null
}

// Extend game store with interaction state
declare module '../state' {
  interface GameState {
    hoveredTarget: Target | null
    holdProgress: number
    nearChest: boolean
  }
}
