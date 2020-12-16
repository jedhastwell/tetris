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

export type PlayfieldCommand =
  | 'moveLeft'
  | 'moveRight'
  | 'softDrop'
  | 'hardDrop'
  | 'rotateLeft'
  | 'rotateRight'
  | 'hold'
