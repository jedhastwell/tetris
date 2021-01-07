import Phaser from 'phaser'

type GameObject = Phaser.GameObjects.GameObject
type Image = Phaser.GameObjects.Image
type Text = Phaser.GameObjects.Text

export enum ButtonState {
  Up = 0,
  Down = 1,
}

export const ButtonEvents = {
  STATE_CHANGED: 'STATE_CHANGED',
  CLICKED: 'CLICKED',
}

export function attachButtonBehavior(object: GameObject): GameObject {
  let state = ButtonState.Up
  object.setData('buttonState', ButtonState.Down)

  const setState = (value: ButtonState): void => {
    if (state !== value) {
      object.setData('buttonState', value)
      object.emit(ButtonEvents.STATE_CHANGED, object, value, state)
      state = value
    }
  }

  const handleDown = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.leftButtonDown()) {
      setState(ButtonState.Down)
    }
  }

  const handleOut = (): void => {
    setState(ButtonState.Up)
  }

  const handleUp = (pointer: Phaser.Input.Pointer): void => {
    if (state === ButtonState.Down && pointer.leftButtonReleased()) {
      setState(ButtonState.Up)
      object.emit(ButtonEvents.CLICKED, object)
    }
  }

  object.setInteractive()
  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, handleDown)
  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, handleDown)
  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, handleOut)
  object.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, handleUp)

  return object
}

class Button extends Phaser.GameObjects.Container {
  public image: Image
  public text: Text

  private emitClicked = (): boolean => this.emit(ButtonEvents.CLICKED, this)

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y)

    this.image = this.scene.add.image(0, 0, 'atlas', 'button-lg-up')
    this.add(this.image)

    this.text = this.scene.add.text(0, 0, text, {
      fontFamily: 'Rubik',
      fontSize: '60px',
      shadow: { fill: true, color: '#A47E2D', offsetY: 4 },
    })
    this.text.setOrigin(0.5, 0.6)
    this.add(this.text)

    attachButtonBehavior(this.image)
    this.image.on(ButtonEvents.STATE_CHANGED, (object: GameObject, newState: ButtonState) => {
      if (newState === ButtonState.Down) {
        this.text.y = 6
        this.image.setFrame('button-lg-down')
      } else {
        this.text.y = 0
        this.image.setFrame('button-lg-up')
      }
    })

    this.image.on(ButtonEvents.CLICKED, () => this.emitClicked())
  }
}

export default Button
