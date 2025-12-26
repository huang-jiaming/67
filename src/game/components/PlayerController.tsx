/**
 * PlayerController.tsx - First-Person Player Controls
 * Handles pointer lock, WASD movement, mouse look, and mobile touch controls
 * Optimized for performance with proper collision detection
 */

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, useGamePhase, useIsMobile, useMobileJoystick } from '../state'
import { Vector3Tuple } from 'three'
import { useTouchLook } from './MobileControls'

interface PlayerControllerProps {
  spawnPosition: Vector3Tuple
  spawnRotation?: number
  roomSize: Vector3Tuple
}

// Movement constants
const MOVE_SPEED = 4
const LOOK_SPEED = 0.002
const TOUCH_LOOK_SPEED = 0.003 // Slightly faster for touch
const GRAVITY = -15
const JUMP_FORCE = 6
const PLAYER_HEIGHT = 1.6
const PLAYER_RADIUS = 0.5
const WALL_BUFFER = 0.8 // Extra buffer from walls

// Joystick area bounds (for excluding from touch look)
const JOYSTICK_BOUNDS = {
  left: 0,
  top: 0,
  right: 160, // 120px joystick + 20px padding + extra margin
  bottom: 0, // Will be calculated from window height
}

/**
 * First-person player controller with pointer lock
 * Optimized to minimize garbage collection
 */
