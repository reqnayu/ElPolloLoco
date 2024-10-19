import { GameObjectType } from "../.types/gameObject.type.js"
import { GameObjectFactory } from "../factories/gameObject.factory.js"
import { Vector } from "../modules/vector.module.js"
import { roundTo } from "../util/general.util.js"

export class SpawnManager {
	static arch(type: "coin", centerPoint: Vector, radius: number, amount: number): void {
		const positions = this.newForm(amount, (i) => {
			const angle = (i / (amount - 1)) * Math.PI
			return centerPoint.plus(Vector.fromAngleAndRadius(angle, radius))
		})
		this.spawn(type, positions)
	}

	static square(type: "coin", centerPoint: Vector, sideLength: number, rotation: number = 0): void {
		const radius = Math.sqrt(2) * sideLength
		console.log(sideLength, radius)
		const positions = this.newForm(4, (i) => {
			const angle = Math.PI / 4 + rotation + (i * Math.PI) / 2
			return centerPoint.plus(Vector.fromAngleAndRadius(angle, radius))
		})
		this.spawn(type, positions)
	}

	static line(type: "coin", startPoint: Vector, length: number, amount: number, rotation: number = 0): void {
		const positions = this.newForm(amount, (i) => {
			const step = length / (amount - 1)
			// console.log(step * i)
			return startPoint.plus(Vector.fromAngleAndRadius(rotation, step * i))
		})
		this.spawn(type, positions)
	}

	private static spawn(type: "coin", positions: Vector[]): void {
		positions.forEach((pos, i) => {
			console.log(pos, pos.magnitude)
			GameObjectFactory.create(type, { spawnPosition: pos, startFrame: i % 8 })
		})
	}

	private static newForm(amount: number, mapFunc: (i: number) => Vector): Vector[] {
		return Array(amount)
			.fill(null)
			.map((n, i) => mapFunc(i))
	}
}

function radToDeg(rad: number): number {
	return roundTo((rad * 180) / Math.PI)
}
