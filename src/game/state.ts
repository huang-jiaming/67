/**
 * state.ts - Zustand Store for Game State
 * Central state management for the 67 Escape Room game
 * Score-based gameplay: lower time + fewer mistakes = better score
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  Difficulty,
  GamePhase,
  Target,
  Decoy,
  Tool,
  ToolType,
  DIFFICULTY_SETTINGS,
  TOOL_DEFINITIONS,
  Toast,
  Quadrant,
  PENALTY_SECONDS,
} from './types'
import { createRNG, createGameSeed, RNG } from './rng'
import { LEVELS } from './levels/levelConfigs'

/** Mobile detection utility */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 'ontouchstart' in window
}

/** Joystick input state */
export interface JoystickInput {
  x: number // -1 to 1 (left/right)
  y: number // -1 to 1 (forward/backward)
}

/** Core game state */
interface GameState {
  // Game phase
  phase: GamePhase
  difficulty: Difficulty
  
  // Player info
  playerName: string
  sessionId: string
  
  // Level state
  currentLevelIndex: number
  runId: string
  seed: number
  
  // Score-based timing (count UP, not down)
  startTime: number           // Timestamp when game started
  timeElapsed: number         // Seconds since start (updated each frame)
  wrongSelections: number     // Count of decoy selections
  
  // Targets
  targets: Target[]
  foundCount: number
  requiredCount: number
  
  // Decoys
  decoys: Decoy[]
  
  // Player inventory
  inventory: Tool[]
  
  // UI state
  toasts: Toast[]
  hintedTargetId: string | null
  hintEndTime: number
  revealQuadrant: Quadrant | null
  revealEndTime: number
  
  // Chest state
  chestOpen: boolean
  chestTools: Tool[]
  
  // Pointer lock state
  isPointerLocked: boolean
  
  // Mobile state
  isMobileDevice: boolean
  mobileJoystick: JoystickInput
  mobileGameStarted: boolean // Tracks if mobile user has started (replaces pointer lock check)
  
  // Interaction state (set by InteractRaycaster)
  hoveredTarget: Target | null
  hoveredDecoy: Decoy | null
  holdProgress: number
  nearChest: boolean
  
  // Actions
  setPhase: (phase: GamePhase) => void
  setDifficulty: (difficulty: Difficulty) => void
  setPlayerName: (name: string) => void
  confirmNameEntry: () => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  restartLevel: () => void
  nextLevel: () => void
  goToMenu: () => void
  
  // Logging actions
  logGameStart: () => void
  logGameEnd: (result: 'won') => void
  
  // Timer actions
  tick: (delta: number) => void
  
  // Target actions
  findTarget: (targetId: string) => void
  setHintedTarget: (targetId: string | null, duration?: number) => void
  
  // Decoy actions
  selectDecoy: (decoyId: string) => void
  
  // Tool actions
  useTool: (toolId: string) => void
  addToolToInventory: (tool: Tool) => void
  
  // Chest actions
  openChest: () => void
  closeChest: () => void
  takeToolFromChest: (toolId: string) => void
  
  // Reveal action
  setRevealQuadrant: (quadrant: Quadrant | null, duration?: number) => void
  
  // UI actions
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  
  // Pointer lock
  setPointerLocked: (locked: boolean) => void
  
  // Mobile controls
  setMobileJoystick: (input: JoystickInput) => void
  setMobileGameStarted: (started: boolean) => void
  
  // Get RNG for current run
  getRNG: () => RNG
  
  // Score calculation
  getFinalScore: () => number
}

