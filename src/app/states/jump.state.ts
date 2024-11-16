import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class JumpState implements State {
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
