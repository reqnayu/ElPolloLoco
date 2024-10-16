import { MESSAGER } from "../../script.js"
import { collisionParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class CollisionBehaviour implements Updateable {
	gameObject!: GameObject
	cooldown
	cooldownTimer?: Timer
	private damage
	offsets

	constructor({ offsets, damage, cooldown }: collisionParams) {
		this.offsets = offsets
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

		this.gameObject.collisionCallback(target)
		// this.gameObject.health?.recieveDamage(target.collisionBehaviour!.damage)
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

	get collider() {
		const [top, right, bottom, left] = this.offsets || [0, 0, 0, 0]
		const x = this.gameObject.position.x + left
		const y = this.gameObject.position.y + bottom
		const width = this.gameObject.dimensions.x - left - right
		const height = this.gameObject.dimensions.y - bottom - top
		return { x, y, width, height }
	}
}
