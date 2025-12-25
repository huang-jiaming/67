/**
 * levelConfigs.ts - Level/Room Configuration Data
 * Defines 3+ unique rooms with different layouts and target placements
 * Each room has candidate targets from which 5 are randomly selected per run
 */

import { LevelConfig } from '../types'

/**
 * Level 1: Kid's Bedroom
 * Bright, colorful room with toys and furniture
 */
const LEVEL_BEDROOM: LevelConfig = {
  id: 'bedroom_01',
  name: 'Cozy Bedroom',
  description: 'Find the hidden 67s in this cozy bedroom!',
  roomSize: [12, 4, 12],
  playerSpawn: [0, 1.5, 4],
  playerRotation: Math.PI,
  wallColor: '#87CEEB', // Sky blue
  floorColor: '#DEB887', // Burlywood (wooden floor)
  ceilingColor: '#FFFAF0', // Floral white
  accentColor: '#FF6B35',
  theme: 'bedroom',
  chestPosition: [-4, 0.5, -4],
  toolSpawnChance: 0.4,
  ambientLight: 0.6,
  
  props: [
    { id: 'bed', type: 'bed', position: [-3, 0, -4], rotation: [0, 0, 0], color: '#4169E1' },
    { id: 'desk', type: 'desk', position: [4, 0, -4], color: '#8B4513' },
    { id: 'chair', type: 'chair', position: [4, 0, -2.5], rotation: [0, Math.PI, 0], color: '#CD853F' },
    { id: 'wardrobe', type: 'wardrobe', position: [5, 0, 0], rotation: [0, -Math.PI/2, 0], color: '#A0522D' },
    { id: 'bookshelf', type: 'bookshelf', position: [-5, 0, 0], rotation: [0, Math.PI/2, 0], color: '#8B4513' },
    { id: 'rug', type: 'rug', position: [0, 0.01, 0], scale: [4, 1, 3], color: '#FF7F50' },
    { id: 'lamp', type: 'lamp', position: [4.5, 1, -4.5], color: '#FFD700' },
    { id: 'plant', type: 'plant', position: [-5, 0, 4], color: '#228B22' },
  ],
  
  candidateTargets: [
    // Digital clock on desk showing 6:07
    {
      id: 'clock_desk',
      type: 'digital_clock',
      position: [4, 1.2, -4.5],
      rotation: [0, Math.PI * 0.75, 0],
      found: false,
      interactRadius: 3,
      holdSecondsRequired: 5,
      hint: 'Check the time on the desk...',
    },
    // Book on shelf opened to page 67
    {
      id: 'book_shelf',
      type: 'book_page',
      position: [-5.3, 1.5, 1],
      rotation: [0, Math.PI/2, 0],
      found: false,
      interactRadius: 2.5,
      holdSecondsRequired: 5,
      hint: 'Someone left a book open...',
    },
    // Sticky note on wardrobe
    {
      id: 'sticky_wardrobe',
      type: 'sticky_note',
      position: [5.4, 1.8, 0.5],
      rotation: [0, -Math.PI/2, 0],
      found: false,
      interactRadius: 2.5,
      holdSecondsRequired: 5,
      hint: 'There\'s a note on the wardrobe...',
    },
    // Price tag on a toy
    {
      id: 'price_toy',
      type: 'price_tag',
      position: [-3, 0.4, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      hint: 'Check the price of that toy...',
    },
    // Calendar on wall showing 6/7
    {
      id: 'calendar_wall',
      type: 'calendar',
      position: [0, 2.5, -5.8],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 4,
      holdSecondsRequired: 5,
      hint: 'What date is on the calendar?',
    },
    // Poster with phone number
    {
      id: 'poster_wall',
      type: 'phone_poster',
      position: [3, 2.2, -5.8],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 4,
      holdSecondsRequired: 5,
      hint: 'That poster has a phone number...',
    },
    // Angle-based blocks near the rug
    {
      id: 'angle_blocks',
      type: 'angle_blocks',
      position: [1, 0.3, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      vantageZone: {
        position: [1, 1.5, 3],
        radius: 1.5,
      },
      hint: 'Look at those blocks from a different angle...',
    },
    // TV with subtitle
    {
      id: 'tv_subtitle',
      type: 'tv_subtitle',
      position: [-5.4, 2, -3],
      rotation: [0, Math.PI/2, 0],
      found: false,
      interactRadius: 4,
      holdSecondsRequired: 5,
      hint: 'What are they saying on TV?',
    },
  ],
}

/**
 * Level 2: Living Room
 * Cozy family room with couch, TV, and decorations
 */
const LEVEL_LIVING_ROOM: LevelConfig = {
  id: 'living_room_01',
  name: 'Living Room',
  description: 'The living room has secrets too!',
  roomSize: [14, 4.5, 10],
  playerSpawn: [0, 1.5, 3],
  playerRotation: Math.PI,
  wallColor: '#F5DEB3', // Wheat
  floorColor: '#2F4F4F', // Dark slate (carpet)
  ceilingColor: '#FFFAF0',
  accentColor: '#4ECDC4',
  theme: 'living_room',
  chestPosition: [5, 0.5, 3],
  toolSpawnChance: 0.35,
  ambientLight: 0.55,
  
  props: [
    { id: 'couch', type: 'couch', position: [0, 0, 2], color: '#8B0000' },
    { id: 'tv_stand', type: 'tv_stand', position: [0, 0, -4], color: '#2F2F2F' },
    { id: 'bookshelf_l', type: 'bookshelf', position: [-6, 0, -2], rotation: [0, Math.PI/2, 0], color: '#5D4037' },
    { id: 'bookshelf_r', type: 'bookshelf', position: [6, 0, -2], rotation: [0, -Math.PI/2, 0], color: '#5D4037' },
    { id: 'table', type: 'table', position: [0, 0, 0], color: '#654321' },
    { id: 'lamp_corner', type: 'lamp', position: [-5, 0, 3.5], color: '#FFD93D' },
    { id: 'plant_corner', type: 'plant', position: [5.5, 0, -3.5], color: '#2E8B57' },
    { id: 'rug_center', type: 'rug', position: [0, 0.02, 0], scale: [5, 1, 3], color: '#DC143C' },
  ],
  
  candidateTargets: [
    // Scoreboard on TV
    {
      id: 'scoreboard_tv',
      type: 'scoreboard',
      position: [0, 2.2, -4.4],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 5,
      holdSecondsRequired: 5,
      hint: 'Watch the score on the TV...',
    },
    // Book on coffee table
    {
      id: 'book_table',
      type: 'book_page',
      position: [0.5, 0.55, 0],
      rotation: [0, Math.PI * 0.3, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      hint: 'Someone left a book on the table...',
    },
    // Digital clock on shelf
    {
      id: 'clock_shelf',
      type: 'digital_clock',
      position: [-6.3, 1.8, -1],
      rotation: [0, Math.PI/2, 0],
      found: false,
      interactRadius: 3,
      holdSecondsRequired: 5,
      hint: 'What time does the clock show?',
    },
    // Phone number on magazine
    {
      id: 'phone_magazine',
      type: 'phone_poster',
      position: [-0.5, 0.52, 0.3],
      rotation: [-Math.PI/2 + 0.1, 0, 0.2],
      scale: [0.5, 0.5, 0.5],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      hint: 'There\'s a magazine with ads...',
    },
    // Sticky note on lamp
    {
      id: 'sticky_lamp',
      type: 'sticky_note',
      position: [-5, 1.4, 3.5],
      rotation: [0, Math.PI * 0.3, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      hint: 'Someone stuck a note near the lamp...',
    },
    // Price tag on decoration
    {
      id: 'price_decoration',
      type: 'price_tag',
      position: [6.3, 1.2, -2.5],
      rotation: [0, -Math.PI/2, 0],
      found: false,
      interactRadius: 2.5,
      holdSecondsRequired: 5,
      hint: 'That decoration still has its price...',
    },
    // Calendar on back wall
    {
      id: 'calendar_living',
      type: 'calendar',
      position: [-3, 2.5, -4.8],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 4,
      holdSecondsRequired: 5,
      hint: 'Check the wall calendar...',
    },
    // Keypad by imaginary door
    {
      id: 'keypad_door',
      type: 'keypad',
      position: [6.8, 1.5, 0],
      rotation: [0, -Math.PI/2, 0],
      found: false,
      interactRadius: 2.5,
      holdSecondsRequired: 5,
      hint: 'What\'s the code on that keypad?',
    },
    // TV subtitle
    {
      id: 'tv_subtitle_living',
      type: 'tv_subtitle',
      position: [0, 2.2, -4.4],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 5,
      holdSecondsRequired: 5,
      hint: 'Read the subtitles on TV...',
    },
  ],
}

/**
 * Level 3: Classroom
 * School classroom with desks, blackboard, and educational items
 */
const LEVEL_CLASSROOM: LevelConfig = {
  id: 'classroom_01',
  name: 'The Classroom',
  description: 'Even school has hidden 67s!',
  roomSize: [16, 4, 12],
  playerSpawn: [0, 1.5, 4],
  playerRotation: Math.PI,
  wallColor: '#E8E8D0', // Cream
  floorColor: '#8B7355', // Tan (wood)
  ceilingColor: '#F5F5F5',
  accentColor: '#FFE66D',
  theme: 'classroom',
  chestPosition: [-6, 0.5, -4],
  toolSpawnChance: 0.35,
  ambientLight: 0.7,
  
  props: [
    // Teacher's desk at front
    { id: 'teacher_desk', type: 'desk', position: [0, 0, -4.5], scale: [1.5, 1, 1], color: '#5D4037' },
    // Student desks in rows
    { id: 'desk_1', type: 'desk', position: [-4, 0, 0], scale: [0.8, 1, 0.8], color: '#795548' },
    { id: 'desk_2', type: 'desk', position: [0, 0, 0], scale: [0.8, 1, 0.8], color: '#795548' },
    { id: 'desk_3', type: 'desk', position: [4, 0, 0], scale: [0.8, 1, 0.8], color: '#795548' },
    { id: 'desk_4', type: 'desk', position: [-4, 0, 2.5], scale: [0.8, 1, 0.8], color: '#795548' },
    { id: 'desk_5', type: 'desk', position: [0, 0, 2.5], scale: [0.8, 1, 0.8], color: '#795548' },
    { id: 'desk_6', type: 'desk', position: [4, 0, 2.5], scale: [0.8, 1, 0.8], color: '#795548' },
    // Chairs
    { id: 'chair_t', type: 'chair', position: [0, 0, -3.5], color: '#4A4A4A' },
    { id: 'chair_1', type: 'chair', position: [-4, 0, 1], rotation: [0, Math.PI, 0], color: '#4A4A4A' },
    { id: 'chair_2', type: 'chair', position: [0, 0, 1], rotation: [0, Math.PI, 0], color: '#4A4A4A' },
    { id: 'chair_3', type: 'chair', position: [4, 0, 1], rotation: [0, Math.PI, 0], color: '#4A4A4A' },
    // Bookshelf
    { id: 'bookshelf_class', type: 'bookshelf', position: [-7, 0, 0], rotation: [0, Math.PI/2, 0], color: '#5D4037' },
    // Plant
    { id: 'plant_class', type: 'plant', position: [7, 0, -4], color: '#228B22' },
  ],
  
  candidateTargets: [
    // Clock above blackboard
    {
      id: 'clock_class',
      type: 'digital_clock',
      position: [4, 3, -5.8],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 5,
      holdSecondsRequired: 5,
      hint: 'The classroom clock shows the time...',
    },
    // Page number in textbook
    {
      id: 'book_desk',
      type: 'book_page',
      position: [-4, 0.85, 0],
      rotation: [0, Math.PI * 0.1, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      hint: 'Someone left their textbook open...',
    },
    // Teacher's sticky note
    {
      id: 'sticky_teacher',
      type: 'sticky_note',
      position: [0.8, 0.85, -4.5],
      rotation: [-Math.PI/12, 0.2, 0],
      found: false,
      interactRadius: 2.5,
      holdSecondsRequired: 5,
      hint: 'The teacher has a note...',
    },
    // Calendar showing 6/7
    {
      id: 'calendar_class',
      type: 'calendar',
      position: [-4, 2.8, -5.8],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 4,
      holdSecondsRequired: 5,
      hint: 'What\'s today\'s date?',
    },
    // Poster with phone number
    {
      id: 'poster_class',
      type: 'phone_poster',
      position: [7.8, 2, 0],
      rotation: [0, -Math.PI/2, 0],
      found: false,
      interactRadius: 4,
      holdSecondsRequired: 5,
      hint: 'There\'s a poster on the wall...',
    },
    // Angle blocks (building blocks forming 67)
    {
      id: 'angle_class',
      type: 'angle_blocks',
      position: [-7, 1.5, 2],
      rotation: [0, Math.PI/2, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      vantageZone: {
        position: [-4, 1.5, 2],
        radius: 1,
      },
      hint: 'Those blocks look interesting from certain angles...',
    },
    // Price tag on supplies
    {
      id: 'price_supplies',
      type: 'price_tag',
      position: [7.5, 0.5, -4],
      rotation: [0, -Math.PI * 0.6, 0],
      found: false,
      interactRadius: 2,
      holdSecondsRequired: 5,
      hint: 'Check the price on those supplies...',
    },
    // Scoreboard (math quiz)
    {
      id: 'scoreboard_class',
      type: 'scoreboard',
      position: [-2, 2.8, -5.8],
      rotation: [0, 0, 0],
      found: false,
      interactRadius: 5,
      holdSecondsRequired: 5,
      hint: 'Someone got a score on the board...',
    },
    // Keypad on closet
    {
      id: 'keypad_class',
      type: 'keypad',
      position: [-7.8, 1.5, -3],
      rotation: [0, Math.PI/2, 0],
      found: false,
      interactRadius: 2.5,
      holdSecondsRequired: 5,
      hint: 'The supply closet has a keypad...',
    },
  ],
}

/** All available levels */
export const LEVELS: LevelConfig[] = [
  LEVEL_BEDROOM,
  LEVEL_LIVING_ROOM,
  LEVEL_CLASSROOM,
]

/** Get level by ID */
export function getLevelById(id: string): LevelConfig | undefined {
  return LEVELS.find(l => l.id === id)
}

/** Get level by index */
export function getLevelByIndex(index: number): LevelConfig {
  return LEVELS[index % LEVELS.length]
}

