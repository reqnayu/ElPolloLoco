import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class WalkState implements State {
	public type: keyof stateMap = "walk"

	public enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' started walking!`)
		gameObject.animationBehaviour?.setAnimation("walk")
		gameObject.soundBehaviour?.playLooped("Walk")
		gameObject.focusOffset = 400
	}

	public update(gameObject: GameObject, deltaTime: number): void {
		if (gameObject.movementBehaviour?.canMove() === false) return gameObject.setState("idle")
		if (gameObject.movementBehaviour?.canJump() === true) gameObject.setState("jump")
	}

	public exit(gameObject: GameObject): void {
		gameObject.soundBehaviour?.stop("Walk")
		// this.timers.forEach((timer) => timer.kill())
	}
}
