import { coinParams, enemyParams, GameObjectType, Spawnable } from "../.types/types.js"
import GameObjectFactory from "../factories/gameObject.factory.js"
import Enemy from "../gameObjects/enemy.object.js"
import Settings from "../modules/settings.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"

export default abstract class SpawnManager {
	public static initialize(): void {
		this.initializeCoins()
		this.initializeEnemies()
	}

	private static initializeCoins(): void {
		for (
			let i = Util.randomize(600, 1200, true);
			i < Settings.spawnLocations.endboss;
			i += Util.randomize(600, 1200, true)
		) {
			Util.randomize([this.square, this.arch, this.line]).call(this, i)
		}
	}

	private static initializeEnemies(): void {
		for (
			let i = Util.randomize(400, 1200, true), amount = 0;
			i < Settings.spawnLocations.endboss && amount < Settings.maxAmountOfEnemies;
			i += Util.randomize(400, 1200, true), amount++
		) {
			// console.log(`spawning enemy at positionX: ${i}`)
			this.spawn("enemy", new Vector(i, Settings.floorHeight))
		}
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
		this.spawn("coin", positions)
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
		this.spawn("coin", positions)
	}

	private static line(spawnPosition: number): void {
		const length = 400
		const amount = 5
		const rotation = 0
		const verticalPosition = Util.randomize(40, 220, true)
		const centerPoint = new Vector(spawnPosition, verticalPosition)
		const startPoint = centerPoint.plus(Vector.fromAngleAndRadius(-rotation, length / 2))
		const step = length / (amount - 1)
		const positions = this.newForm(amount, (i) => startPoint.plus(Vector.fromAngleAndRadius(rotation, step * i)))
		this.spawn("coin", positions)
	}

	private static spawn(type: Spawnable, position: Vector): void
	private static spawn(type: Spawnable, positions: Vector[]): void
	private static spawn(type: Spawnable, positionOrPositions: Vector | Vector[]): void {
		const positions = Array.isArray(positionOrPositions) ? positionOrPositions : [positionOrPositions]
		positions.forEach((pos, i) => {
			const params: Partial<coinParams> = { spawnPosition: pos }
			if (type === "coin") params.startFrame = i % 8
			GameObjectFactory.create(type, params as enemyParams | coinParams)
		})
	}

	private static newForm(amount: number, mapFunc: (i: number) => Vector): Vector[] {
		return Array(amount)
			.fill(null)
			.map((n, i) => mapFunc(i))
	}
}
