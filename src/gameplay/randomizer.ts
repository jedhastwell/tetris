import { ShapeId, ShapeProvider } from '../types'

class Randomizer implements ShapeProvider {
  private batch: ShapeId[]

  constructor() {
    this.batch = []
  }

  private fill(): void {
    this.batch.push(ShapeId.I)
    this.batch.push(ShapeId.J)
    this.batch.push(ShapeId.L)
    this.batch.push(ShapeId.O)
    this.batch.push(ShapeId.S)
    this.batch.push(ShapeId.Z)
    this.batch.push(ShapeId.T)
  }

  next(): ShapeId {
    if (!this.batch.length) {
      this.fill()
    }
    const i = Math.floor(Math.random() * this.batch.length)
    return this.batch.splice(i, 1)[0]
  }
}

export default Randomizer
