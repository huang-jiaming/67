/**
 * RoomMesh.tsx - Room Geometry Component
 * Renders the walls, floor, and ceiling of a level
 */

import { useMemo } from 'react'
import * as THREE from 'three'
import { LevelConfig } from '../types'

interface RoomMeshProps {
  level: LevelConfig
}

/**
 * Renders the room geometry with walls, floor, and ceiling
 */
export function RoomMesh({ level }: RoomMeshProps) {
  const [width, height, depth] = level.roomSize
  const halfW = width / 2
  const halfD = depth / 2
  
  // Memoize materials for performance
  const materials = useMemo(() => ({
    floor: new THREE.MeshStandardMaterial({
      color: level.floorColor,
      roughness: 0.85,
      metalness: 0.05,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: level.ceilingColor,
      roughness: 0.95,
    }),
    wall: new THREE.MeshStandardMaterial({
      color: level.wallColor,
      roughness: 0.75,
      side: THREE.DoubleSide,
    }),
  }), [level.floorColor, level.ceilingColor, level.wallColor])
  
  return (
    <group name="room">
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        name="floor"
      >
        <planeGeometry args={[width, depth]} />
        <primitive object={materials.floor} attach="material" />
      </mesh>
      
      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
        name="ceiling"
      >
        <planeGeometry args={[width, depth]} />
        <primitive object={materials.ceiling} attach="material" />
      </mesh>
      
      {/* Back wall (North, -Z) */}
      <mesh
        position={[0, height / 2, -halfD]}
        receiveShadow
        name="wall_north"
      >
        <planeGeometry args={[width, height]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>
      
      {/* Front wall (South, +Z) */}
      <mesh
        position={[0, height / 2, halfD]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        name="wall_south"
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={level.wallColor}
          roughness={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Left wall (West, -X) */}
      <mesh
        position={[-halfW, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        name="wall_west"
      >
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color={level.wallColor}
          roughness={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Right wall (East, +X) */}
      <mesh
        position={[halfW, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        name="wall_east"
      >
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color={level.wallColor}
          roughness={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Baseboard trim for visual interest */}
      <mesh position={[0, 0.05, -halfD + 0.02]}>
        <boxGeometry args={[width, 0.1, 0.04]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, halfD - 0.02]}>
        <boxGeometry args={[width, 0.1, 0.04]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      <mesh position={[-halfW + 0.02, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.1, depth]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      <mesh position={[halfW - 0.02, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.1, depth]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
    </group>
  )
}

