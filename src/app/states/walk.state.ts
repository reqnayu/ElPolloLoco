import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { IdleState } from "./idle.state.js"
import { JumpState } from "./jump.state.js"
import { State } from "./state.state.js"

export class WalkState implements State {
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' started walking!`)
		gameObject.animationBehaviour?.setAnimation("walk")
		gameObject.movementBehaviour?.startWalking()
		gameObject.focusOffset = 400
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (!gameObject.movementBehaviour?.canMove()) gameObject.setState(new IdleState())
		if (gameObject.movementBehaviour?.canJump()) gameObject.setState(new JumpState())
	}

	exit(gameObject: GameObject): void {
		gameObject.movementBehaviour?.stopWalking()
		this.timers.forEach((timer) => timer.kill())
	}
}
