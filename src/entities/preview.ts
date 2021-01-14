import Phaser from 'phaser'
import { ShapeId } from '../types'

const HEADER_BOTTOM = 126
const BLOCK_HEIGHT = 48
const SLOT_HEIGHT = 144
const SHAPE_IMAGES = '-IJLOSZT'

class PreviewPanel extends Phaser.GameObjects.Container {
  tetrominos: Phaser.GameObjects.Group

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

    this.tetrominos = this.scene.add.group(<Phaser.Types.GameObjects.Group.GroupCreateConfig>{
      key: 'atlas',
      frame: 'tetromino-O',
      repeat: shapeCount,
      visible: false,
      'setXY.y': HEADER_BOTTOM + (BLOCK_HEIGHT + SLOT_HEIGHT) * 0.5,
      'setXY.stepY': SLOT_HEIGHT,
    })
    this.add(this.tetrominos.getChildren())
  }

  updateShapes(value: ShapeId | ShapeId[] | null): void {
    const tetrominos = <Phaser.GameObjects.Image[]>this.tetrominos.getChildren()
    const shapes = Array.isArray(value) ? value : [value]

    tetrominos.forEach((image, i) => {
      const shapeId = shapes[i]
      image.setVisible(!!shapeId)
      if (!!shapeId) {
        image.setFrame(`tetromino-${SHAPE_IMAGES[shapeId]}`)
      }
    })
  }
}

export default PreviewPanel
