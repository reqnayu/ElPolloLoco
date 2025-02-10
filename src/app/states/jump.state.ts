import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class JumpState implements State {
  public type: keyof stateMap = "jump"
  public enter(gameObject: GameObject): void {
    gameObject.animationBehaviour?.setAnimation("jump")
    gameObject.movementBehaviour?.jump()
    gameObject.soundBehaviour?.playOnce("Jump")
  }

  public update(gameObject: GameObject, deltaTime: number): void {}

  public exit(gameObject: GameObject): void {
    gameObject.soundBehaviour?.playOnce("Landing")
  }
}