/** Generate a unique run ID */
const generateRunId = (): string => {
  return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/** Generate unique toast ID */
const generateToastId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

/** Generate unique tool ID */
const generateToolId = (): string => {
  return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

/** Select targets for a round using seeded RNG */
const selectTargets = (levelIndex: number, runId: string, difficulty: Difficulty): Target[] => {
  const level = LEVELS[levelIndex]
  const seed = createGameSeed(level.id, runId)
  const rng = createRNG(seed)
  const settings = DIFFICULTY_SETTINGS[difficulty]
  
  // Sample required number of targets from candidates
  const selectedTargets = rng.sample(level.candidateTargets, settings.targetCount)
  
  // Reset found state and apply difficulty hold time
  return selectedTargets.map((target, index) => ({
    ...target,
    id: `target_${index}_${target.type}`,
    found: false,
    holdSecondsRequired: settings.holdSeconds,
  }))
}

/** Select decoys for a round using seeded RNG */
const selectDecoys = (levelIndex: number, runId: string, difficulty: Difficulty): Decoy[] => {
  const level = LEVELS[levelIndex]
  const seed = createGameSeed(level.id, runId + '_decoys')
  const rng = createRNG(seed)
  const settings = DIFFICULTY_SETTINGS[difficulty]
  
  // Sample required number of decoys from candidates
  const candidateDecoys = level.candidateDecoys || []
  const selectedDecoys = rng.sample(candidateDecoys, Math.min(settings.decoyCount, candidateDecoys.length))
  
  // Reset revealed state and apply difficulty hold time
  return selectedDecoys.map((decoy, index) => ({
    ...decoy,
    id: `decoy_${index}_${decoy.type}`,
    revealed: false,
    holdSecondsRequired: settings.holdSeconds,
  }))
}

/** Generate tools for the chest - only hint and reveal now */
const generateChestTools = (levelIndex: number, runId: string, difficulty: Difficulty): Tool[] => {
  const level = LEVELS[levelIndex]
  const seed = createGameSeed(level.id, runId + '_tools')
  const rng = createRNG(seed)
  
  const toolTypes: ToolType[] = ['hint', 'reveal']
  const tools: Tool[] = []
  
  // Each tool has a chance to spawn
  for (const toolType of toolTypes) {
    if (rng.bool(level.toolSpawnChance * 0.7)) {
      tools.push({
        id: generateToolId(),
        ...TOOL_DEFINITIONS[toolType],
      })
    }
  }
  
  // Ensure at least one tool on easy mode
  if (difficulty === 'easy' && tools.length === 0) {
    const randomType = rng.pick(toolTypes)
    tools.push({
      id: generateToolId(),
      ...TOOL_DEFINITIONS[randomType],
    })
  }
  
  return tools.slice(0, 2) // Max 2 tools
}

/** Create the Zustand store */
export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    phase: 'name_entry',
    difficulty: 'normal',
    playerName: '',
    sessionId: generateRunId(),
    currentLevelIndex: 0,
    runId: generateRunId(),
    seed: 0,
    
    // Score-based timing
    startTime: 0,
    timeElapsed: 0,
    wrongSelections: 0,
    
    targets: [],
    foundCount: 0,
    requiredCount: 5,
    decoys: [],
    inventory: [],
    toasts: [],
    hintedTargetId: null,
    hintEndTime: 0,
    revealQuadrant: null,
    revealEndTime: 0,
    chestOpen: false,
    chestTools: [],
    isPointerLocked: false,
    
    // Mobile state
    isMobileDevice: isMobile(),
    mobileJoystick: { x: 0, y: 0 },
    mobileGameStarted: false,
    
    // Interaction state (set by InteractRaycaster)
    hoveredTarget: null,
    hoveredDecoy: null,
    holdProgress: 0,
    nearChest: false,

    // Phase management
    setPhase: (phase) => set({ phase }),
    
    setDifficulty: (difficulty) => set({ difficulty }),

    startGame: () => {
      const { difficulty, currentLevelIndex, logGameStart } = get()
      const runId = generateRunId()
      const settings = DIFFICULTY_SETTINGS[difficulty]
      const level = LEVELS[currentLevelIndex]
      const seed = createGameSeed(level.id, runId)
      const targets = selectTargets(currentLevelIndex, runId, difficulty)
      const decoys = selectDecoys(currentLevelIndex, runId, difficulty)
      const chestTools = generateChestTools(currentLevelIndex, runId, difficulty)
      
      set({
        phase: 'playing',
        runId,
        seed,
        startTime: Date.now(),
        timeElapsed: 0,
        wrongSelections: 0,
        targets,
        decoys,
        foundCount: 0,
        requiredCount: settings.targetCount,
        inventory: [],
        toasts: [],
        hintedTargetId: null,
        hintEndTime: 0,
        revealQuadrant: null,
        revealEndTime: 0,
        chestOpen: false,
        chestTools,
        mobileGameStarted: false, // Reset for new game
        mobileJoystick: { x: 0, y: 0 },
      })
      
      // Log game start
      logGameStart()
    },

    pauseGame: () => {
      const { phase } = get()
      if (phase === 'playing') {
        set({ phase: 'paused' })
      }
    },

    resumeGame: () => {
      const { phase, startTime, timeElapsed } = get()
      if (phase === 'paused') {
        // Adjust start time to account for pause duration
        const pauseDuration = (Date.now() - startTime) / 1000 - timeElapsed
        set({ 
          phase: 'playing',
          startTime: startTime + pauseDuration * 1000,
        })
      }
    },

    restartLevel: () => {
      const state = get()
      // Reset with same level but new run
      state.startGame()
    },

    nextLevel: () => {
      const { currentLevelIndex } = get()
      const nextIndex = (currentLevelIndex + 1) % LEVELS.length
      set({ currentLevelIndex: nextIndex })
      get().startGame()
    },

    goToMenu: () => {
      set({
        phase: 'menu',
        currentLevelIndex: 0,
        inventory: [],
        toasts: [],
      })
    },

    // Timer - now counts UP instead of down
    tick: (_delta) => {
      const state = get()
      
      // Skip if not playing
      if (state.phase !== 'playing') {
        return
      }
      
      // Only tick timer when player is actively playing
      // Desktop: requires pointer lock
      // Mobile: requires mobileGameStarted flag
      const isActive = state.isMobileDevice ? state.mobileGameStarted : state.isPointerLocked
      if (!isActive) {
        return
      }
      
      // Check hint timeout
      if (state.hintedTargetId && Date.now() >= state.hintEndTime) {
        set({ hintedTargetId: null })
      }
      
      // Check reveal timeout
      if (state.revealQuadrant && Date.now() >= state.revealEndTime) {
        set({ revealQuadrant: null })
      }
      
      // Count UP - calculate elapsed time
      const newTimeElapsed = (Date.now() - state.startTime) / 1000
      set({ timeElapsed: newTimeElapsed })
      
      // No game over check - game only ends when all targets found
    },

    // Targets
    findTarget: (targetId) => {
      const state = get()
      const targetIndex = state.targets.findIndex((t) => t.id === targetId)
      if (targetIndex === -1 || state.targets[targetIndex].found) return
      
      const newTargets = [...state.targets]
      newTargets[targetIndex] = { ...newTargets[targetIndex], found: true }
      const newFoundCount = state.foundCount + 1
      
      set({
        targets: newTargets,
        foundCount: newFoundCount,
      })
      
      get().addToast(`67 FOUND! (${newFoundCount}/${state.requiredCount})`, 'success')
      
      // Win check - only condition now is finding all targets
      if (newFoundCount >= state.requiredCount) {
        setTimeout(() => {
          set({ phase: 'won' })
          get().logGameEnd('won')
        }, 500)
      }
    },

    setHintedTarget: (targetId, duration = 5) => {
      set({
        hintedTargetId: targetId,
        hintEndTime: Date.now() + duration * 1000,
      })
    },

    // Decoys
    selectDecoy: (decoyId) => {
      const state = get()
      const decoyIndex = state.decoys.findIndex((d) => d.id === decoyId)
      if (decoyIndex === -1 || state.decoys[decoyIndex].revealed) return
      
      // Mark as revealed
      const newDecoys = [...state.decoys]
      newDecoys[decoyIndex] = { ...newDecoys[decoyIndex], revealed: true }
      
      set({
        decoys: newDecoys,
        wrongSelections: state.wrongSelections + 1,
      })
      
      state.addToast(`NOT A 67! (+${PENALTY_SECONDS}s penalty)`, 'warning')
    },

    // Tools
    useTool: (toolId) => {
      const state = get()
      const toolIndex = state.inventory.findIndex((t) => t.id === toolId)
      if (toolIndex === -1) return
      
      const tool = state.inventory[toolIndex]
      const newInventory = state.inventory.filter((t) => t.id !== toolId)
      set({ inventory: newInventory })
      
      // Apply tool effect
      switch (tool.type) {
        case 'hint': {
          // Find nearest unfound target
          const unfound = state.targets.filter((t) => !t.found)
          if (unfound.length > 0) {
            state.setHintedTarget(unfound[0].id, 5)
            state.addToast('Hint activated!', 'info')
          } else {
            state.addToast('No targets left!', 'warning')
          }
          break
        }
        case 'reveal': {
          // Calculate quadrant of nearest unfound
          const unfound = state.targets.filter((t) => !t.found)
          if (unfound.length > 0) {
            const count = unfound.length
            // Simple quadrant calculation based on position
            const target = unfound[0]
            const x = target.position[0]
            const z = target.position[2]
            let quadrant: Quadrant = 'center'
            if (Math.abs(x) > 2 || Math.abs(z) > 2) {
              if (z < -2) quadrant = 'north'
              else if (z > 2) quadrant = 'south'
              else if (x > 2) quadrant = 'east'
              else if (x < -2) quadrant = 'west'
            }
            state.setRevealQuadrant(quadrant, 5)
            state.addToast(`${count} target${count > 1 ? 's' : ''} remaining - check ${quadrant}!`, 'info')
          }
          break
        }
      }
    },

    addToolToInventory: (tool) => {
      const state = get()
      if (state.inventory.length >= 4) {
        state.addToast('Inventory full!', 'warning')
        return
      }
      set((s) => ({
        inventory: [...s.inventory, tool],
      }))
      state.addToast(`Got ${tool.name}!`, 'success')
    },

    // Chest
    openChest: () => set({ chestOpen: true }),
    closeChest: () => set({ chestOpen: false }),
    
    takeToolFromChest: (toolId) => {
      const state = get()
      const tool = state.chestTools.find((t) => t.id === toolId)
      if (!tool) return
      
      set((s) => ({
        chestTools: s.chestTools.filter((t) => t.id !== toolId),
      }))
      state.addToolToInventory(tool)
    },

    // Reveal
    setRevealQuadrant: (quadrant, duration = 5) => {
      set({
        revealQuadrant: quadrant,
        revealEndTime: Date.now() + duration * 1000,
      })
    },

    // Toasts
    addToast: (message, type = 'info') => {
      const id = generateToastId()
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }],
      }))
      // Auto remove after 3 seconds
      setTimeout(() => {
        get().removeToast(id)
      }, 3000)
    },

    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    },

    // Pointer lock
    setPointerLocked: (locked) => set({ isPointerLocked: locked }),

    // Mobile controls
    setMobileJoystick: (input) => set({ mobileJoystick: input }),
    setMobileGameStarted: (started) => set({ mobileGameStarted: started }),

    // Player name
    setPlayerName: (name) => set({ playerName: name }),
    
    confirmNameEntry: () => {
      set({ phase: 'menu' })
    },

    // Logging
    logGameStart: () => {
      const { playerName, sessionId, difficulty } = get()
      const level = LEVELS[get().currentLevelIndex]
      
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'game_start',
          playerName: playerName || 'Guest',
          sessionId,
          difficulty,
          level: level.name,
        }),
      }).catch(err => console.warn('Failed to log game start:', err))
    },
    
    logGameEnd: (result) => {
      const { playerName, sessionId, difficulty, foundCount, requiredCount, timeElapsed, wrongSelections } = get()
      const level = LEVELS[get().currentLevelIndex]
      const finalScore = get().getFinalScore()
      
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'game_end',
          playerName: playerName || 'Guest',
          sessionId,
          difficulty,
          level: level.name,
          result,
          targetsFound: foundCount,
          requiredCount,
          timeElapsed: Math.round(timeElapsed * 10) / 10,
          wrongSelections,
          finalScore: Math.round(finalScore * 10) / 10,
        }),
      }).catch(err => console.warn('Failed to log game end:', err))
    },

    // Get RNG for current run (for deterministic operations)
    getRNG: () => {
      const { seed } = get()
      return createRNG(seed)
    },
    
    // Calculate final score: timeElapsed + (wrongSelections * PENALTY_SECONDS)
    // Lower is better!
    getFinalScore: () => {
      const { timeElapsed, wrongSelections } = get()
      return timeElapsed + (wrongSelections * PENALTY_SECONDS)
    },
  }))
)

