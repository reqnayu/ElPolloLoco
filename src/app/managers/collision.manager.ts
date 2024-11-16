import { GameObject } from "../gameObjects/gameObject.object.js"

export abstract class CollisionManager {
	private static allObjects: Map<number, GameObject> = new Map()

	public static addObject(id: number, obj: GameObject): void {
		this.allObjects.set(id, obj)
	}

	public static removeObject(id: number): boolean {
		return this.allObjects.delete(id)
	}

	public static getObject(id: number): GameObject | undefined {
		return this.allObjects.get(id)
	}

	public static checkAll(): void {
		const allObjects = Array.from(this.allObjects).map(([id, obj]) => obj)
		const lastIndex = allObjects.length - 1
		for (let i = 0; i < lastIndex; i++) {
			const obj1 = allObjects[i]
			for (let j = i + 1; j < lastIndex + 1; j++) {
				const obj2 = allObjects[j]
				if (!this.areColliding(obj1, obj2)) continue
				obj1.collisionBehaviour!.collide(obj2)
				obj2.collisionBehaviour!.collide(obj1)
			}
		}
	}

	private static areColliding(obj1: GameObject, obj2: GameObject): boolean {
		if (obj1.collisionBehaviour === undefined || obj2.collisionBehaviour === undefined) return false
		if (obj1.collisionBehaviour.cooldownTimer || obj2.collisionBehaviour.cooldownTimer) return false
		if (
			!obj1.collisionBehaviour.targets.includes(obj2.name) ||
			!obj2.collisionBehaviour.targets.includes(obj1.name)
		)
			return false
		const collider1 = obj1.collisionBehaviour.collider
		const collider2 = obj2.collisionBehaviour.collider
		// check x axis overlap
		if (collider1.x + collider1.width < collider2.x || collider1.x > collider2.x + collider2.width) return false
		// check y axis overlap
		if (collider1.y + collider1.height < collider2.y || collider1.y > collider2.y + collider2.height) return false
		// console.log(`${obj1.name} is colliding with ${obj2.name}`)
		return true
	}
}
