import { State, stateMap } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class HurtState implements State {
	type: keyof stateMap = "hurt"
	timers: Timer[] = []
	enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation("hurt")
		const hurtTimer = new Timer({
			handler: () => {
				gameObject.setState()
			},
			timeout: gameObject.collisionBehaviour!.cooldown
		})
		this.timers.push(hurtTimer)
		hurtTimer.resume()
		// console.log("entering hurt state")
	}

	update(gameObject: GameObject, deltaTime: number): void {
		// gameObject.movementBehaviour?.move()
	}

	exit(gameObject: GameObject): void {
		this.timers.forEach((timer) => timer.kill())
	}
}
