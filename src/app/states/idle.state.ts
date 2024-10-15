import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { State, stateMap } from "../.types/state.type.js"

export class IdleState implements State {
	type: keyof stateMap = "idle"
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' entering idle state!`)
		gameObject.animationBehaviour?.setAnimation("idle")
		this.addIdleLongTimer(gameObject)
		gameObject.focusOffset = 200
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (deltaTime === 0) return
		if (gameObject.movementBehaviour?.canMove() === true) {
			// gameObject.movementBehaviour?.move()
			gameObject.setState("walk")
		}
		if (gameObject.movementBehaviour?.canJump() === true) gameObject.setState("jump")
	}

	exit(gameObject: GameObject): void {
		this.timers.forEach((timer) => timer.kill())
		gameObject.soundBehaviour?.stop("Snore")
	}

	private addIdleLongTimer(gameObject: GameObject): void {
		const longIdleTimer = new Timer({
			handler: () => {
				gameObject.animationBehaviour?.setAnimation("idle_long")
				gameObject.soundBehaviour?.playLooped("Snore")
				gameObject.focusOffset = 0
			},
			timeout: 3000
		}).resume()
		this.timers.push(longIdleTimer)
	}
}
