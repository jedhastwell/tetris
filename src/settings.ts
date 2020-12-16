import { PlayfieldCommand } from './types'

export interface ControlSettings {
  Keys: {
    [key in PlayfieldCommand]: string[]
  }
}

export const Controls: ControlSettings = {
  Keys: {
    moveLeft: ['LEFT', 'A'],
    moveRight: ['RIGHT', 'D'],
    softDrop: ['DOWN', 'S'],
    hardDrop: ['SPACE'],
    rotateLeft: ['Z'],
    rotateRight: ['UP', 'X', 'W'],
    hold: ['C'],
  },
}

export const Settings = {
  REPEAT_DELAY: 170,
  REPEAT_SPEED: 50,
  QUEUE_SIZE: 1,
  LOCK_DELAY: 500,
  MAX_LOCK_DELAY_RESETS: 10,
  LEVEL_SPEEDS: {
    1: 800,
    2: 720,
    3: 630,
    4: 550,
    5: 470,
    6: 380,
    7: 300,
    8: 220,
    9: 130,
    10: 100,
    11: 80,
    14: 70,
    17: 50,
    20: 30,
    30: 20,
  },
}
