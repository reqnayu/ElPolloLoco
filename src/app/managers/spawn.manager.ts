import GameObjectFactory from "../factories/gameObject.factory.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"

export default abstract class SpawnManager {
	public static initialize(): void {
		for (
			let spawnPosition = this.getRandomSpawnDistance();
			spawnPosition < 5000;
			spawnPosition += this.getRandomSpawnDistance()
		) {
			// Util.randomize([this.square, this.arch, this.line]).call(this, spawnPosition)
			this.line(spawnPosition)
		}
	}

	private static getRandomSpawnDistance(): number {
		// return Util.randomize(800, 1600, true)
		return 600
	}

	private static arch(spawnPosition: number): void {
		const amount = 5
		const radius = 200
		const verticalPosition = 180
		const centerPoint = new Vector(spawnPosition, verticalPosition)
		const positions = this.newForm(amount, (i) => {
			const angle = (i / (amount - 1)) * Math.PI
			return centerPoint.plus(Vector.fromAngleAndRadius(angle, radius))
		})
		this.spawn(positions)
	}

	private static square(spawnPosition: number): void {
		const sideLength = 100
		const rotation = Math.PI / 4
		const radius = Math.sqrt(2) * sideLength
		const verticalPosition = 100
		const centerPoint = new Vector(spawnPosition, verticalPosition)
		const positions = this.newForm(4, (i) => {
			const angle = Math.PI / 4 + rotation + (i * Math.PI) / 2
			return centerPoint.plus(Vector.fromAngleAndRadius(angle, radius))
		})
		this.spawn(positions)
	}

	private static line(spawnPosition: number): void {
		const length = 400
		const amount = 5
		const rotation = 0
		const verticalPosition = Util.randomize(40, 120, true)
		const centerPoint = new Vector(spawnPosition, verticalPosition)
		const startPoint = centerPoint.plus(Vector.fromAngleAndRadius(-rotation, length / 2))
		const positions = this.newForm(amount, (i) => {
			const step = length / (amount - 1)
			return startPoint.plus(Vector.fromAngleAndRadius(rotation, step * i))
		})
		this.spawn(positions)
	}

	private static spawn(positions: Vector[]): void {
		positions.forEach((pos, i) => {
			GameObjectFactory.create("coin", { spawnPosition: pos, startFrame: i % 8 })
		})
	}

	private static newForm(amount: number, mapFunc: (i: number) => Vector): Vector[] {
		return Array(amount)
			.fill(null)
			.map((n, i) => mapFunc(i))
	}
}
