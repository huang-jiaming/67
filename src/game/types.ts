/**
 * types.ts - Core type definitions for the 67 Escape Room game
 * Defines all game entities, states, and configurations
 */

import { Vector3Tuple } from 'three'

/** Difficulty level affects hold time and decoy count */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** Current phase of the game - no more 'lost' or 'ending' since no timer */
export type GamePhase = 'name_entry' | 'menu' | 'playing' | 'paused' | 'won'

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

/** Decoy types - items that look like 67 but aren't */
export type DecoyType =
  | 'wrong_clock'        // Shows 7:06, 6:17, etc.
  | 'wrong_page'         // Page 76, 97, 167, etc.
  | 'wrong_note'         // Note with 76, 97, etc.
  | 'wrong_price'        // $7.60, $6.17, etc.
  | 'wrong_calendar'     // 7/6, 6/17, etc.

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

/** A decoy item that wastes player's time */
export interface Decoy {
  id: string
  type: DecoyType
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  revealed: boolean           // True after player selects it (wrong)
  displayValue: string        // What it shows (e.g., "76", "7:06")
  interactRadius: number
  holdSecondsRequired: number
}

/** Tool types available in the game - removed time-based tools */
export type ToolType = 'hint' | 'reveal'

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
  candidateTargets: Target[]      // Correct 67 items
  candidateDecoys: Decoy[]        // Wrong items (decoys)
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

/** Difficulty settings - score-based gameplay */
export interface DifficultySettings {
  holdSeconds: number       // Time to hold to confirm selection
  targetCount: number       // Number of targets to find
  decoyCount: number        // Number of decoys to spawn
}

/** Difficulty configurations */
export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    holdSeconds: 3,
    targetCount: 5,
    decoyCount: 2,          // Fewer decoys on easy
  },
  normal: {
    holdSeconds: 4,
    targetCount: 5,
    decoyCount: 4,          // Moderate decoys
  },
  hard: {
    holdSeconds: 5,
    targetCount: 5,
    decoyCount: 6,          // More decoys on hard
  },
}

/** Penalty seconds per wrong selection */
export const PENALTY_SECONDS = 10

/** Tool definitions - only hint and reveal remain */
export const TOOL_DEFINITIONS: Record<ToolType, Omit<Tool, 'id'>> = {
  hint: {
    type: 'hint',
    name: 'Hint',
    icon: '💡',
    description: 'Highlights the nearest unfound target for 5 seconds',
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

