import { collisionParams, GameObjectType } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import CollisionManager from "../managers/collision.manager.js"
import Timer from "../modules/timer.module.js"

export default class CollisionBehaviour implements Updateable {
	gameObject!: GameObject
	private _cooldown
	public get cooldown(): number {
		return this._cooldown
	}
	private _cooldownTimer?: Timer
	public get cooldownTimer(): Timer | undefined {
		return this._cooldownTimer
	}
	private _damage
	public get damage(): number {
		return this._damage
	}
	public targets: GameObjectType[]
	private _offsets
	public get offsets(): [number, number, number, number] {
		return this._offsets
	}

	constructor({ targets, offsets, damage, cooldown }: collisionParams) {
		this.targets = targets || []
		this._offsets = offsets || [0, 0, 0, 0]
		this._damage = damage || 0
		this._cooldown = cooldown || 0
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		CollisionManager.addObject(gameObject.id, gameObject)
		return this
	}

	public update(deltaTime: number): void {}

	public collide(target: GameObject): void {
		this.gameObject.collisionCallback(target)
	}

	public addCollisionCooldown(...types: GameObjectType[]): void {
		this._cooldownTimer?.reset()
		types.forEach((type) => this.targets.remove(type))
		this._cooldownTimer = new Timer(() => {
			this.targets.push(...types)
			this._cooldownTimer = undefined
		}, this.cooldown).resume()
	}

	public get collider() {
		const [top, right, bottom, left] = this._offsets
		const x = this.gameObject.position.x + left
		const y = this.gameObject.position.y + bottom
		const width = this.gameObject.Dimensions.x - left - right
		const height = this.gameObject.Dimensions.y - bottom - top
		return { x, y, width, height }
	}
}
