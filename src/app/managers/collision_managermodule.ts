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
	}

	private areColliding(obj1: GameObject, obj2: GameObject): boolean {
		if (obj1.collisionBehaviour!.cooldownTimer || obj2.collisionBehaviour!.cooldownTimer) return false
		// check x axis overlap
		if (
			obj1.position.x + obj1.dimensions.x < obj2.position.x ||
			obj1.position.x > obj2.position.x + obj2.dimensions.x
		)
			return false
		// check y axis overlap
		if (
			obj1.position.y + obj1.dimensions.y < obj2.position.y ||
			obj1.position.y > obj2.position.y + obj2.dimensions.y
		)
			return false
		return true
	}
}
