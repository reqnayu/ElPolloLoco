import { MESSAGER } from "../../script.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class CollisionManager {
	allObjects: GameObject[] = []

	constructor() {
		MESSAGER.elements.set("collisionManager", this)
	}

	checkAll(startIndex = 0): void {
		const lastIndex = this.allObjects.length - 1
		for (let i = startIndex; i < lastIndex; i++) {
			const obj1 = this.allObjects[i]
			const obj2 = this.allObjects[i + 1]
			if (!this.areColliding(obj1, obj2)) continue
			obj1.collisionBehaviour!.collide(obj2)
			obj2.collisionBehaviour!.collide(obj1)
		}
		if (startIndex < lastIndex - 1) return this.checkAll(startIndex + 1)
		this.allObjects = this.allObjects.filter((obj) => !!obj.collisionBehaviour)
	}

	private areColliding(obj1: GameObject, obj2: GameObject): boolean {
		if (!(obj1.collisionBehaviour && obj2.collisionBehaviour)) return false
		if (obj1.collisionBehaviour!.cooldownTimer || obj2.collisionBehaviour!.cooldownTimer) return false
		const collider1 = obj1.collisionBehaviour!.collider
		const collider2 = obj2.collisionBehaviour!.collider
		// check x axis overlap
		if (
			collider1.x + collider1.width < collider2.x ||
			collider1.x > collider2.x + collider2.width
			// obj1.position.x + obj1.dimensions.x < obj2.position.x ||
			// obj1.position.x > obj2.position.x + obj2.dimensions.x
		)
			return false
		// check y axis overlap
		if (
			collider1.y + collider1.height < collider2.y ||
			collider1.y > collider2.y + collider2.height
			// obj1.position.y + obj1.dimensions.y < obj2.position.y ||
			// obj1.position.y > obj2.position.y + obj2.dimensions.y
		)
			return false
		return true
	}
}
