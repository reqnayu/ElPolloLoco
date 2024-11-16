import { GameObjectType } from "../.types/gameObject.type.js"
import { State, stateMap } from "../.types/state.type.js"
import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { ResourceBehaviour } from "../behaviours/resources.behaviour.js"
import { SoundBehaviour } from "../behaviours/sound.behaviour.js"
import { TriggerBehaviour } from "../behaviours/trigger.behaviour.js"
import { StateFactory } from "../factories/State.factory.js"
import { AssetManager } from "../managers/asset.manager.js"
import { CollisionManager } from "../managers/collision.manager.js"
import { Main } from "../modules/main.module.js"
import { Vector } from "../modules/vector.module.js"

export abstract class GameObject {
	public readonly id = GameObject.generateId()
	protected dimensions = Vector.zero
	public get Dimensions(): Vector { return this.dimensions }
	position = Vector.zero
	image?: CanvasImageSource

	public direction: -1 | 1 = 1
	protected walkSpeed: number = 0

	public state?: State
	protected states: (keyof stateMap)[] = []
	protected defaultState!: keyof stateMap

	drawBehaviour?: DrawBehaviour
	movementBehaviour?: MovementBehaviour
	gravityBehavior?: GravityBehaviour
	animationBehaviour?: AnimationBehaviour
	collisionBehaviour?: CollisionBehaviour
	soundBehaviour?: SoundBehaviour
	resourceBehaviour?: ResourceBehaviour
	triggerBehaviour?: TriggerBehaviour

	focusOffset?: number
	protected getFocus?(): Vector

	get focusVector(): Vector {
		return this.getFocus?.() || this.getCenterPoint()
	}

	constructor(public name: GameObjectType) {}

	private static counter = 0

	private static generateId(): number {
		return ++this.counter
	}

	protected initialize(imgSrc?: string): void {
		if (imgSrc) this.image = AssetManager.getAsset<"img">(imgSrc)
		Main.addObject(this.id, this)
	}

	protected setBehaviours(): void {}

	setState(stateType: keyof stateMap = this.defaultState): void {
		if (
			!this.states.includes(stateType) ||
			(stateType !== "idle" && this.state?.type === stateType) ||
			this.state?.type === "dead"
		)
			return
		this.state?.exit(this)
		this.state = StateFactory.create(stateType)
		this.state.enter(this)
	}

	update(deltaTime: number): void {
		// console.log("updating")
		this.animationBehaviour?.update(deltaTime)
		this.gravityBehavior?.update(deltaTime)
		this.movementBehaviour?.update(deltaTime)
		this.collisionBehaviour?.update(deltaTime)

		this.state?.update(this, deltaTime)
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.drawBehaviour?.draw(ctx)
	}

	getCenterPoint(): Vector {
		return this.position.plus(this.dimensions.scale(0.5))
	}

	delete(): void {
		Main.removeObject(this.id)
		CollisionManager.removeObject(this.id)
	}

	collisionCallback(target: GameObject): void {}
}

export function getImages(srcs: string[]): CanvasImageSource[]
export function getImages(src: string): CanvasImageSource

export function getImages(src: string | string[]): CanvasImageSource | CanvasImageSource[] {
	if (typeof src === "string") return AssetManager.getAsset<"img">(src)
	return src.map((src) => AssetManager.getAsset<"img">(src))
}

export function getSingleAnimation(path: string, startNumber: number, endNumber: number = startNumber): string[] {
	const assetPaths: string[] = []
	const assetInitial = path
		.split("/")
		.at(-1)!
		.match(/(?<=_?)[a-z]/g)![0]
		.toUpperCase()
	for (let i = startNumber; i <= endNumber; i++) {
		const src = `${path}/${assetInitial}-${i}.png`
		assetPaths.push(src)
	}
	return assetPaths
}
