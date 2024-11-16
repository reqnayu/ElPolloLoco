import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Timer from "../modules/timer.module.js"

export default class DeadState implements State {
	type: keyof stateMap = "dead"
	timers: Timer[] = []
	public enter(gameObject: GameObject): void {
		// console.log(`${gameObject.name} entering dead state!`)
		gameObject.animationBehaviour?.setAnimation("dead", () => {})
		gameObject.collisionBehaviour = undefined
		gameObject.movementBehaviour!.jump()
		gameObject.gravityBehavior!.canFallThroughFloor = true
	}

	public update(gameObject: GameObject, deltaTime: number): void {}

	public exit(gameObject: GameObject): void {}
}
