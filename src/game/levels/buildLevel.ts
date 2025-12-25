/**
 * buildLevel.ts - Level Building Utilities
 * Instantiates 3D meshes and components from level configuration
 * Handles procedural generation of room geometry
 */

import * as THREE from 'three'
import { LevelConfig, PropConfig, Target } from '../types'

/**
 * Creates room geometry (walls, floor, ceiling) from level config
 */
export function buildRoomGeometry(level: LevelConfig): THREE.Group {
  const group = new THREE.Group()
  const [width, height, depth] = level.roomSize
  const halfW = width / 2
  const halfD = depth / 2
  
  // Floor
  const floorGeo = new THREE.PlaneGeometry(width, depth)
  const floorMat = new THREE.MeshStandardMaterial({
    color: level.floorColor,
    roughness: 0.8,
    metalness: 0.1,
  })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  floor.name = 'floor'
  group.add(floor)
  
  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(width, depth)
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: level.ceilingColor,
    roughness: 0.9,
  })
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = height
  ceiling.name = 'ceiling'
  group.add(ceiling)
  
  // Walls (as simple planes for performance)
  const wallMat = new THREE.MeshStandardMaterial({
    color: level.wallColor,
    roughness: 0.7,
    side: THREE.DoubleSide,
  })
  
  // Back wall (north, -Z)
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    wallMat
  )
  backWall.position.set(0, height / 2, -halfD)
  backWall.receiveShadow = true
  backWall.name = 'wall_north'
  group.add(backWall)
  
  // Front wall (south, +Z)
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    wallMat.clone()
  )
  frontWall.position.set(0, height / 2, halfD)
  frontWall.rotation.y = Math.PI
  frontWall.receiveShadow = true
  frontWall.name = 'wall_south'
  group.add(frontWall)
  
  // Left wall (west, -X)
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(depth, height),
    wallMat.clone()
  )
  leftWall.position.set(-halfW, height / 2, 0)
  leftWall.rotation.y = Math.PI / 2
  leftWall.receiveShadow = true
  leftWall.name = 'wall_west'
  group.add(leftWall)
  
  // Right wall (east, +X)
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(depth, height),
    wallMat.clone()
  )
  rightWall.position.set(halfW, height / 2, 0)
  rightWall.rotation.y = -Math.PI / 2
  rightWall.receiveShadow = true
  rightWall.name = 'wall_east'
  group.add(rightWall)
  
  return group
}

/**
 * Creates a prop mesh based on type
 * Uses simple blocky geometry for Minecraft/Roblox aesthetic
 */
