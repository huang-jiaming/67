/**
 * NetProvider.tsx - Network Abstraction Layer
 * Provides a unified interface for network operations
 * Currently implements LocalNet (single-player), ready for PartyKit later
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { NetMessage, PlayerInfo } from '../types'

/**
 * Network interface that both LocalNet and PartyKitNet implement
 * This abstraction allows seamless switching between single/multiplayer
 */
export interface NetInterface {
  /** Unique player ID for this client */
  playerId: string
  
  /** Whether currently connected (always true for local) */
  isConnected: boolean
  
  /** Current room/session ID */
  roomId: string | null
  
  /** All players in the session */
  players: PlayerInfo[]
  
  /** Send a message to other players */
  send: (message: Omit<NetMessage, 'playerId' | 'timestamp'>) => void
  
  /** Subscribe to incoming messages */
  subscribe: (handler: (message: NetMessage) => void) => () => void
  
  /** Join a room (no-op for local) */
  join: (roomId: string) => Promise<void>
  
  /** Leave current room (no-op for local) */
  leave: () => void
  
  /** Broadcast game state for sync */
  syncState: (state: unknown) => void
}

/** Local (single-player) network implementation */
class LocalNet implements NetInterface {
  playerId = 'local_player'
  isConnected = true
  roomId = 'local_room'
  players: PlayerInfo[] = [{
    id: 'local_player',
    name: 'Player',
    color: '#ff6b35',
    targetsFound: 0,
  }]
  
  private handlers: Set<(message: NetMessage) => void> = new Set()
  
  send(message: Omit<NetMessage, 'playerId' | 'timestamp'>): void {
    // In local mode, messages are no-ops but we could log for debugging
    if (import.meta.env.DEV) {
      console.debug('[LocalNet] Message:', message)
    }
  }
  
  subscribe(handler: (message: NetMessage) => void): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }
  
  async join(_roomId: string): Promise<void> {
    // No-op for local
    return Promise.resolve()
  }
  
  leave(): void {
    // No-op for local
  }
  
  syncState(_state: unknown): void {
    // No-op for local, state is authoritative locally
  }
}

/** Context for network access */
const NetContext = createContext<NetInterface | null>(null)

/** Network provider component */
export function NetProvider({ children }: { children: React.ReactNode }) {
  // Create network instance (currently LocalNet)
  const net = useMemo(() => new LocalNet(), [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      net.leave()
    }
  }, [net])
  
  return (
    <NetContext.Provider value={net}>
      {children}
    </NetContext.Provider>
  )
}

/** Hook to access network interface */
export function useNet(): NetInterface {
  const net = useContext(NetContext)
  if (!net) {
    throw new Error('useNet must be used within a NetProvider')
  }
  return net
}

/** Hook for multiplayer-ready operations */
export function useMultiplayer() {
  const net = useNet()
  
  return {
    isMultiplayer: net.players.length > 1,
    players: net.players,
    playerId: net.playerId,
    
    /** Report target found to other players */
    reportTargetFound: (targetId: string) => {
      net.send({
        type: 'target_found',
        payload: { targetId },
      })
    },
    
    /** Report tool usage to other players */
    reportToolUsed: (toolType: string) => {
      net.send({
        type: 'tool_used',
        payload: { toolType },
      })
    },
  }
}

