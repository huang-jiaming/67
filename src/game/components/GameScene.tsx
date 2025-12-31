/**
 * GameScene.tsx - Main 3D Scene Component
 * Renders the room, props, targets, decoys, and player
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LevelConfig } from '../types'
import { useGameStore, useGamePhase, useTargets, useDecoys, useHintedTargetId } from '../state'
import { PlayerController } from './PlayerController'
import { InteractRaycaster } from './InteractRaycaster'
import { RoomMesh } from './RoomMesh'
import { TargetMesh } from './TargetMesh'
import { DecoyMesh } from './DecoyMesh'
import { PropMesh } from './PropMesh'
import { Chest } from './Chest'
import { HintBeacon } from './HintBeacon'

interface GameSceneProps {
  level: LevelConfig
}

/**
 * Main game scene containing all 3D elements
 */
export function GameScene({ level }: GameSceneProps) {
  const phase = useGamePhase()
  const targets = useTargets()
  const decoys = useDecoys()
  const hintedTargetId = useHintedTargetId()
  const tick = useGameStore((s) => s.tick)
  
  // Reference to the collision group for raycasting
  const targetGroupRef = useRef<THREE.Group>(null)
  const chestRef = useRef<THREE.Group>(null)
  
  // Game loop - update timer
  useFrame((_, delta) => {
    if (phase === 'playing') {
      tick(delta)
    }
  })
  
  // Find hinted target position
  const hintedTarget = useMemo(() => {
    if (!hintedTargetId) return null
    return targets.find(t => t.id === hintedTargetId)
  }, [hintedTargetId, targets])
  
  return (
    <>
      {/* Lighting - bright and kid-friendly */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fff5e6" />
      <hemisphereLight args={['#87CEEB', '#DEB887', 0.4]} />
      
      {/* Fog for atmosphere - light fog for depth without obscuring */}
      <fog attach="fog" args={['#a8c0d0', 20, 50]} />
      
      {/* Room geometry */}
      <RoomMesh level={level} />
      
      {/* Props */}
      {level.props.map((prop) => (
        <PropMesh key={prop.id} prop={prop} />
      ))}
      
      {/* Targets */}
      <group ref={targetGroupRef}>
        {targets.map((target) => (
          <TargetMesh key={target.id} target={target} />
        ))}
      </group>
      
      {/* Decoys */}
      <group>
        {decoys.map((decoy) => (
          <DecoyMesh key={decoy.id} decoy={decoy} />
        ))}
      </group>
      
      {/* Tool Chest */}
      <group ref={chestRef}>
        <Chest position={level.chestPosition} />
      </group>
      
      {/* Hint Beacon */}
      {hintedTarget && !hintedTarget.found && (
        <HintBeacon position={hintedTarget.position} />
      )}
      
      {/* Player Controller */}
      <PlayerController
        spawnPosition={level.playerSpawn}
        spawnRotation={level.playerRotation}
        roomSize={level.roomSize}
      />
      
      {/* Interact Raycaster */}
      <InteractRaycaster
        targetGroup={targetGroupRef}
        chestRef={chestRef}
        chestPosition={level.chestPosition}
      />
    </>
  )
}
