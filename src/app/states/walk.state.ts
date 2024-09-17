import { State } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class WalkState implements State {
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' started walking!`)
		gameObject.animationBehaviour?.setAnimation("walk")
		gameObject.movementBehaviour?.startWalking()
		gameObject.focusOffset = 400
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (gameObject.canMove() === false) gameObject.setState("idle")
		if (gameObject.canJump() === true) gameObject.setState("jump")
	}

	exit(gameObject: GameObject): void {
		gameObject.movementBehaviour?.stopWalking()
		this.timers.forEach((timer) => timer.kill())
	}
}
