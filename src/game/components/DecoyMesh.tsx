/**
 * DecoyMesh.tsx - Decoy Item Visualization
 * Renders decoy items that look similar to targets but are NOT 67
 * Each decoy type has a unique visual that tricks the player
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Decoy } from '../types'
import { Text } from '@react-three/drei'

interface DecoyMeshProps {
  decoy: Decoy
}

/**
 * Renders a decoy item based on its type
 * When revealed (wrong selection), the decoy shows an X mark
 */
export function DecoyMesh({ decoy }: DecoyMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const position = decoy.position
  const rotation = decoy.rotation || [0, 0, 0]
  const scale = decoy.scale || [1, 1, 1]
  
  // Subtle animation for unrevealed decoys (same as targets to trick player)
  useFrame((state) => {
    if (groupRef.current && !decoy.revealed) {
      const t = state.clock.elapsedTime
      const pulse = Math.sin(t * 2) * 0.03 + 1
      groupRef.current.scale.setScalar(pulse)
    }
  })
  
  // Base opacity based on revealed state
  const opacity = decoy.revealed ? 0.3 : 1
  const emissiveIntensity = decoy.revealed ? 0 : 0.2
  
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ decoyId: decoy.id, isDecoy: true }}
    >
      {renderDecoyType(decoy, opacity, emissiveIntensity)}
      
      {/* Wrong mark overlay when revealed */}
      {decoy.revealed && (
        <group position={[0, 0, 0.1]}>
          <mesh>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial color="#ff4757" transparent opacity={0.7} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            ✗
          </Text>
        </group>
      )}
    </group>
  )
}

/**
 * Renders the specific decoy type visualization
 */
function renderDecoyType(decoy: Decoy, opacity: number, emissiveIntensity: number) {
  switch (decoy.type) {
    case 'wrong_clock':
      return <WrongClockDecoy decoy={decoy} opacity={opacity} emissive={emissiveIntensity} />
    case 'wrong_page':
      return <WrongPageDecoy decoy={decoy} opacity={opacity} emissive={emissiveIntensity} />
    case 'wrong_note':
      return <WrongNoteDecoy decoy={decoy} opacity={opacity} emissive={emissiveIntensity} />
    case 'wrong_price':
      return <WrongPriceDecoy decoy={decoy} opacity={opacity} emissive={emissiveIntensity} />
    case 'wrong_calendar':
      return <WrongCalendarDecoy decoy={decoy} opacity={opacity} emissive={emissiveIntensity} />
    default:
      return <DefaultDecoy opacity={opacity} />
  }
}

// Decoy type components - Similar to targets but with WRONG values

function WrongClockDecoy({ decoy, opacity, emissive }: { decoy: Decoy; opacity: number; emissive: number }) {
  return (
    <group>
      {/* Clock body - same as target */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.2, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} transparent opacity={opacity} />
      </mesh>
      {/* Display */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.35, 0.15]} />
        <meshStandardMaterial 
          color="#001100" 
          emissive="#00ff00" 
          emissiveIntensity={emissive * 2}
          transparent 
          opacity={opacity} 
        />
      </mesh>
      {/* Wrong time text */}
      <Text
        position={[0, 0, 0.081]}
        fontSize={0.1}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        {decoy.displayValue}
      </Text>
    </group>
  )
}

function WrongPageDecoy({ decoy, opacity, emissive }: { decoy: Decoy; opacity: number; emissive: number }) {
  return (
    <group rotation={[-0.2, 0, 0]}>
      {/* Open book - same as target */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.85} transparent opacity={opacity} />
      </mesh>
      {/* Left page */}
      <mesh position={[-0.1, 0.03, 0]}>
        <planeGeometry args={[0.18, 0.28]} />
        <meshStandardMaterial 
          color="#FFFEF0" 
          roughness={0.95} 
          transparent 
          opacity={opacity}
          emissive="#ffe4b5"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* Right page */}
      <mesh position={[0.1, 0.03, 0]}>
        <planeGeometry args={[0.18, 0.28]} />
        <meshStandardMaterial 
          color="#FFFEF0" 
          roughness={0.95} 
          transparent 
          opacity={opacity}
          emissive="#ffe4b5"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* Wrong page number */}
      <Text
        position={[0.14, 0.031, -0.12]}
        fontSize={0.03}
        color="#333333"
        anchorX="right"
        anchorY="bottom"
      >
        {decoy.displayValue}
      </Text>
      {/* Some text lines */}
      {[-0.08, -0.04, 0, 0.04, 0.08].map((z, i) => (
        <mesh key={i} position={[0.1, 0.031, z]}>
          <planeGeometry args={[0.14, 0.015]} />
          <meshStandardMaterial color="#CCCCCC" transparent opacity={opacity * 0.5} />
        </mesh>
      ))}
    </group>
  )
}

