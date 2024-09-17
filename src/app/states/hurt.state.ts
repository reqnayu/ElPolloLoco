import { State } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class HurtState implements State {
	timers: Timer[] = []
	enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation("hurt")
		const hurtTimer = new Timer(() => {
			gameObject.setState()
		}, gameObject.collisionBehaviour!.coolDown)
		this.timers.push(hurtTimer)
		hurtTimer.resume()
	}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {
		this.timers.forEach((timer) => timer.kill())
	}
}
