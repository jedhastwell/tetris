import Phaser from 'phaser'
import { ShapeId } from '../types'

const HEADER_BOTTOM = 126
const BLOCK_HEIGHT = 48
const SLOT_HEIGHT = 144
const SHAPE_IMAGES = '-IJLOSZT'

class PreviewPanel extends Phaser.GameObjects.Container {
  shapeObjects: Phaser.GameObjects.Image[]
  shapeCount: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    shapeCount: number,
    heading: 'hold' | 'next',
  ) {
    super(scene, x, y)

    const header = this.scene.add.image(0, 0, 'atlas', 'preview-panel-top')
    header.setOrigin(0.5, 0)

    const { x: fillX, y: fillY } = header.getBottomCenter()
    const fill = this.scene.add.image(fillX, fillY, 'atlas', 'preview-panel-fill')
    fill.displayHeight = BLOCK_HEIGHT * 0.5 + SLOT_HEIGHT * shapeCount
    fill.setOrigin(0.5, 0)

    const { x: footerX, y: footerY } = fill.getBottomCenter()
    const footer = this.scene.add.image(footerX, footerY, 'atlas', 'preview-panel-bottom')
    footer.setOrigin(0.5, 0)

    const title = this.scene.add.image(0, 80, 'atlas', `heading-${heading}`)

    this.add(header)
    this.add(fill)
    this.add(footer)
    this.add(title)

    this.shapeObjects = []
    this.shapeCount = shapeCount
  }

  updateShapes(value: ShapeId | ShapeId[] | null): void {
    if (value) {
      const shapes = Array.isArray(value) ? value : [value]

      shapes.forEach((shapeId, i) => {
        if (i < this.shapeCount) {
          if (!this.shapeObjects[i]) {
            const image = this.scene.add.image(0, 0, 'atlas', 'tetromino-O')
            this.add(image)
            this.shapeObjects.push(image)
          }
          const frame = `tetromino-${SHAPE_IMAGES[shapeId]}`
          this.shapeObjects[i].setTexture('atlas', frame)
          this.shapeObjects[i].setPosition(
            0,
            HEADER_BOTTOM + BLOCK_HEIGHT * 0.5 + SLOT_HEIGHT * (i + 0.5),
          )
        }
      })
    }
  }
}

export default PreviewPanel
