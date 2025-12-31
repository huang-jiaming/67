/**
 * Sfx.ts - Sound Effects using Web Audio API
 * Simple synthesized sounds without external audio files
 * Kid-friendly, positive feedback sounds
 */

// Audio context (created on first user interaction)
let audioContext: AudioContext | null = null

/**
 * Initialize or get the audio context
 * Must be called after user interaction due to browser policies
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a simple tone
 */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
  attack: number = 0.01,
  decay: number = 0.1
): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack)
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + attack + decay)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    // Silently fail if audio isn't available
    console.debug('Audio not available:', e)
  }
}

/**
 * Play a chord (multiple tones)
 */
function playChord(
  frequencies: number[],
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.2
): void {
  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, duration, type, volume / frequencies.length)
    }, i * 30) // Slight stagger for richness
  })
}

// ============================================
// Game Sound Effects
// ============================================

/**
 * Positive "found target" celebration sound
 * Rising arpeggio that feels rewarding
 */
export function playTargetFound(): void {
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.15, 'triangle', 0.25)
    }, i * 60)
  })
}

/**
 * Hover start - subtle click/blip
 */
export function playHoverStart(): void {
  playTone(880, 0.05, 'sine', 0.15, 0.005, 0.02)
}

/**
 * Hold progress tick - gets higher pitched as progress increases
 */
export function playHoldProgress(progress: number): void {
  const baseFreq = 300 + progress * 400
  playTone(baseFreq, 0.1, 'square', 0.1, 0.01, 0.05)
}

/**
 * Tool pickup sound - magical sparkle
 */
export function playToolPickup(): void {
  playChord([698.46, 880, 1108.73], 0.3, 'sine', 0.25) // F5, A5, C#6
}

/**
 * Tool use sound - whoosh effect
 */
export function playToolUse(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (e) {
    console.debug('Audio not available:', e)
  }
}

/**
 * Timer warning beep - plays when time is low
 */
export function playTimerWarning(): void {
  playTone(440, 0.1, 'square', 0.2, 0.01, 0.05)
}

/**
 * Game over (lose) sound - descending sad tone
 */
export function playGameOver(): void {
  const notes = [392, 349.23, 311.13, 261.63] // G4, F4, Eb4, C4
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.25, 'sawtooth', 0.15)
    }, i * 150)
  })
}

/**
 * Victory sound - triumphant fanfare
 */
export function playVictory(): void {
  // First chord
  setTimeout(() => playChord([523.25, 659.25, 783.99], 0.4, 'triangle', 0.3), 0)
  // Second chord (higher)
  setTimeout(() => playChord([659.25, 783.99, 987.77], 0.4, 'triangle', 0.3), 300)
  // Final chord
  setTimeout(() => playChord([783.99, 987.77, 1174.66], 0.6, 'triangle', 0.35), 600)
}

/**
 * Button click sound
 */
export function playButtonClick(): void {
  playTone(600, 0.05, 'square', 0.15, 0.005, 0.02)
}

/**
 * Chest open sound - creaky + sparkle
 */
export function playChestOpen(): void {
  // Creak
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(100, ctx.currentTime)
    oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2)
    oscillator.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (e) {
    console.debug('Audio not available:', e)
  }
  
  // Sparkle
  setTimeout(() => {
    playChord([1046.50, 1318.51, 1567.98], 0.2, 'sine', 0.2)
  }, 200)
}

/**
 * Time freeze sound - crystalline
 */
export function playTimeFreeze(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(2000, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.5)
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  } catch (e) {
    console.debug('Audio not available:', e)
  }
}

/**
 * Time add sound - positive whoosh up
 */
export function playTimeAdd(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.25)
  } catch (e) {
    console.debug('Audio not available:', e)
  }
}


