import { State, stateMap } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class DeadState implements State {
	type: keyof stateMap = "dead"
	timers: Timer[] = []
	enter(gameObject: GameObject): void {
		// console.log(`${gameObject.name} entering dead state!`)
		gameObject.animationBehaviour?.setAnimation("dead", false)
		gameObject.collisionBehaviour = undefined
		gameObject.movementBehaviour!.jump()
		gameObject.gravityBehavior!.canFallThroughFloor = true
	}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {}
}