export function buildProp(prop: PropConfig): THREE.Group {
  const group = new THREE.Group()
  group.name = `prop_${prop.id}`
  
  const color = prop.color || '#808080'
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.1,
  })
  
  switch (prop.type) {
    case 'bed': {
      // Bed frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.4, 3),
        new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.8 })
      )
      frame.position.y = 0.2
      frame.castShadow = true
      group.add(frame)
      
      // Mattress
      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.3, 2.8),
        new THREE.MeshStandardMaterial({ color: '#E8E8E8', roughness: 0.9 })
      )
      mattress.position.y = 0.55
      mattress.castShadow = true
      group.add(mattress)
      
      // Pillow
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.2, 0.5),
        mat
      )
      pillow.position.set(0, 0.8, -1)
      pillow.castShadow = true
      group.add(pillow)
      
      // Headboard
      const headboard = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 0.2),
        new THREE.MeshStandardMaterial({ color: '#4A3728', roughness: 0.7 })
      )
      headboard.position.set(0, 0.8, -1.5)
      headboard.castShadow = true
      group.add(headboard)
      break
    }
    
    case 'desk': {
      // Desktop
      const desktop = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 0.8),
        mat
      )
      desktop.position.y = 0.8
      desktop.castShadow = true
      desktop.receiveShadow = true
      group.add(desktop)
      
      // Legs
      const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1)
      const legMat = mat.clone()
      const positions = [
        [-0.65, 0.4, -0.3],
        [0.65, 0.4, -0.3],
        [-0.65, 0.4, 0.3],
        [0.65, 0.4, 0.3],
      ]
      positions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, legMat)
        leg.position.set(x, y, z)
        leg.castShadow = true
        group.add(leg)
      })
      break
    }
    
    case 'chair': {
      // Seat
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.1, 0.5),
        mat
      )
      seat.position.y = 0.5
      seat.castShadow = true
      group.add(seat)
      
      // Back
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.1),
        mat
      )
      back.position.set(0, 0.8, -0.2)
      back.castShadow = true
      group.add(back)
      
      // Legs
      const legGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08)
      const positions = [
        [-0.18, 0.25, -0.18],
        [0.18, 0.25, -0.18],
        [-0.18, 0.25, 0.18],
        [0.18, 0.25, 0.18],
      ]
      positions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, mat)
        leg.position.set(x, y, z)
        leg.castShadow = true
        group.add(leg)
      })
      break
    }
    
    case 'bookshelf': {
      // Main body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 2.5, 1.5),
        mat
      )
      body.position.y = 1.25
      body.castShadow = true
      group.add(body)
      
      // Shelves (darker lines)
      const shelfMat = new THREE.MeshStandardMaterial({ color: '#3D2914' })
      for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.05, 1.48),
          shelfMat
        )
        shelf.position.set(0, 0.5 + i * 0.6, 0)
        group.add(shelf)
      }
      
      // Some book spines
      const bookColors = ['#8B0000', '#00008B', '#006400', '#4B0082', '#FF8C00']
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 4; i++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.4, 0.1 + Math.random() * 0.1),
            new THREE.MeshStandardMaterial({ color: bookColors[(row + i) % 5] })
          )
          book.position.set(0.05, 0.75 + row * 0.6, -0.5 + i * 0.35)
          group.add(book)
        }
      }
      break
    }
    
    case 'wardrobe': {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 2.2, 1.5),
        mat
      )
      body.position.y = 1.1
      body.castShadow = true
      group.add(body)
      
      // Door line
      const doorLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 2, 0.02),
        new THREE.MeshStandardMaterial({ color: '#2F1F0F' })
      )
      doorLine.position.set(0.31, 1.1, 0)
      group.add(doorLine)
      
      // Handles
      const handleMat = new THREE.MeshStandardMaterial({ color: '#C0C0C0', metalness: 0.8 })
      const handle1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), handleMat)
      handle1.position.set(0.33, 1.2, -0.2)
      group.add(handle1)
      const handle2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), handleMat)
      handle2.position.set(0.33, 1.2, 0.2)
      group.add(handle2)
      break
    }
    
    case 'couch': {
      // Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.5, 1),
        mat
      )
      base.position.y = 0.25
      base.castShadow = true
      group.add(base)
      
      // Back
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.8, 0.3),
        mat
      )
      back.position.set(0, 0.65, -0.35)
      back.castShadow = true
      group.add(back)
      
      // Armrests
      const armMat = mat.clone()
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1), armMat)
      armL.position.set(-1.35, 0.45, 0)
      armL.castShadow = true
      group.add(armL)
      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1), armMat)
      armR.position.set(1.35, 0.45, 0)
      armR.castShadow = true
      group.add(armR)
      
      // Cushions
      const cushionMat = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color).offsetHSL(0, 0, 0.1).getHex()
      })
      for (let i = -1; i <= 1; i++) {
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.8), cushionMat)
        cushion.position.set(i * 0.95, 0.58, 0.05)
        cushion.castShadow = true
        group.add(cushion)
      }
      break
    }
    
    case 'table': {
      // Top
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.1, 0.8),
        mat
      )
      top.position.y = 0.5
      top.castShadow = true
      top.receiveShadow = true
      group.add(top)
      
      // Legs
      const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1)
      const positions = [
        [-0.5, 0.25, -0.3],
        [0.5, 0.25, -0.3],
        [-0.5, 0.25, 0.3],
        [0.5, 0.25, 0.3],
      ]
      positions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, mat)
        leg.position.set(x, y, z)
        leg.castShadow = true
        group.add(leg)
      })
      break
    }
    
    case 'tv_stand': {
      // Cabinet
      const cabinet = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.6, 0.5),
        mat
      )
      cabinet.position.y = 0.3
      cabinet.castShadow = true
      group.add(cabinet)
      
      // TV
      const tvMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a' })
      const tv = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 0.1), tvMat)
      tv.position.set(0, 1.2, -0.15)
      tv.castShadow = true
      group.add(tv)
      
      // Screen
      const screenMat = new THREE.MeshStandardMaterial({ 
        color: '#333333',
        emissive: '#111122',
        emissiveIntensity: 0.2,
      })
      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.05, 0.02), screenMat)
      screen.position.set(0, 1.2, -0.08)
      group.add(screen)
      break
    }
    
    case 'lamp': {
      // Base
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: '#2F2F2F' })
      )
      base.position.y = 0.05
      group.add(base)
      
      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: '#C0C0C0', metalness: 0.7 })
      )
      pole.position.y = 0.7
      group.add(pole)
      
      // Shade
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.3, 8, 1, true),
        new THREE.MeshStandardMaterial({ 
          color: color,
          side: THREE.DoubleSide,
          emissive: color,
          emissiveIntensity: 0.3,
        })
      )
      shade.rotation.x = Math.PI
      shade.position.y = 1.4
      group.add(shade)
      break
    }
    
    case 'plant': {
      // Pot
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: '#8B4513' })
      )
      pot.position.y = 0.15
      pot.castShadow = true
      group.add(pot)
      
      // Soil
      const soil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8),
        new THREE.MeshStandardMaterial({ color: '#3D2914' })
      )
      soil.position.y = 0.3
      group.add(soil)
      
      // Leaves (simple blocky)
      const leafMat = new THREE.MeshStandardMaterial({ color: color || '#228B22' })
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.4, 0.05),
          leafMat
        )
        const angle = (i / 5) * Math.PI * 2
        leaf.position.set(
          Math.cos(angle) * 0.1,
          0.5 + Math.random() * 0.2,
          Math.sin(angle) * 0.1
        )
        leaf.rotation.set(
          Math.random() * 0.3 - 0.15,
          angle,
          Math.random() * 0.5 - 0.25
        )
        leaf.castShadow = true
        group.add(leaf)
      }
      break
    }
    
    case 'rug': {
      const rug = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({ 
          color,
          roughness: 0.95,
        })
      )
      rug.rotation.x = -Math.PI / 2
      rug.receiveShadow = true
      group.add(rug)
      break
    }
    
    case 'box': {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        mat
      )
      box.position.y = 0.25
      box.castShadow = true
      group.add(box)
      break
    }
    
    default: {
      // Fallback cube
      const fallback = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        mat
      )
      fallback.position.y = 0.25
      fallback.castShadow = true
      group.add(fallback)
    }
  }
  
  // Apply position, rotation, scale
  group.position.set(...prop.position)
  if (prop.rotation) {
    group.rotation.set(...prop.rotation)
  }
  if (prop.scale) {
    group.scale.set(...prop.scale)
  }
  
  return group
}

/**
 * Calculates bounding box for collision detection
 */
export function getPropBoundingBox(prop: PropConfig): THREE.Box3 {
  const group = buildProp(prop)
  const box = new THREE.Box3().setFromObject(group)
  return box
}

/**
 * Helper to check if target should be visible based on vantage zone
 */
export function isInVantageZone(
  playerPos: THREE.Vector3,
  target: Target
): boolean {
  if (!target.vantageZone) return true
  
  const vantage = new THREE.Vector3(...target.vantageZone.position)
  const distance = playerPos.distanceTo(vantage)
  return distance <= target.vantageZone.radius
}

