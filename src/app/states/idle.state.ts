import { GameObject } from "../modules/gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { JumpState } from "./jump.state.js"
import { State } from "./state.state.js"
import { WalkState } from "./walk.state.js"

export class IdleState implements State {
	private timeToLongIdle = 3 * 1000
	private longIdleTimer!: Timer

	enter(gameObject: GameObject): void {
		// console.log(`'${gameObject.name}' entering idle state!`)
		gameObject.animationBehaviour?.setAnimation("idle")
		gameObject.movementBehaviour!.currentVelocity.x = 0
		this.addIdleLongTimer(gameObject)
	}

	update(gameObject: GameObject, deltaTime: number): void {
		if (gameObject.canMove()) {
			const direction = gameObject.input.isMovingRight ? 1 : -1
			gameObject.direction = direction
			gameObject.setState(new WalkState())
		}
		if (gameObject.canJump()) gameObject.setState(new JumpState())
	}

	exit(gameObject: GameObject): void {
		this.longIdleTimer?.reset()
		this.longIdleTimer?.dispose()
	}

	private addIdleLongTimer(gameObject: GameObject): void {
		this.longIdleTimer = new Timer(
			() => gameObject.animationBehaviour?.setAnimation("idle_long"),
			this.timeToLongIdle
		)
		this.longIdleTimer.resume()
	}
}
