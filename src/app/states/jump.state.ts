import { State } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { IdleState } from "./idle.state.js"

export class JumpState implements State {
	timers = []
	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' entering Jump state!`)
		gameObject.animationBehaviour?.setAnimation("jump")
		gameObject.movementBehaviour?.jump()
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (!gameObject.gravityBehavoir?.canFall()) gameObject.setState("idle")
	}

	exit(gameObject: GameObject): void {}
}
