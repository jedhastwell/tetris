import Phaser from 'phaser'
import { ShapeId } from '../types'

const HEADER_BOTTOM = 126
const BLOCK_HEIGHT = 48
const SLOT_HEIGHT = 144
const SHAPE_IMAGES = '-IJLOSZT'

class PreviewPanel extends Phaser.GameObjects.Container {
  tetrominos: Phaser.GameObjects.Group
  rotationOffset: number

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

    const { x: fillX, y: fillY } = header.getBottomCenter<Phaser.Math.Vector2>()
    const fill = this.scene.add.image(fillX, fillY, 'atlas', 'preview-panel-fill')
    fill.displayHeight = BLOCK_HEIGHT * 0.5 + SLOT_HEIGHT * shapeCount
    fill.setOrigin(0.5, 0)

    const { x: footerX, y: footerY } = fill.getBottomCenter<Phaser.Math.Vector2>()
    const footer = this.scene.add.image(footerX, footerY, 'atlas', 'preview-panel-bottom')
    footer.setOrigin(0.5, 0)

    const title = this.scene.add.image(0, 80, 'atlas', `heading-${heading}`)

    this.add(header)
    this.add(fill)
    this.add(footer)
    this.add(title)

    this.rotationOffset = 0

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
    const initialSlotY = HEADER_BOTTOM + (BLOCK_HEIGHT + SLOT_HEIGHT) * 0.5
    const duration = 200
    const tetrominos = <Phaser.GameObjects.Image[]>this.tetrominos.getChildren()
    const shapes = Array.isArray(value) ? value : [value]
    const images = tetrominos.map(
      (t, i) => tetrominos[(i + this.rotationOffset) % tetrominos.length],
    )
    this.rotationOffset = (this.rotationOffset + 1) % tetrominos.length

    images.forEach((image, i) => {
      const shapeId = shapes[i - 1]
      if (!!shapeId) {
        image.setFrame(`tetromino-${SHAPE_IMAGES[shapeId]}`)
      }

      if (i === 0) {
        image.scale = 1
        this.scene.tweens.add({
          targets: image,
          duration: duration,
          scale: 0,
          alpha: 0,
          ease: Phaser.Math.Easing.Cubic.In,
        })
      } else if (i === images.length - 1) {
        image.y = initialSlotY + SLOT_HEIGHT * (i - 1)
        image.setVisible(!!shapeId)
        image.setScale(0)
        image.setAlpha(0)
        this.scene.tweens.add({
          targets: image,
          duration: duration,
          scale: 1,
          alpha: 1,
          ease: Phaser.Math.Easing.Quadratic.In,
        })
      } else {
        image.setVisible(!!shapeId)
        this.scene.tweens.add({
          targets: image,
          duration: duration,
          y: initialSlotY + SLOT_HEIGHT * (i - 1),
          ease: Phaser.Math.Easing.Quadratic.In,
        })
      }
    })
  }
}

export default PreviewPanel
