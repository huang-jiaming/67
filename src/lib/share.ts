/**
 * share.ts - Score Sharing Utilities
 * Encode/decode score data for shareable URLs
 */

export interface ShareData {
  playerName: string
  score: number
  level: string
  difficulty: string
}

/**
 * Encode share data to a base64 string
 */
export function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data)
  // Use btoa for base64 encoding (works in browser)
  return btoa(encodeURIComponent(json))
}

/**
 * Decode share data from a base64 string
 */
export function decodeShareData(encoded: string): ShareData | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const data = JSON.parse(json)
    
    // Validate the data has required fields
    if (
      typeof data.playerName === 'string' &&
      typeof data.score === 'number' &&
      typeof data.level === 'string' &&
      typeof data.difficulty === 'string'
    ) {
      return data as ShareData
    }
    return null
  } catch {
    return null
  }
}

/**
 * Generate a full shareable URL with encoded score data
 */
export function generateShareUrl(data: ShareData): string {
  const encoded = encodeShareData(data)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?share=${encoded}`
}

/**
 * Copy text to clipboard
 * Returns true on success, false on failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Share using the Web Share API (mobile-friendly)
 * Returns true if shared via native share, false otherwise
 */
export async function shareNative(data: ShareData): Promise<boolean> {
  const url = generateShareUrl(data)
  const text = `I scored ${formatScore(data.score)} on ${data.level} in 67 Escape Room! Can you beat me?`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: '67 Escape Room - My Score',
        text,
        url,
      })
      return true
    } catch {
      // User cancelled or share failed
      return false
    }
  }
  return false
}

/**
 * Format score as time string (e.g., "45.3s" or "1:23.4")
 */
export function formatScore(score: number): string {
  const mins = Math.floor(score / 60)
  const secs = Math.floor(score % 60)
  const ms = Math.floor((score % 1) * 10)
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
  }
  return `${secs}.${ms}s`
}

/**
 * Get share data from URL if present
 */
export function getShareDataFromUrl(): ShareData | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('share')
  if (encoded) {
    return decodeShareData(encoded)
  }
  return null
}

/**
 * Clean the share parameter from the URL without refreshing
 */
export function cleanShareFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('share')
  window.history.replaceState({}, '', url.pathname + url.search)
}

