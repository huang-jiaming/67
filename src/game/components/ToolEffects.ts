/**
 * ToolEffects.ts - Tool Effect Implementations
 * Centralized logic for tool effects
 * This file provides reusable tool effect functions
 */

import { useGameStore } from '../state'
import { ToolType, Quadrant } from '../types'

/**
 * Apply a tool effect based on type
 * This function is called when a tool is used from inventory
 */
export function applyToolEffect(toolType: ToolType): void {
  switch (toolType) {
    case 'hint':
      applyHintEffect()
      break
    case 'reveal':
      applyRevealEffect()
      break
  }
}

/**
 * Hint Tool: Highlights the nearest unfound target
 */
function applyHintEffect(): void {
  const state = useGameStore.getState()
  const unfound = state.targets.filter((t) => !t.found)
  
  if (unfound.length === 0) {
    state.addToast('No targets remaining!', 'warning')
    return
  }
  
  // Find the first unfound target (could be nearest by distance calculation)
  // For simplicity, we take the first one; in a more advanced version,
  // we could calculate distance from player position
  const target = unfound[0]
  state.setHintedTarget(target.id, 5)
  state.addToast('Hint activated! Look for the beacon!', 'info')
}

/**
 * Reveal Tool: Shows the count and general direction of remaining targets
 */
function applyRevealEffect(): void {
  const state = useGameStore.getState()
  const unfound = state.targets.filter((t) => !t.found)
  
  if (unfound.length === 0) {
    state.addToast('All targets found!', 'success')
    return
  }
  
  const count = unfound.length
  
  // Determine quadrant of the first unfound target
  // In a full implementation, this could show the most populated quadrant
  const target = unfound[0]
  const [x, , z] = target.position
  
  let quadrant: Quadrant = 'center'
  
  // Determine quadrant based on position
  const threshold = 2
  if (Math.abs(x) > threshold || Math.abs(z) > threshold) {
    if (z < -threshold) {
      quadrant = 'north'
    } else if (z > threshold) {
      quadrant = 'south'
    } else if (x > threshold) {
      quadrant = 'east'
    } else if (x < -threshold) {
      quadrant = 'west'
    }
  }
  
  state.setRevealQuadrant(quadrant, 5)
  state.addToast(
    `${count} target${count > 1 ? 's' : ''} remaining - check ${quadrant.toUpperCase()}!`,
    'info'
  )
}

/**
 * Get tool description for UI
 */
export function getToolDescription(toolType: ToolType): string {
  switch (toolType) {
    case 'hint':
      return 'Shows the nearest unfound target with a beacon'
    case 'reveal':
      return 'Shows the direction of remaining targets'
    default:
      return 'Unknown tool'
  }
}

/**
 * Get tool emoji icon
 */
export function getToolIcon(toolType: ToolType): string {
  switch (toolType) {
    case 'hint':
      return '💡'
    case 'reveal':
      return '🔍'
    default:
      return '❓'
  }
}
