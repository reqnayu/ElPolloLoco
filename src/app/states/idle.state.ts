import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { JumpState } from "./jump.state.js"
import { State } from "./state.state.js"
import { WalkState } from "./walk.state.js"

export class IdleState implements State {
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' entering idle state!`)
		gameObject.animationBehaviour?.setAnimation("idle")
		gameObject.movementBehaviour!.currentVelocity.x = 0
		this.addIdleLongTimer(gameObject)
		this.addFocusOffsetTimer(gameObject)
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (gameObject.movementBehaviour?.canMove()) {
			const direction = gameObject.input.isMovingRight ? 1 : -1
			gameObject.direction = direction
			gameObject.setState(new WalkState())
		}
		if (gameObject.movementBehaviour?.canJump()) gameObject.setState(new JumpState())
	}

	exit(gameObject: GameObject): void {
		this.timers.forEach((timer) => timer.kill())
	}

	private addIdleLongTimer(gameObject: GameObject): void {
		const longIdleTimer = new Timer(() => gameObject.animationBehaviour?.setAnimation("idle_long"), 3000)
		this.timers.push(longIdleTimer)
		longIdleTimer.resume()
	}

	private addFocusOffsetTimer(gameObject: GameObject): void {
		const focusOffsetTimer = new Timer(() => {
			gameObject.focusOffset = 100
		}, 500)
		this.timers.push(focusOffsetTimer)
		focusOffsetTimer.resume()
	}
}
