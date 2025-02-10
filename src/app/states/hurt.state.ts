import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Timer from "../modules/timer.module.js"

export default class HurtState implements State {
  public type: keyof stateMap = "hurt"
  public timers: Timer[] = []
  public enter(gameObject: GameObject): void {
    gameObject.animationBehaviour?.setAnimation("hurt")
    const hurtTimer = new Timer(() => gameObject.setState(), gameObject.collisionBehaviour!.cooldown)
    this.timers.push(hurtTimer)
    hurtTimer.resume()
  }

  public update(gameObject: GameObject, deltaTime: number): void {}

  public exit(gameObject: GameObject): void {
    this.timers.forEach((timer) => timer.kill())
  }
}
