/**
 * Simple Express server for logging player sessions
 * Writes structured logs to logs/players.txt
 */

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const logFilePath = path.join(logsDir, 'players.txt')

/**
 * Format a log entry as a structured text line
 * Format: [TIMESTAMP] | TYPE | PLAYER | DETAILS
 */
function formatLogEntry(data) {
  const timestamp = new Date().toISOString()
  const playerName = data.playerName || 'Guest'
  const eventType = data.eventType || 'unknown'
  
  let details = ''
  
  if (eventType === 'game_start') {
    details = `difficulty=${data.difficulty || 'normal'}, level=${data.level || 'unknown'}, sessionId=${data.sessionId || 'unknown'}`
  } else if (eventType === 'game_end') {
    details = `result=${data.result || 'unknown'}, difficulty=${data.difficulty || 'normal'}, level=${data.level || 'unknown'}, found=${data.targetsFound || 0}/${data.requiredCount || 5}, timeRemaining=${Math.floor(data.timeRemaining || 0)}s, sessionId=${data.sessionId || 'unknown'}`
  }
  
  return `[${timestamp}] | ${eventType.toUpperCase().padEnd(10)} | ${playerName.padEnd(20)} | ${details}\n`
}

/**
 * POST /api/log
 * Logs a player event to the log file
 * 
 * Body: {
 *   eventType: 'game_start' | 'game_end',
 *   playerName: string,
 *   difficulty?: string,
 *   levelName?: string,
 *   runId?: string,
 *   result?: 'won' | 'lost',
 *   foundCount?: number,
 *   requiredCount?: number,
 *   timeRemaining?: number
 * }
 */
app.post('/api/log', (req, res) => {
  try {
    const logEntry = formatLogEntry(req.body)
    
    // Append to log file
    fs.appendFileSync(logFilePath, logEntry, 'utf8')
    
    console.log('Logged:', logEntry.trim())
    
    res.json({ success: true, message: 'Log entry recorded' })
  } catch (error) {
    console.error('Error writing log:', error)
    res.status(500).json({ success: false, error: 'Failed to write log' })
  }
})

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🎮 Player logging server running on http://localhost:${PORT}`)
  console.log(`📝 Logs will be written to: ${logFilePath}`)
})
