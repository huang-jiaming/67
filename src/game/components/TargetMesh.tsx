/**
 * TargetMesh.tsx - 67 Target Visualization
 * Renders the different types of "67" targets players must find
 * Each target type has a unique visual representation
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Target } from '../types'
import { Text } from '@react-three/drei'

interface TargetMeshProps {
  target: Target
}

/**
 * Renders a "67" target based on its type
 * When found, the target becomes semi-transparent/grayed
 */
export function TargetMesh({ target }: TargetMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const position = target.position
  const rotation = target.rotation || [0, 0, 0]
  const scale = target.scale || [1, 1, 1]
  
  // Subtle animation for unfound targets
  useFrame((state) => {
    if (groupRef.current && !target.found) {
      // Gentle glow pulse
      const t = state.clock.elapsedTime
      const pulse = Math.sin(t * 2) * 0.03 + 1
      groupRef.current.scale.setScalar(pulse)
    }
  })
  
  // Base opacity based on found state
  const opacity = target.found ? 0.3 : 1
  const emissiveIntensity = target.found ? 0 : 0.2
  
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ targetId: target.id, isTarget: true }}
    >
      {renderTargetType(target, opacity, emissiveIntensity)}
      
      {/* Found checkmark overlay */}
      {target.found && (
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="#7bed9f" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Renders the specific target type visualization
 */
function renderTargetType(target: Target, opacity: number, emissiveIntensity: number) {
  switch (target.type) {
    case 'digital_clock':
      return <DigitalClockTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'book_page':
      return <BookPageTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'sticky_note':
      return <StickyNoteTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'phone_poster':
      return <PhonePosterTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'price_tag':
      return <PriceTagTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'calendar':
      return <CalendarTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'keypad':
      return <KeypadTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'angle_blocks':
      return <AngleBlocksTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'scoreboard':
      return <ScoreboardTarget opacity={opacity} emissive={emissiveIntensity} />
    case 'tv_subtitle':
      return <TVSubtitleTarget opacity={opacity} emissive={emissiveIntensity} />
    default:
      return <DefaultTarget opacity={opacity} />
  }
}

// Target type components

function DigitalClockTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* Clock body */}
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
      {/* Time text: 6:07 */}
      <Text
        position={[0, 0, 0.081]}
        fontSize={0.1}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        6:07
      </Text>
    </group>
  )
}

function BookPageTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group rotation={[-0.2, 0, 0]}>
      {/* Open book */}
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
      {/* Right page with "67" */}
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
      {/* Page number */}
      <Text
        position={[0.14, 0.031, -0.12]}
        fontSize={0.03}
        color="#333333"
        anchorX="right"
        anchorY="bottom"
      >
        67
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

function StickyNoteTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* Sticky note */}
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
      {/* 67 text */}
      <Text
        position={[0, 0, 0.003]}
        fontSize={0.08}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        67
      </Text>
    </group>
  )
}

function PhonePosterTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* Poster background */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.7, 0.02]} />
        <meshStandardMaterial 
          color="#FF6B35" 
          roughness={0.8} 
          transparent 
          opacity={opacity}
          emissive="#FF6B35"
          emissiveIntensity={emissive * 0.5}
        />
      </mesh>
      {/* Title */}
      <Text
        position={[0, 0.25, 0.011]}
        fontSize={0.06}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        CALL NOW!
      </Text>
      {/* Phone number with 67 */}
      <Text
        position={[0, 0.1, 0.011]}
        fontSize={0.05}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        555-067-1234
      </Text>
      {/* Some decoration */}
      <mesh position={[0, -0.15, 0.011]}>
        <boxGeometry args={[0.4, 0.2, 0.001]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={opacity * 0.3} />
      </mesh>
    </group>
  )
}

function PriceTagTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* Tag background */}
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
      {/* Price */}
      <Text
        position={[0.01, 0, 0.003]}
        fontSize={0.04}
        color="#FF4757"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        $6.70
      </Text>
    </group>
  )
}

function CalendarTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
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
        JUNE
      </Text>
      {/* Day grid - highlight 7 */}
      {[0, 1, 2, 3, 4, 5, 6].map((col) =>
        [0, 1, 2, 3, 4].map((row) => {
          const day = row * 7 + col + 1
          const isTarget = day === 7
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

function KeypadTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* Keypad body */}
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.25, 0.03]} />
        <meshStandardMaterial 
          color="#2F2F2F" 
          roughness={0.6} 
          transparent 
          opacity={opacity}
        />
      </mesh>
      {/* Display showing 67 */}
      <mesh position={[0, 0.08, 0.016]}>
        <boxGeometry args={[0.12, 0.04, 0.002]} />
        <meshStandardMaterial 
          color="#001100" 
          emissive="#00FF00" 
          emissiveIntensity={emissive * 2}
          transparent 
          opacity={opacity}
        />
      </mesh>
      <Text
        position={[0, 0.08, 0.018]}
        fontSize={0.025}
        color="#00FF00"
        anchorX="center"
        anchorY="middle"
      >
        ** 67 **
      </Text>
      {/* Number buttons */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const x = -0.035 + col * 0.035
        const y = 0.02 - row * 0.04
        const isHighlight = num === 6 || num === 7
        return (
          <group key={num} position={[i === 9 ? 0 : x, i === 9 ? y - 0.04 : y, 0.016]}>
            <mesh>
              <boxGeometry args={[0.025, 0.025, 0.005]} />
              <meshStandardMaterial 
                color={isHighlight ? "#4ECDC4" : "#4A4A4A"} 
                transparent 
                opacity={opacity}
                emissive={isHighlight ? "#4ECDC4" : "#000000"}
                emissiveIntensity={isHighlight ? emissive * 2 : 0}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function AngleBlocksTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* Block "6" */}
      <mesh position={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial 
          color="#FF6B35" 
          roughness={0.7} 
          transparent 
          opacity={opacity}
          emissive="#FF6B35"
          emissiveIntensity={emissive}
        />
      </mesh>
      <Text
        position={[-0.15, 0, 0.101]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        6
      </Text>
      {/* Block "7" */}
      <mesh position={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial 
          color="#4ECDC4" 
          roughness={0.7} 
          transparent 
          opacity={opacity}
          emissive="#4ECDC4"
          emissiveIntensity={emissive}
        />
      </mesh>
      <Text
        position={[0.15, 0, 0.101]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        7
      </Text>
    </group>
  )
}

function ScoreboardTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  const ref = useRef<THREE.Mesh>(null)
  
  // Flash animation
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      const flash = Math.sin(t * 3) > 0.5 ? 1 : 0.5
      const material = ref.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = flash * emissive * 3
    }
  })
  
  return (
    <group>
      {/* Scoreboard background */}
      <mesh ref={ref} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.03]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.3} 
          transparent 
          opacity={opacity}
          emissive="#FF6B35"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* Score display */}
      <Text
        position={[0, 0, 0.016]}
        fontSize={0.15}
        color="#FF6B35"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        67
      </Text>
      {/* Label */}
      <Text
        position={[0, 0.1, 0.016]}
        fontSize={0.03}
        color="#AAAAAA"
        anchorX="center"
        anchorY="middle"
      >
        HIGH SCORE
      </Text>
    </group>
  )
}

function TVSubtitleTarget({ opacity, emissive }: { opacity: number; emissive: number }) {
  return (
    <group>
      {/* TV screen area */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial 
          color="#222233" 
          roughness={0.3} 
          transparent 
          opacity={opacity}
          emissive="#222244"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* Subtitle bar */}
      <mesh position={[0, -0.15, 0.011]}>
        <boxGeometry args={[0.7, 0.1, 0.001]} />
        <meshStandardMaterial color="#000000" transparent opacity={opacity * 0.8} />
      </mesh>
      {/* Subtitle text */}
      <Text
        position={[0, -0.15, 0.012]}
        fontSize={0.04}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        "...six seven..."
      </Text>
      {/* Static lines for TV effect */}
      {[0.1, 0.05, 0, -0.05].map((y, i) => (
        <mesh key={i} position={[0, y, 0.011]}>
          <boxGeometry args={[0.6 + Math.random() * 0.1, 0.02, 0.001]} />
          <meshStandardMaterial 
            color="#AAAAAA" 
            transparent 
            opacity={opacity * 0.2} 
          />
        </mesh>
      ))}
    </group>
  )
}

function DefaultTarget({ opacity }: { opacity: number }) {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.3, 0.3, 0.1]} />
      <meshStandardMaterial color="#FF6B35" roughness={0.6} transparent opacity={opacity} />
    </mesh>
  )
}

