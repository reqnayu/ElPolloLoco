import { collisionParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObjectType } from "../.types/gameObject.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { CollisionManager } from "../managers/collision.manager.js"
import { Timer } from "../modules/timer.module.js"

export class CollisionBehaviour implements Updateable {
	gameObject!: GameObject
	cooldown
	cooldownTimer?: Timer
	damage
	targets: GameObjectType[]
	offsets

	constructor({ targets, offsets, damage, cooldown }: collisionParams) {
		this.targets = targets || []
		this.offsets = offsets
		this.damage = damage || 0
		this.cooldown = cooldown || 0
	}

	onAttach(gameObject: GameObject): this {
		// console.log(`attatching collisionBehaviour to ${gameObject.name}`)
		this.gameObject = gameObject
		CollisionManager.addObject(gameObject.id, gameObject)
		return this
	}

	update(deltaTime: number): void {}

	collide(target: GameObject): void {
		// console.log(`collision detected between ${this.gameObject.name} and ${target.name}.`)

		this.gameObject.collisionCallback(target)
		// this.gameObject.health?.recieveDamage(target.collisionBehaviour!.damage)
	}

	addCollisionCooldown(...types: GameObjectType[]): void {
		this.cooldownTimer?.reset()
		types.forEach((type) => this.targets.remove(type))
		this.cooldownTimer = new Timer({
			handler: () => {
				this.targets.push(...types)
				this.cooldownTimer = undefined
				// console.log(`collisionCooldown removed from ${this.gameObject.name}!`)
			},
			timeout: this.cooldown
		}).resume()
		// console.log(`collisionCooldown added to ${this.gameObject.name}!`)
	}

	get collider() {
		const [top, right, bottom, left] = this.offsets || [0, 0, 0, 0]
		const x = this.gameObject.position.x + left
		const y = this.gameObject.position.y + bottom
		const width = this.gameObject.Dimensions.x - left - right
		const height = this.gameObject.Dimensions.y - bottom - top
		return { x, y, width, height }
	}
}
