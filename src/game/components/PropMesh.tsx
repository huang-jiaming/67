/**
 * PropMesh.tsx - Decorative Prop Component
 * Renders furniture and decorations based on prop type
 * Uses blocky, low-poly aesthetic for Minecraft/Roblox feel
 */

import * as THREE from 'three'
import { PropConfig } from '../types'

interface PropMeshProps {
  prop: PropConfig
}

/**
 * Renders a decorative prop mesh
 */
export function PropMesh({ prop }: PropMeshProps) {
  const position = prop.position
  const rotation = prop.rotation || [0, 0, 0]
  const scale = prop.scale || [1, 1, 1]
  const color = prop.color || '#808080'
  
  // Render different prop types
  switch (prop.type) {
    case 'bed':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Frame */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.4, 3]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.8, 0.3, 2.8]} />
            <meshStandardMaterial color="#E8E8E8" roughness={0.9} />
          </mesh>
          {/* Pillow */}
          <mesh position={[0, 0.8, -1]} castShadow>
            <boxGeometry args={[1.4, 0.2, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, 0.8, -1.5]} castShadow>
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial color="#4A3728" roughness={0.7} />
          </mesh>
          {/* Blanket */}
          <mesh position={[0, 0.72, 0.3]} castShadow>
            <boxGeometry args={[1.7, 0.1, 1.8]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
        </group>
      )
    
    case 'desk':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Desktop */}
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.1, 0.8]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* Legs */}
          {[[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.4, z]} castShadow>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )
    
    case 'chair':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Seat */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.5, 0.1, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.8, -0.2]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.1]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* Legs */}
          {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.25, z]} castShadow>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )
    
    case 'bookshelf':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Main body */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[0.4, 2.5, 1.5]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Shelves */}
          {[0.5, 1.1, 1.7, 2.3].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.38, 0.05, 1.48]} />
              <meshStandardMaterial color="#3D2914" roughness={0.8} />
            </mesh>
          ))}
          {/* Books */}
          <BookRow y={0.75} />
          <BookRow y={1.35} />
          <BookRow y={1.95} />
        </group>
      )
    
    case 'wardrobe':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[0.6, 2.2, 1.5]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          {/* Door line */}
          <mesh position={[0.31, 1.1, 0]}>
            <boxGeometry args={[0.02, 2, 0.02]} />
            <meshStandardMaterial color="#2F1F0F" />
          </mesh>
          {/* Handles */}
          <mesh position={[0.33, 1.2, -0.2]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.33, 1.2, 0.2]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )
    
    case 'couch':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Base */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[3, 0.5, 1]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.65, -0.35]} castShadow>
            <boxGeometry args={[3, 0.8, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {/* Armrests */}
          <mesh position={[-1.35, 0.45, 0]} castShadow>
            <boxGeometry args={[0.3, 0.6, 1]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          <mesh position={[1.35, 0.45, 0]} castShadow>
            <boxGeometry args={[0.3, 0.6, 1]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {/* Cushions */}
          {[-0.95, 0, 0.95].map((x, i) => (
            <mesh key={i} position={[x, 0.58, 0.05]} castShadow>
              <boxGeometry args={[0.9, 0.15, 0.8]} />
              <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0, 0.1).getStyle()} roughness={0.9} />
            </mesh>
          ))}
        </group>
      )
    
    case 'table':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Top */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.1, 0.8]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* Legs */}
          {[[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.25, z]} castShadow>
              <boxGeometry args={[0.1, 0.5, 0.1]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )
    
    case 'tv_stand':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Cabinet */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[2.5, 0.6, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {/* TV */}
          <mesh position={[0, 1.2, -0.15]} castShadow>
            <boxGeometry args={[2, 1.2, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 1.2, -0.08]}>
            <boxGeometry args={[1.85, 1.05, 0.02]} />
            <meshStandardMaterial color="#222233" emissive="#111122" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )
    
    case 'lamp':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Base */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 8]} />
            <meshStandardMaterial color="#2F2F2F" roughness={0.6} />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Shade */}
          <mesh position={[0, 1.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.25, 0.3, 8, 1, true]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.3} />
          </mesh>
          {/* Light glow */}
          <pointLight position={[0, 1.3, 0]} intensity={0.3} color={color} distance={3} />
        </group>
      )
    
    case 'plant':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {/* Pot */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
            <meshStandardMaterial color="#3D2914" roughness={1} />
          </mesh>
          {/* Leaves */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i / 5) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.1,
                  0.5 + Math.sin(i * 1.5) * 0.1,
                  Math.sin(angle) * 0.1
                ]}
                rotation={[
                  Math.random() * 0.3 - 0.15,
                  angle,
                  Math.random() * 0.5 - 0.25
                ]}
                castShadow
              >
                <boxGeometry args={[0.15, 0.4, 0.05]} />
                <meshStandardMaterial color={color || '#228B22'} roughness={0.8} />
              </mesh>
            )
          })}
        </group>
      )
    
    case 'rug':
      return (
        <group position={position} rotation={rotation}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow scale={scale}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={color} roughness={0.98} />
          </mesh>
          {/* Pattern detail */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} scale={[scale[0] * 0.8, 1, scale[2] * 0.8]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0.05, 0, -0.1).getStyle()} roughness={0.98} />
          </mesh>
        </group>
      )
    
    default:
      // Fallback: simple box
      return (
        <mesh position={position} rotation={rotation} scale={scale} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      )
  }
}

/** Helper component for book rows on shelves */
function BookRow({ y }: { y: number }) {
  const colors = ['#8B0000', '#00008B', '#006400', '#4B0082', '#FF8C00']
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.05, y, -0.5 + i * 0.35]}>
          <boxGeometry args={[0.25, 0.4, 0.12]} />
          <meshStandardMaterial color={colors[i % 5]} roughness={0.85} />
        </mesh>
      ))}
    </>
  )
}

