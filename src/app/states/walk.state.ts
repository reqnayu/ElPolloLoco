import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Timer from "../modules/timer.module.js"

export default class WalkState implements State {
	type: keyof stateMap = "walk"
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' started walking!`)
		gameObject.animationBehaviour?.setAnimation("walk")
		gameObject.soundBehaviour?.playLooped("Walk")
		gameObject.focusOffset = 400
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (gameObject.movementBehaviour?.canMove() === false) return gameObject.setState("idle")
		if (gameObject.movementBehaviour?.canJump() === true) gameObject.setState("jump")
	}

	exit(gameObject: GameObject): void {
		gameObject.soundBehaviour?.stop("Walk")
		this.timers.forEach((timer) => timer.kill())
	}
}
