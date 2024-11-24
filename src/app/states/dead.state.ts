import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class DeadState implements State {
	public type: keyof stateMap = "dead"
	public enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation("dead", () => {})
		gameObject.collisionBehaviour = undefined
		gameObject.movementBehaviour!.jump()
		gameObject.gravityBehavior!.canFallThroughFloor = true
	}

	public update(gameObject: GameObject, deltaTime: number): void {}

	public exit(gameObject: GameObject): void {}
}
