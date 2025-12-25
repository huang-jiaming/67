/**
 * PartyKitNet.stub.ts - PartyKit WebSocket Network Stub
 * 
 * THIS IS A STUB FILE - NOT ACTIVE IN CURRENT BUILD
 * 
 * This file provides the structure for future PartyKit multiplayer integration.
 * To activate multiplayer:
 * 
 * 1. Install PartyKit: npm install partykit partysocket
 * 2. Create a PartyKit server (partykit/server.ts)
 * 3. Implement this class fully
 * 4. Update NetProvider to use PartyKitNet when roomId is provided
 * 
 * See README.md for detailed multiplayer integration guide.
 */

import { NetMessage, PlayerInfo } from '../types'
import type { NetInterface } from './NetProvider'

// Placeholder types - replace with actual PartySocket types when installed
type PartySocket = {
  send: (data: string) => void
  close: () => void
  addEventListener: (event: string, handler: (e: unknown) => void) => void
  removeEventListener: (event: string, handler: (e: unknown) => void) => void
}

/**
 * PartyKitNet - WebSocket multiplayer implementation (STUB)
 * 
 * Architecture notes for implementation:
 * 
 * - Server maintains authoritative game state
 * - Clients send actions, receive state updates
 * - Timer runs on server to prevent cheating
 * - Target selection uses same seeded RNG on all clients
 * 
 * Message types to implement:
 * - player_join: New player entered room
 * - player_leave: Player disconnected
 * - target_found: Someone found a target
 * - tool_used: Someone used a tool
 * - game_start: Server starts the game
 * - game_end: Game over (win/lose)
 * - sync_state: Full state sync on join
 */
export class PartyKitNet implements NetInterface {
  private socket: PartySocket | null = null
  private handlers = new Set<(message: NetMessage) => void>()
  
  playerId: string
  isConnected = false
  roomId: string | null = null
  players: PlayerInfo[] = []
  
  constructor() {
    // Generate unique player ID
    this.playerId = `player_${crypto.randomUUID().slice(0, 8)}`
  }
  
  /**
   * Connect to a PartyKit room
   * @param roomId - The room code to join
   */
  async join(roomId: string): Promise<void> {
    // STUB: Replace with actual PartySocket connection
    // 
    // Example implementation:
    // ```
    // import PartySocket from 'partysocket'
    // 
    // this.socket = new PartySocket({
    //   host: PARTYKIT_HOST,
    //   room: roomId,
    // })
    // 
    // this.socket.addEventListener('message', (event) => {
    //   const message = JSON.parse(event.data) as NetMessage
    //   this.handlers.forEach(h => h(message))
    // })
    // 
    // await new Promise((resolve) => {
    //   this.socket.addEventListener('open', resolve)
    // })
    // ```
    
    console.warn('[PartyKitNet] STUB: join() not implemented')
    this.roomId = roomId
    throw new Error('PartyKit multiplayer not yet implemented. See README.md for setup instructions.')
  }
  
  /**
   * Disconnect from current room
   */
  leave(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.roomId = null
    this.isConnected = false
    this.players = []
  }
  
  /**
   * Send a message to other players via server
   */
  send(message: Omit<NetMessage, 'playerId' | 'timestamp'>): void {
    if (!this.socket || !this.isConnected) {
      console.warn('[PartyKitNet] Cannot send: not connected')
      return
    }
    
    const fullMessage: NetMessage = {
      ...message,
      playerId: this.playerId,
      timestamp: Date.now(),
    } as NetMessage
    
    this.socket.send(JSON.stringify(fullMessage))
  }
  
  /**
   * Subscribe to incoming messages
   */
  subscribe(handler: (message: NetMessage) => void): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }
  
  /**
   * Broadcast full game state for sync
   * Only the host/server should call this
   */
  syncState(state: unknown): void {
    this.send({
      type: 'sync_state',
      payload: state,
    })
  }
}

/**
 * Example PartyKit Server Structure (partykit/server.ts)
 * 
 * ```typescript
 * import type { PartyKitServer, PartyKitConnection } from 'partykit/server'
 * 
 * interface GameRoom {
 *   players: Map<string, PlayerInfo>
 *   gameState: GameState | null
 *   seed: number
 * }
 * 
 * export default {
 *   onConnect(connection: PartyKitConnection, room: PartyKitRoom) {
 *     // Add player to room
 *     // Broadcast player_join to others
 *     // Send sync_state to new player
 *   },
 *   
 *   onMessage(message: string, connection: PartyKitConnection, room: PartyKitRoom) {
 *     const msg = JSON.parse(message) as NetMessage
 *     
 *     switch (msg.type) {
 *       case 'target_found':
 *         // Validate and update game state
 *         // Broadcast to all players
 *         break
 *       case 'tool_used':
 *         // Apply effect, broadcast result
 *         break
 *       case 'game_start':
 *         // Generate seed, start timer
 *         break
 *     }
 *   },
 *   
 *   onClose(connection: PartyKitConnection, room: PartyKitRoom) {
 *     // Remove player
 *     // Broadcast player_leave
 *   }
 * } satisfies PartyKitServer
 * ```
 */

/**
 * Multiplayer Game Modes (to implement):
 * 
 * 1. COOP Mode:
 *    - Same room, shared found count
 *    - All players see same targets
 *    - First to find a target claims it for team
 *    - Shared timer
 *    
 * 2. RACE Mode:
 *    - Separate instances of same room
 *    - Each player has own target set (same seed)
 *    - Fastest to find all wins
 *    - Individual timers but synced start
 */

export function createPartyKitNet(): NetInterface {
  return new PartyKitNet()
}

