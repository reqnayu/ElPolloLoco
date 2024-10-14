import { MESSAGER } from "../../script.js"
import { CollisionParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class CollisionBehaviour implements Updateable {
	private gameObject!: GameObject
	cooldown
	cooldownTimer?: Timer
	private damage

	constructor({ damage, cooldown }: CollisionParams) {
		this.damage = damage || 0
		this.cooldown = cooldown || 0
	}

	onAttach(gameObject: GameObject): this {
		// console.log(`attatching collisionBehaviour to ${gameObject.name}`)
		this.gameObject = gameObject
		MESSAGER.dispatch("collisionManager").allObjects.push(gameObject)
		return this
	}

	update(deltaTime: number): void {}

	collide(target: GameObject): void {
		// console.log(`collision detected between ${this.gameObject.name} and ${target.name}.`)
		if (this.cooldown) this.addCollisionCooldown()
		this.gameObject.health?.recieveDamage(target.collisionBehaviour!.damage)
	}

	private addCollisionCooldown(): void {
		this.cooldownTimer?.reset()
		this.cooldownTimer = new Timer({
			handler: () => {
				this.cooldownTimer = undefined
				// console.log(`collisionCooldown removed from ${this.gameObject.name}!`)
			},
			timeout: this.cooldown
		})
		this.cooldownTimer.resume()
		if (this.gameObject.name !== "player") return
		// console.log(`collisionCooldown added to ${this.gameObject.name}!`)
	}
}
