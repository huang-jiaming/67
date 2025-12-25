/**
 * Chest.tsx - Tool Chest Component
 * Interactive chest where players can pick up powerups/tools
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Vector3Tuple } from 'three'
import { useGameStore, useChestState } from '../state'

interface ChestProps {
  position: Vector3Tuple
}

/**
 * Treasure chest that contains tools/powerups
 * Glows when player is nearby and has tools available
 */
export function Chest({ position }: ChestProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { open, tools } = useChestState()
  const nearChest = useGameStore((s) => s.nearChest)
  
  // Animation for chest lid and glow
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      
      // Gentle floating animation when has tools
      if (tools.length > 0 && !open) {
        groupRef.current.position.y = Math.sin(t * 2) * 0.02
      } else {
        groupRef.current.position.y = 0
      }
    }
  })
  
  // Glow intensity based on proximity and tool availability
  const glowIntensity = useMemo(() => {
    if (tools.length === 0) return 0
    return nearChest ? 0.5 : 0.2
  }, [tools.length, nearChest])
  
  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Chest base */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.4]} />
          <meshStandardMaterial 
            color="#8B4513" 
            roughness={0.8}
          />
        </mesh>
        
        {/* Chest lid (open when UI is showing) */}
        <group position={[0, 0.4, -0.18]} rotation={[open ? -Math.PI * 0.6 : 0, 0, 0]}>
          <mesh position={[0, 0.05, 0.18]} castShadow>
            <boxGeometry args={[0.6, 0.1, 0.4]} />
            <meshStandardMaterial color="#A0522D" roughness={0.75} />
          </mesh>
          {/* Lid top curve effect */}
          <mesh position={[0, 0.12, 0.18]} castShadow>
            <boxGeometry args={[0.55, 0.08, 0.35]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
        </group>
        
        {/* Metal bands */}
        <mesh position={[0, 0.2, 0.21]}>
          <boxGeometry args={[0.62, 0.06, 0.02]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.35, 0.21]}>
          <boxGeometry args={[0.62, 0.04, 0.02]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Lock */}
        <mesh position={[0, 0.28, 0.22]}>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Glow effect when has tools */}
        {tools.length > 0 && (
          <pointLight
            position={[0, 0.5, 0]}
            intensity={glowIntensity}
            color="#FFD700"
            distance={2}
          />
        )}
        
        {/* Sparkles when nearby and has tools */}
        {nearChest && tools.length > 0 && !open && (
          <SparkleEffect />
        )}
      </group>
    </group>
  )
}

/**
 * Simple sparkle effect using animated points
 */
function SparkleEffect() {
  const ref = useRef<THREE.Points>(null)
  
  // Create sparkle positions
  const positions = useMemo(() => {
    const pos = new Float32Array(15 * 3)
    for (let i = 0; i < 15; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8
      pos[i * 3 + 1] = Math.random() * 0.6 + 0.2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position
      const t = state.clock.elapsedTime
      
      for (let i = 0; i < 15; i++) {
        // Float upward and respawn
        let y = positions.getY(i) + 0.02
        if (y > 0.8) y = 0.2
        positions.setY(i, y)
        
        // Slight horizontal movement
        const x = positions.getX(i) + Math.sin(t * 3 + i) * 0.002
        positions.setX(i, x)
      }
      positions.needsUpdate = true
    }
  })
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={15}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FFD700"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * Chest UI Overlay (React DOM, not 3D)
 * Rendered in HUD when chest is open
 */
export function ChestUI() {
  const { tools } = useChestState()
  const closeChest = useGameStore((s) => s.closeChest)
  const takeToolFromChest = useGameStore((s) => s.takeToolFromChest)
  
  // Handle closing the chest
  const handleClose = () => {
    closeChest()
  }
  
  // Handle taking a tool
  const handleTakeTool = (toolId: string) => {
    takeToolFromChest(toolId)
    // Auto-close if last tool
    if (tools.length === 1) {
      closeChest()
    }
  }
  
  if (tools.length === 0) {
    return (
      <div className="chest-ui" onClick={(e) => e.stopPropagation()}>
        <h3>📦 Empty Chest</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
          No tools this round!
        </p>
        <button
          onClick={handleClose}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.5rem',
            background: '#4ECDC4',
            border: '3px solid #2c3e50',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
          }}
        >
          Close
        </button>
        <div className="close-hint">or press ESC</div>
      </div>
    )
  }
  
  return (
    <div className="chest-ui" onClick={(e) => e.stopPropagation()}>
      <h3>📦 Tool Chest</h3>
      <div className="chest-tools">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="chest-tool"
            onClick={() => handleTakeTool(tool.id)}
          >
            <div className="icon">{tool.icon}</div>
            <div className="name">{tool.name}</div>
          </div>
        ))}
      </div>
      <button
        onClick={handleClose}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1.5rem',
          background: '#4ECDC4',
          border: '3px solid #2c3e50',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
        }}
      >
        Close
      </button>
      <div className="close-hint">Click tool to take • ESC or click Close</div>
    </div>
  )
}

