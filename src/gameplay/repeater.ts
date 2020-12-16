import Phaser from 'phaser'

interface RepeaterConfig {
  callback: (...args: any[]) => any
  callbackScope?: any
  args?: any
  repeatDelay: number
  repeatSpeed: number
}

class Repeater {
  readonly timeEvent: Phaser.Time.TimerEvent

  constructor(
    scene: Phaser.Scene,
    { callback, callbackScope, args, repeatDelay, repeatSpeed }: RepeaterConfig,
  ) {
    this.timeEvent = scene.time.addEvent({
      callback,
      callbackScope,
      args,
      paused: true,
      loop: true,
      delay: repeatSpeed,
      startAt: repeatSpeed - repeatDelay,
    })
  }

  start(): void {
    this.timeEvent.callback.apply(this.timeEvent.callbackScope, this.timeEvent.args)
    this.timeEvent.elapsed = this.timeEvent.startAt
    this.timeEvent.paused = false
  }

  stop(): void {
    this.timeEvent.paused = true
  }
}

export default Repeater