function WrongNoteDecoy({ decoy, opacity, emissive }: { decoy: Decoy; opacity: number; emissive: number }) {
  return (
    <group>
      {/* Sticky note - same as target */}
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.15, 0.005]} />
        <meshStandardMaterial 
          color="#FFE66D" 
          roughness={0.9} 
          transparent 
          opacity={opacity}
          emissive="#FFE66D"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* Wrong number text */}
      <Text
        position={[0, 0, 0.003]}
        fontSize={0.07}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {decoy.displayValue}
      </Text>
    </group>
  )
}

function WrongPriceDecoy({ decoy, opacity, emissive }: { decoy: Decoy; opacity: number; emissive: number }) {
  return (
    <group>
      {/* Tag background - same as target */}
      <mesh castShadow>
        <boxGeometry args={[0.12, 0.08, 0.005]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          roughness={0.9} 
          transparent 
          opacity={opacity}
          emissive="#FFFFFF"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* String hole */}
      <mesh position={[-0.05, 0.03, 0]}>
        <circleGeometry args={[0.01, 8]} />
        <meshStandardMaterial color="#CCCCCC" transparent opacity={opacity} />
      </mesh>
      {/* Wrong price */}
      <Text
        position={[0.01, 0, 0.003]}
        fontSize={0.035}
        color="#FF4757"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {decoy.displayValue}
      </Text>
    </group>
  )
}

function WrongCalendarDecoy({ decoy, opacity, emissive }: { decoy: Decoy; opacity: number; emissive: number }) {
  // Parse displayValue to get month/day - e.g., "7/6" means July 6th
  const parts = decoy.displayValue.split('/')
  const highlightDay = parseInt(parts[1]) || 6
  const monthName = getMonthName(parseInt(parts[0]) || 7)
  
  return (
    <group>
      {/* Calendar body */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.5, 0.02]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          roughness={0.9} 
          transparent 
          opacity={opacity}
        />
      </mesh>
      {/* Header (month) */}
      <mesh position={[0, 0.2, 0.011]}>
        <boxGeometry args={[0.38, 0.08, 0.001]} />
        <meshStandardMaterial 
          color="#FF4757" 
          transparent 
          opacity={opacity}
          emissive="#FF4757"
          emissiveIntensity={emissive}
        />
      </mesh>
      <Text
        position={[0, 0.2, 0.012]}
        fontSize={0.04}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {monthName}
      </Text>
      {/* Day grid - highlight wrong day */}
      {[0, 1, 2, 3, 4, 5, 6].map((col) =>
        [0, 1, 2, 3, 4].map((row) => {
          const day = row * 7 + col + 1
          const isTarget = day === highlightDay
          return day <= 30 ? (
            <group key={`${row}-${col}`} position={[-0.15 + col * 0.05, 0.1 - row * 0.07, 0.011]}>
              {isTarget && (
                <mesh>
                  <circleGeometry args={[0.02, 16]} />
                  <meshStandardMaterial 
                    color="#4ECDC4" 
                    transparent 
                    opacity={opacity}
                    emissive="#4ECDC4"
                    emissiveIntensity={emissive * 2}
                  />
                </mesh>
              )}
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.02}
                color={isTarget ? "#FFFFFF" : "#333333"}
                anchorX="center"
                anchorY="middle"
              >
                {day}
              </Text>
            </group>
          ) : null
        })
      )}
    </group>
  )
}

function getMonthName(month: number): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return months[month - 1] || 'JULY'
}

function DefaultDecoy({ opacity }: { opacity: number }) {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.3, 0.3, 0.1]} />
      <meshStandardMaterial color="#888888" roughness={0.6} transparent opacity={opacity} />
    </mesh>
  )
}

