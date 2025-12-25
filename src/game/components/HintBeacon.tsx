/**
 * HintBeacon.tsx - Floating Beacon for Hint Tool
 * Displays a visible beacon above a target when hint is active
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Vector3Tuple } from 'three'

interface HintBeaconProps {
  position: Vector3Tuple
}

/**
 * Animated beacon that floats above a hinted target
 * Visible through walls via high emissive
 */
export function HintBeacon({ position }: HintBeaconProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      
      // Float up and down
      groupRef.current.position.y = Math.sin(t * 3) * 0.2 + 1.5
      
      // Rotate
      groupRef.current.rotation.y = t * 2
    }
    
    if (ringRef.current) {
      const t = state.clock.elapsedTime
      // Pulse scale
      const scale = 1 + Math.sin(t * 4) * 0.2
      ringRef.current.scale.set(scale, scale, 1)
    }
  })
  
  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Central diamond */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color="#4ECDC4"
            emissive="#4ECDC4"
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Rotating ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.03, 8, 24]} />
          <meshStandardMaterial
            color="#FFE66D"
            emissive="#FFE66D"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Light */}
        <pointLight
          intensity={1}
          color="#4ECDC4"
          distance={5}
        />
        
        {/* Arrow pointing down */}
        <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial
            color="#FF6B35"
            emissive="#FF6B35"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
      
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshStandardMaterial
          color="#4ECDC4"
          emissive="#4ECDC4"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

