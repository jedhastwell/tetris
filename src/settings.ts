import { PlayfieldCommand, GameCommand } from './types'

export interface ControlSettings {
  Keys: {
    Playfield: {
      [key in PlayfieldCommand]: string[]
    }
    Game: {
      [key in GameCommand]: string[]
    }
  }
}

export const Controls: ControlSettings = {
  Keys: {
    Playfield: {
      moveLeft: ['LEFT', 'A'],
      moveRight: ['RIGHT', 'D'],
      softDrop: ['DOWN', 'S'],
      hardDrop: ['SPACE'],
      rotateLeft: ['Z'],
      rotateRight: ['UP', 'X', 'W'],
      hold: ['C'],
    },
    Game: {
      pause: ['ESC', 'P'],
    },
  },
}

export const Settings = {
  COLS: 10,
  ROWS: 20,
  ROW_BUFFER: 8,
  START_DELAY: 1000,
  REPEAT_DELAY: 170,
  REPEAT_SPEED: 50,
  QUEUE_SIZE: 3,
  LEADERBOARD_ENTRIES_SAVED: 5,
}
