import { GameObject } from "../modules/gameObjects/gameObject.object.js"
import { IdleState } from "./idle.state.js"
import { JumpState } from "./jump.state.js"
import { State } from "./state.state.js"

export class WalkState implements State {
	enter(gameObject: GameObject): void {
		console.log(`'${gameObject.name}' started walking!`)
		gameObject.animationBehaviour?.setAnimation("walk")
		gameObject.movementBehaviour?.startWalking()
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (!gameObject.canMove()) gameObject.setState(new IdleState())
		if (gameObject.canJump()) gameObject.setState(new JumpState())
	}

	exit(gameObject: GameObject): void {
		gameObject.movementBehaviour?.stopWalking()
	}
}