export function PlayerController({
  spawnPosition,
  spawnRotation = 0,
  roomSize,
}: PlayerControllerProps) {
  const { camera, gl } = useThree()
  const phase = useGamePhase()
  const setPointerLocked = useGameStore((s) => s.setPointerLocked)
  const isPointerLocked = useGameStore((s) => s.isPointerLocked)
  const chestOpen = useGameStore((s) => s.chestOpen)
  const isMobile = useIsMobile()
  const mobileJoystick = useMobileJoystick()
  const mobileGameStarted = useGameStore((s) => s.mobileGameStarted)
  
  // Pre-allocated vectors to avoid garbage collection
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const moveEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const newPos = useRef(new THREE.Vector3())
  const isOnGround = useRef(true)
  
  // Input state
  const keys = useRef<Set<string>>(new Set())
  
  // Calculate joystick bounds for touch look exclusion
  const joystickBounds = useMemo(() => {
    if (typeof window === 'undefined') return null
    return {
      left: JOYSTICK_BOUNDS.left,
      top: window.innerHeight - 220, // 120px joystick + 100px from bottom
      right: JOYSTICK_BOUNDS.right,
      bottom: window.innerHeight,
    }
  }, [])
  
  // Touch look handler for mobile
  const handleTouchLook = useCallback((deltaX: number, deltaY: number) => {
    if (phase !== 'playing' || chestOpen) return
    
    euler.current.y -= deltaX * TOUCH_LOOK_SPEED
    euler.current.x -= deltaY * TOUCH_LOOK_SPEED
    euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x))
    
    camera.rotation.copy(euler.current)
  }, [camera, phase, chestOpen])
  
  // Use the touch look hook for mobile
  useTouchLook(handleTouchLook, joystickBounds)
  
  // Memoize room bounds for collision - with proper buffer
  const bounds = useMemo(() => ({
    minX: -roomSize[0] / 2 + PLAYER_RADIUS + WALL_BUFFER,
    maxX: roomSize[0] / 2 - PLAYER_RADIUS - WALL_BUFFER,
    minZ: -roomSize[2] / 2 + PLAYER_RADIUS + WALL_BUFFER,
    maxZ: roomSize[2] / 2 - PLAYER_RADIUS - WALL_BUFFER,
    maxY: roomSize[1] - 0.3,
  }), [roomSize])
  
  // Initialize camera position
  useEffect(() => {
    camera.position.set(spawnPosition[0], spawnPosition[1], spawnPosition[2])
    euler.current.set(0, spawnRotation, 0, 'YXZ')
    camera.rotation.copy(euler.current)
    velocity.current.set(0, 0, 0)
    isOnGround.current = true
  }, [camera, spawnPosition, spawnRotation])
  
  // Pointer lock handlers
  const handleClick = useCallback(() => {
    if (phase !== 'playing' || chestOpen) return
    gl.domElement.requestPointerLock()
  }, [gl, phase, chestOpen])
  
  const handlePointerLockChange = useCallback(() => {
    const locked = document.pointerLockElement === gl.domElement
    setPointerLocked(locked)
  }, [gl, setPointerLocked])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPointerLocked || phase !== 'playing' || chestOpen) return
    
    euler.current.y -= e.movementX * LOOK_SPEED
    euler.current.x -= e.movementY * LOOK_SPEED
    
    // Clamp vertical look
    euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x))
    
    camera.rotation.copy(euler.current)
  }, [camera, isPointerLocked, phase, chestOpen])
  
  // Keyboard handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current.add(e.code)
    
    // Jump
    if (e.code === 'Space' && isOnGround.current && isPointerLocked) {
      velocity.current.y = JUMP_FORCE
      isOnGround.current = false
    }
  }, [isPointerLocked])
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current.delete(e.code)
  }, [])
  
  // Set up event listeners (desktop only - mobile uses MobileControls)
  useEffect(() => {
    const canvas = gl.domElement
    
    // Only set up pointer lock on desktop
    if (!isMobile) {
      canvas.addEventListener('click', handleClick)
      document.addEventListener('pointerlockchange', handlePointerLockChange)
      document.addEventListener('mousemove', handleMouseMove)
    }
    
    // Keyboard works on both (external keyboards on tablets)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    
    return () => {
      if (!isMobile) {
        canvas.removeEventListener('click', handleClick)
        document.removeEventListener('pointerlockchange', handlePointerLockChange)
        document.removeEventListener('mousemove', handleMouseMove)
      }
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    gl,
    isMobile,
    handleClick,
    handlePointerLockChange,
    handleMouseMove,
    handleKeyDown,
    handleKeyUp,
  ])
  
  // Movement update loop - optimized to avoid allocations
  useFrame((_, delta) => {
    if (phase !== 'playing' || chestOpen) return
    
    // Clamp delta to avoid large jumps
    const dt = Math.min(delta, 0.05)
    
    // Check if player can move
    // Desktop: requires pointer lock
    // Mobile: requires game started
    const canMove = isMobile ? mobileGameStarted : isPointerLocked
    
    // Calculate movement direction (reuse existing vector)
    direction.current.set(0, 0, 0)
    
    if (canMove) {
      // Keyboard input (works on both desktop and mobile with external keyboard)
      if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) {
        direction.current.z -= 1
      }
      if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) {
        direction.current.z += 1
      }
      if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) {
        direction.current.x -= 1
      }
      if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) {
        direction.current.x += 1
      }
      
      // Mobile joystick input - add to keyboard input
      if (isMobile && (mobileJoystick.x !== 0 || mobileJoystick.y !== 0)) {
        direction.current.x += mobileJoystick.x
        direction.current.z -= mobileJoystick.y // Forward is negative Z
      }
    }
    
    direction.current.normalize()
    
    // Apply camera Y rotation to movement direction (reuse euler)
    moveEuler.current.set(0, euler.current.y, 0, 'YXZ')
    direction.current.applyEuler(moveEuler.current)
    
    // Update horizontal velocity with friction
    velocity.current.x = direction.current.x * MOVE_SPEED
    velocity.current.z = direction.current.z * MOVE_SPEED
    
    // Apply gravity
    velocity.current.y += GRAVITY * dt
    velocity.current.y = Math.max(velocity.current.y, -20) // Terminal velocity
    
    // Calculate new position (reuse vector)
    newPos.current.copy(camera.position)
    newPos.current.x += velocity.current.x * dt
    newPos.current.y += velocity.current.y * dt
    newPos.current.z += velocity.current.z * dt
    
    // Ground collision
    if (newPos.current.y < PLAYER_HEIGHT) {
      newPos.current.y = PLAYER_HEIGHT
      velocity.current.y = 0
      isOnGround.current = true
    }
    
    // Ceiling collision
    if (newPos.current.y > bounds.maxY) {
      newPos.current.y = bounds.maxY
      velocity.current.y = 0
    }
    
    // Wall collisions - hard clamp to prevent going through
    if (newPos.current.x < bounds.minX) {
      newPos.current.x = bounds.minX
      velocity.current.x = 0
    } else if (newPos.current.x > bounds.maxX) {
      newPos.current.x = bounds.maxX
      velocity.current.x = 0
    }
    
    if (newPos.current.z < bounds.minZ) {
      newPos.current.z = bounds.minZ
      velocity.current.z = 0
    } else if (newPos.current.z > bounds.maxZ) {
      newPos.current.z = bounds.maxZ
      velocity.current.z = 0
    }
    
    // Apply position
    camera.position.copy(newPos.current)
  })
  
  return null
}
