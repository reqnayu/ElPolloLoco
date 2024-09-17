import { MESSAGER } from "../../script.js"
import { CollisionParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class CollisionBehaviour implements Updateable {
	private gameObject!: GameObject
	private allObjects
	coolDown = 1000
	private coolDownTimer?: Timer
	private damage

	constructor(options: CollisionParams = { damage: 0 }) {
		this.damage = options.damage
		this.allObjects = MESSAGER.dispatch("main").allObjects
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}

	update(deltaTime: number): void {
		const collisions = this.checkAll()
		if (collisions.length === 0) return
		collisions.forEach((target) => this.collide(target))
	}

	private checkAll(): GameObject[] {
		return this.allObjects.filter((target) => {
			if (target.collisionBehaviour === undefined) return false
			if (target === this.gameObject) return false
			return this.check(target)
		})
	}

	private check(target: GameObject): boolean {
		// collision cooldown
		if (this.coolDownTimer !== undefined && target.collisionBehaviour?.coolDownTimer !== undefined) return false
		// check alliance
		if (this.gameObject.isFriendly === target.isFriendly) return false
		// check x axis overlap
		if (
			this.gameObject.position.x + this.gameObject.dimensions.x < target.position.x ||
			this.gameObject.position.x > target.position.x + target.dimensions.x
		)
			return false
		// check y axis overlap
		if (
			this.gameObject.position.y + this.gameObject.dimensions.y < target.position.y ||
			this.gameObject.position.y > target.position.y + target.dimensions.y
		)
			return false
		return true
	}

	private collide(target: GameObject): void {
		console.log(`collision detected between ${this.gameObject.name} and ${target.name}.`)
		this.addCollisionCooldown()
		this.gameObject.health?.recieveDamage(target.collisionBehaviour!.damage)
	}

	private addCollisionCooldown(): void {
		this.coolDownTimer?.reset()
		this.coolDownTimer = new Timer(() => {
			this.coolDownTimer = undefined
		}, this.coolDown)
		this.coolDownTimer.resume()
		if (this.gameObject.name !== "player") return
		console.log("collisionCooldown added!")
	}
}
