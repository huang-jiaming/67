/**
 * types.ts - Core type definitions for the 67 Escape Room game
 * Defines all game entities, states, and configurations
 */

import { Vector3Tuple } from 'three'

/** Difficulty level affects timer, hold time, and target visibility */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** Current phase of the game */
export type GamePhase = 'menu' | 'playing' | 'paused' | 'won' | 'lost' | 'ending'

/** Types of "67" reference targets that can appear in the room */
export type TargetType =
  | 'digital_clock'      // Clock showing 6:07
  | 'book_page'          // Book opened to page 67
  | 'sticky_note'        // Sticky note with "67"
  | 'phone_poster'       // Poster with phone number containing 67
  | 'price_tag'          // Price tag showing $6.70
  | 'calendar'           // Calendar showing 6/7 date
  | 'keypad'             // Door keypad with 67 in code
  | 'angle_blocks'       // Two blocks forming "67" from specific angle
  | 'scoreboard'         // Scoreboard flashing "67"
  | 'tv_subtitle'        // TV showing "six seven" text

/** A "67" target that players must find */
export interface Target {
  id: string
  type: TargetType
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  found: boolean
  interactRadius: number       // Max distance for interaction
  holdSecondsRequired: number  // Time to hold to confirm
  vantageZone?: {              // For angle-based targets
    position: Vector3Tuple
    radius: number
  }
  hint?: string                // Optional hint text
}

/** Tool types available in the game */
export type ToolType = 'hint' | 'time_freeze' | 'time_add' | 'reveal'

/** A tool/powerup in player inventory */
export interface Tool {
  id: string
  type: ToolType
  name: string
  icon: string
  description: string
}

/** Configuration for a room/level */
export interface LevelConfig {
  id: string
  name: string
  description: string
  roomSize: Vector3Tuple          // Width, height, depth
  playerSpawn: Vector3Tuple       // Starting position
  playerRotation?: number         // Starting Y rotation
  wallColor: string
  floorColor: string
  ceilingColor: string
  accentColor: string
  props: PropConfig[]             // Static decorative props
  candidateTargets: Target[]      // All possible target placements
  chestPosition: Vector3Tuple     // Tool chest location
  toolSpawnChance: number         // 0-1, chance of each tool spawning
  ambientLight: number            // Ambient light intensity
  theme: 'bedroom' | 'living_room' | 'office' | 'classroom'
}

/** A decorative prop in the room */
export interface PropConfig {
  id: string
  type: 'table' | 'chair' | 'shelf' | 'lamp' | 'plant' | 'box' | 'couch' | 'desk' | 'bed' | 'wardrobe' | 'bookshelf' | 'tv_stand' | 'rug'
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  color?: string
}

/** Difficulty settings */
export interface DifficultySettings {
  timerSeconds: number
  holdSeconds: number
  targetCount: number
  toolSpawnMultiplier: number
}

/** Difficulty configurations */
export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    timerSeconds: 90,
    holdSeconds: 3,
    targetCount: 5,
    toolSpawnMultiplier: 1.5,
  },
  normal: {
    timerSeconds: 60,
    holdSeconds: 5,
    targetCount: 5,
    toolSpawnMultiplier: 1.0,
  },
  hard: {
    timerSeconds: 45,
    holdSeconds: 5,
    targetCount: 5,
    toolSpawnMultiplier: 0.5,
  },
}

/** Tool definitions */
export const TOOL_DEFINITIONS: Record<ToolType, Omit<Tool, 'id'>> = {
  hint: {
    type: 'hint',
    name: 'Hint',
    icon: '💡',
    description: 'Highlights the nearest unfound target for 5 seconds',
  },
  time_freeze: {
    type: 'time_freeze',
    name: 'Time Freeze',
    icon: '❄️',
    description: 'Pauses the timer for 5 seconds',
  },
  time_add: {
    type: 'time_add',
    name: 'Time Add',
    icon: '⏰',
    description: 'Adds 10 seconds to the timer',
  },
  reveal: {
    type: 'reveal',
    name: 'Reveal',
    icon: '🔍',
    description: 'Shows the count and direction of unfound targets',
  },
}

/** Network message types for future multiplayer */
export type NetMessageType =
  | 'player_join'
  | 'player_leave'
  | 'target_found'
  | 'tool_used'
  | 'game_start'
  | 'game_end'
  | 'sync_state'

/** Base network message structure */
export interface NetMessage {
  type: NetMessageType
  playerId: string
  timestamp: number
  payload: unknown
}

/** Player info for multiplayer */
export interface PlayerInfo {
  id: string
  name: string
  color: string
  targetsFound: number
}

/** Quadrant directions for reveal tool */
export type Quadrant = 'north' | 'south' | 'east' | 'west' | 'center'

/** Toast notification */
export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
  duration?: number
}

