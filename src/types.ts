export enum ShapeId {
  I = 1,
  J = 2,
  L = 3,
  O = 4,
  S = 5,
  Z = 6,
  T = 7,
}

export enum Orientation {
  UP = 0,
  LEFT = 1,
  DOWN = 2,
  RIGHT = 3,
}

export enum TSpin {
  NONE,
  MINI,
  FULL,
}

export interface Point {
  x: number
  y: number
}

export interface ShapeProvider {
  next(): ShapeId
}

export interface GameStats {
  level: number
  lines: number
  points: number
}

export type PlayfieldCommand =
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateLeft'
  | 'rotateRight'
  | 'hold'

export enum SceneNames {
  PrealoadScene = 'PrealoadScene',
  BootScene = 'BootScene',
  GameScene = 'GameScene',
}
