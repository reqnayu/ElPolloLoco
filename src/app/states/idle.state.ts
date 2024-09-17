import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { State } from "../.types/state.type.js"

export class IdleState implements State {
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' entering idle state!`)
		gameObject.animationBehaviour?.setAnimation("idle")
		gameObject.movementBehaviour!.currentVelocity.x = 0
		this.addIdleLongTimer(gameObject)
		gameObject.focusOffset = 200
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (gameObject.canMove() === true) {
			const direction = gameObject.input.isMovingRight ? 1 : -1
			gameObject.direction = direction
			gameObject.setState("walk")
		}
		if (gameObject.canJump() === true) gameObject.setState("jump")
	}

	exit(gameObject: GameObject): void {
		this.timers.forEach((timer) => timer.kill())
	}

	private addIdleLongTimer(gameObject: GameObject): void {
		const longIdleTimer = new Timer(() => {
			gameObject.animationBehaviour?.setAnimation("idle_long")
			gameObject.focusOffset = 0
		}, 3000)
		this.timers.push(longIdleTimer)
		longIdleTimer.resume()
	}
}
