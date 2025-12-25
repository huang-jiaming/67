# 67 Escape Room

A kid-friendly, web-based 3D escape room game where players must find hidden "67" references before time runs out!

## 🎮 Game Concept

- Player is locked in a 3D room with a countdown timer
- Goal: Find 5 hidden "67" references before time runs out
- "Targeting" mechanic: Aim at a target and hold mouse button for 5 seconds to confirm
- Use powerup tools found in chests to help you win

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The game will be available at `http://localhost:3000`

## 🎯 Controls

| Action | Control |
|--------|---------|
| Move | WASD or Arrow Keys |
| Look Around | Mouse |
| Target "67" | Hold Left Mouse Button |
| Open Chest | E key |
| Use Tool 1-4 | Number keys 1-4 |
| Pause | ESC |
| Jump | Spacebar |

### Mobile Controls
- Touch and drag to look around
- On-screen joystick for movement (basic support)

## 🎚️ Difficulty Levels

| Level | Time | Hold Duration | Notes |
|-------|------|---------------|-------|
| Easy | 90s | 3 seconds | More obvious targets |
| Normal | 60s | 5 seconds | Standard challenge |
| Hard | 45s | 5 seconds | Hidden targets |

## 🔧 Tools/Powerups

| Tool | Effect |
|------|--------|
| 💡 Hint | Shows a beacon above the nearest unfound target |
| ❄️ Time Freeze | Pauses the timer for 5 seconds |
| ⏰ Time Add | Adds 10 seconds to the timer |
| 🔍 Reveal | Shows direction and count of remaining targets |

## 🎯 Target Types (67 References)

1. **Digital Clock** - Shows 6:07
2. **Book Page** - Opened to page 67
3. **Sticky Note** - Note with "67" written
4. **Phone Poster** - Advertisement with phone number containing 67
5. **Price Tag** - Shows $6.70
6. **Calendar** - Date 6/7 circled
7. **Door Keypad** - Code display shows 67
8. **Angle Blocks** - Two blocks form "67" from specific viewing angle
9. **Scoreboard** - Flashes score of 67
10. **TV Subtitle** - Shows text "six seven"

## 📁 Project Structure

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Root component with providers
├── styles.css                  # Global styles
└── game/
    ├── GameRoot.tsx            # Main game orchestrator
    ├── state.ts                # Zustand store for game state
    ├── rng.ts                  # Seeded random number generator
    ├── types.ts                # TypeScript type definitions
    ├── net/
    │   ├── NetProvider.tsx     # Network abstraction layer
    │   ├── LocalNet.ts         # Single-player network (current)
    │   └── PartyKitNet.stub.ts # Multiplayer stub (future)
    ├── levels/
    │   ├── levelConfigs.ts     # Level/room definitions
    │   └── buildLevel.ts       # Level mesh construction
    └── components/
        ├── GameScene.tsx       # Main 3D scene
        ├── PlayerController.tsx # First-person controls
        ├── InteractRaycaster.tsx # Target detection & hold mechanic
        ├── RoomMesh.tsx        # Room walls/floor/ceiling
        ├── PropMesh.tsx        # Furniture and decorations
        ├── TargetMesh.tsx      # 67 target visualizations
        ├── Chest.tsx           # Tool chest interaction
        ├── HintBeacon.tsx      # Floating hint indicator
        ├── HUD.tsx             # In-game overlay UI
        ├── HoldProgressUI.tsx  # Circular progress indicator
        ├── Screens.tsx         # Start/Pause/Win/Lose screens
        ├── ToolEffects.ts      # Tool effect implementations
        └── Sfx.tsx             # Web Audio sound effects
```

## 📝 Adding New Levels

1. Open `src/game/levels/levelConfigs.ts`
2. Create a new `LevelConfig` object:

```typescript
const MY_NEW_LEVEL: LevelConfig = {
  id: 'my_level_01',
  name: 'My Cool Room',
  description: 'Description for loading screen',
  roomSize: [14, 4, 12],  // Width, Height, Depth
  playerSpawn: [0, 1.5, 4],
  playerRotation: Math.PI,
  wallColor: '#F5DEB3',
  floorColor: '#8B7355',
  ceilingColor: '#F5F5F5',
  accentColor: '#FF6B35',
  theme: 'living_room',
  chestPosition: [5, 0.5, 3],
  toolSpawnChance: 0.4,
  ambientLight: 0.6,
  
  props: [
    // Add furniture and decorations
    { id: 'table_1', type: 'table', position: [0, 0, 0], color: '#8B4513' },
  ],
  
  candidateTargets: [
    // Add at least 8-10 possible targets (5 will be selected randomly)
    {
      id: 'clock_1',
      type: 'digital_clock',
      position: [2, 1.5, -5],
      found: false,
      interactRadius: 3,
      holdSecondsRequired: 5,
    },
    // ... more targets
  ],
}
```

3. Add the level to the `LEVELS` array at the bottom of the file

## 🎨 Adding New Target Types

1. Add the type to `TargetType` in `src/game/types.ts`
2. Create a visualization component in `src/game/components/TargetMesh.tsx`
3. Add the render case to the `renderTargetType` function

## 🌐 Multiplayer Architecture (Future)

The game is designed with multiplayer in mind. The architecture supports:

### Network Layer Abstraction

The `NetProvider` provides a unified interface:
- `LocalNet` - Current single-player implementation
- `PartyKitNet` - Future WebSocket multiplayer (stub provided)

### Planned Game Modes

1. **Co-op Mode**: Same room, shared found-count
2. **Race Mode**: Separate instances, fastest wins

### PartyKit Integration Steps

1. Install PartyKit:
   ```bash
   npm install partykit partysocket
   ```

2. Create a PartyKit server (`partykit/server.ts`):
   ```typescript
   import type { PartyKitServer } from 'partykit/server'
   
   export default {
     onConnect(connection, room) {
       // Handle new player
     },
     onMessage(message, connection, room) {
       // Handle game messages
     },
     onClose(connection, room) {
       // Handle disconnect
     }
   } satisfies PartyKitServer
   ```

3. Implement `PartyKitNet` class in `src/game/net/PartyKitNet.stub.ts`

4. Update `NetProvider` to use PartyKitNet when a room ID is provided

### State Synchronization

- Game state is deterministic from a seed
- All clients use the same seeded RNG for target selection
- Server authoritative for: timer, target found state, tool usage
- Messages: `player_join`, `player_leave`, `target_found`, `tool_used`, `sync_state`

## 🎵 Sound Effects

All sounds use the Web Audio API with no external files:
- Synthesized tones for positive feedback
- Different sounds for: target found, hover, tool use, timer warning
- Kid-friendly, non-jarring audio

## 🛠️ Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful Three.js helpers
- **Zustand** - Lightweight state management

## 📜 License

MIT License - Feel free to use and modify!

## 🎮 Credits

Created as a kid-friendly puzzle game inspired by the "6-7 / 67" meme.

