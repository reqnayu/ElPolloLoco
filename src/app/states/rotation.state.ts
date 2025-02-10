import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class RotationState implements State {
  public type: keyof stateMap = "rotation"
  public enter(gameObject: GameObject): void {
    gameObject.animationBehaviour?.setAnimation("rotation")
  }

  public update(gameObject: GameObject, deltaTime: number): void {}

  public exit(gameObject: GameObject): void {}
}
