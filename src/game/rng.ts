/**
 * rng.ts - Seeded Random Number Generator
 * Uses a simple but effective mulberry32 algorithm
 * Ensures deterministic gameplay from a seed for multiplayer sync
 */

/**
 * Creates a seeded random number generator
 * @param seed - Numeric seed for deterministic randomness
 * @returns Object with random utility methods
 */
export function createRNG(seed: number) {
  let state = seed

  /**
   * Mulberry32 algorithm - fast, simple 32-bit PRNG
   * Good statistical properties for game use
   */
  const next = (): number => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    /** Returns a random float between 0 (inclusive) and 1 (exclusive) */
    random: next,

    /** Returns a random float between min (inclusive) and max (exclusive) */
    range: (min: number, max: number): number => {
      return min + next() * (max - min)
    },

    /** Returns a random integer between min (inclusive) and max (inclusive) */
    int: (min: number, max: number): number => {
      return Math.floor(min + next() * (max - min + 1))
    },

    /** Returns a random boolean with optional probability of true */
    bool: (probability = 0.5): boolean => {
      return next() < probability
    },

    /** Picks a random element from an array */
    pick: <T>(array: T[]): T => {
      return array[Math.floor(next() * array.length)]
    },

    /** Shuffles an array in place using Fisher-Yates algorithm */
    shuffle: <T>(array: T[]): T[] => {
      const result = [...array]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
      }
      return result
    },

    /** Picks n random unique elements from an array */
    sample: <T>(array: T[], n: number): T[] => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled.slice(0, Math.min(n, shuffled.length))
    },

    /** Get current state for serialization */
    getState: (): number => state,

    /** Reset to a new seed */
    reset: (newSeed: number): void => {
      state = newSeed
    },
  }
}

/** Type for the RNG instance */
export type RNG = ReturnType<typeof createRNG>

/**
 * Generates a seed from a string (for level + run combination)
 * Uses simple djb2 hash
 */
export function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}

/**
 * Creates a seed from level ID and run ID
 * This ensures same level + run always produces same target layout
 */
export function createGameSeed(levelId: string, runId: string): number {
  return hashString(`${levelId}:${runId}`)
}


