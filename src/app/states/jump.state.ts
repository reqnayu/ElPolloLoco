import { State, stateMap } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class JumpState implements State {
	type: keyof stateMap = "jump"
	timers = []
	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' entering Jump state!`)
		gameObject.animationBehaviour?.setAnimation("jump")
		gameObject.movementBehaviour?.jump()
		gameObject.soundBehaviour?.playOnce("Jump")
	}

	update(gameObject: GameObject, deltaTime: number): void {
		// gameObject.movementBehaviour?.move()
	}

	exit(gameObject: GameObject): void {
		gameObject.soundBehaviour?.playOnce("Landing")
	}
}
