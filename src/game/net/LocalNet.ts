/**
 * LocalNet.ts - Local (Single-Player) Network Implementation
 * This is the default network mode - no actual networking
 * All state is managed locally, messages are no-ops
 * 
 * This file exists as a reference for the network interface
 * and can be used independently if needed
 */

import { NetMessage, PlayerInfo } from '../types'
import type { NetInterface } from './NetProvider'

/**
 * LocalNet - Single-player network stub
 * Implements NetInterface with no actual network operations
 */
export class LocalNet implements NetInterface {
  /** Local player always has this ID */
  readonly playerId = 'local_player'
  
  /** Always connected in local mode */
  readonly isConnected = true
  
  /** Virtual room ID */
  readonly roomId = 'local_room'
  
  /** Single player list */
  readonly players: PlayerInfo[] = [{
    id: 'local_player',
    name: 'Player',
    color: '#ff6b35',
    targetsFound: 0,
  }]
  
  /** Message handlers (for consistency with interface) */
  private handlers = new Set<(message: NetMessage) => void>()
  
  /**
   * Send a message - no-op in local mode
   * Logged in development for debugging
   */
  send(_message: Omit<NetMessage, 'playerId' | 'timestamp'>): void {
    // No-op in local mode - messages go nowhere
    // In debug mode, uncomment below to log messages:
    // console.debug('[LocalNet] Would send:', _message.type, _message.payload)
  }
  
  /**
   * Subscribe to messages - in local mode, no messages are received
   * Returns unsubscribe function for cleanup
   */
  subscribe(handler: (message: NetMessage) => void): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }
  
  /**
   * Simulate receiving a message (for testing)
   * Not used in normal operation
   */
  simulateMessage(message: NetMessage): void {
    this.handlers.forEach(handler => handler(message))
  }
  
  /**
   * Join a room - no-op, always resolves immediately
   */
  async join(_roomId: string): Promise<void> {
    return Promise.resolve()
  }
  
  /**
   * Leave current room - no-op
   */
  leave(): void {
    // Nothing to clean up in local mode
  }
  
  /**
   * Sync state - no-op in local mode
   * In multiplayer, this would broadcast authoritative state
   */
  syncState(_state: unknown): void {
    // State is fully local, no sync needed
  }
}

/**
 * Factory function to create a LocalNet instance
 * Useful for dependency injection
 */
export function createLocalNet(): NetInterface {
  return new LocalNet()
}