// Export selector hooks for common operations
export const useGamePhase = () => useGameStore((s) => s.phase)
export const useTimeElapsed = () => useGameStore((s) => s.timeElapsed)
export const useWrongSelections = () => useGameStore((s) => s.wrongSelections)
export const useTargets = () => useGameStore((s) => s.targets)
export const useDecoys = () => useGameStore((s) => s.decoys)
export const useFoundCount = () => useGameStore((s) => s.foundCount)
export const useInventory = () => useGameStore((s) => s.inventory)
export const useDifficulty = () => useGameStore((s) => s.difficulty)
export const useCurrentLevel = () => useGameStore((s) => LEVELS[s.currentLevelIndex])
export const useToasts = () => useGameStore((s) => s.toasts)
export const useHintedTargetId = () => useGameStore((s) => s.hintedTargetId)
export const useRevealQuadrant = () => useGameStore((s) => s.revealQuadrant)
export const useChestState = () => useGameStore((s) => ({ open: s.chestOpen, tools: s.chestTools }))

// Mobile-specific selectors
export const useIsMobile = () => useGameStore((s) => s.isMobileDevice)
export const useMobileJoystick = () => useGameStore((s) => s.mobileJoystick)
export const useMobileGameStarted = () => useGameStore((s) => s.mobileGameStarted)

// Player selectors
export const usePlayerName = () => useGameStore((s) => s.playerName)

// Score selector
export const useFinalScore = () => useGameStore((s) => s.getFinalScore())
