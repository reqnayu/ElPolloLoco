import { GameObjectType } from "../.types/gameObject.type.js"
import { State, StateMap } from "../.types/state.type.js"
import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { HealthBehaviour } from "../behaviours/health.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { StateFactory } from "../factories/State.factory.js"
import { Vector } from "../modules/vector.module.js"

export class GameObject {
	dimensions = new Vector(0, 0)
	position = new Vector(0, 0)
	image?: CanvasImageSource

	isFriendly: boolean = false

	direction: -1 | 1 = 1
	input = {
		isMovingRight: false,
		isMovingLeft: false,
		isJumping: false
	}
	protected walkSpeed: number = 0

	private state?: State
	states: (keyof StateMap)[] = []
	protected defaultState!: keyof StateMap

	drawBehaviour?: DrawBehaviour
	movementBehaviour?: MovementBehaviour
	gravityBehavoir?: GravityBehaviour
	animationBehaviour?: AnimationBehaviour
	health?: HealthBehaviour
	collisionBehaviour?: CollisionBehaviour

	focusOffset?: number
	protected getFocus?(): Vector

	get focusVector(): Vector {
		return this.getFocus?.() || this.getCenterPoint()
	}

	constructor(public name: GameObjectType) {}

	protected async initialize(imgSrc: string): Promise<void> {
		await this.setImage(imgSrc)
	}

	protected setBehaviours(): void {}

	private async setImage(imgSrc: string) {
		this.image = await createImage(imgSrc)
	}

	setState(stateType: keyof StateMap = this.defaultState): void {
		if (!this.states.includes(stateType)) return
		this.state?.exit(this)
		this.state = StateFactory.create(stateType)
		this.state.enter(this)
	}

	update(deltaTime: number): void {
		// console.log("updating")
		this.animationBehaviour?.update(deltaTime)
		this.movementBehaviour?.update(deltaTime)
		this.gravityBehavoir?.update(deltaTime)
		this.health?.update(deltaTime)
		this.collisionBehaviour?.update(deltaTime)

		this.state?.update(this, deltaTime)
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.drawBehaviour?.draw(ctx)
	}

	getCenterPoint(): Vector {
		return this.position.plus(this.dimensions.scale(0.5))
	}

	canMove(): boolean {
		return false
	}

	canJump(): boolean {
		return false
	}
}
export async function getImages(srcs: string[]): Promise<CanvasImageSource[]>
export async function getImages(src: string): Promise<CanvasImageSource>

export async function getImages(src: string | string[]): Promise<CanvasImageSource | CanvasImageSource[]> {
	if (typeof src === "string") return createImage(src)
	return Promise.all(src.map((src) => createImage(src)))
}

async function createImage(src: string): Promise<CanvasImageSource> {
	const img = new Image()
	img.src = src
	return new Promise((resolve, reject) => {
		img.onload = () => resolve(img)
		setTimeout(() => reject(src), 5000)
	})
}

export function getSingleAnimation(
	path: string,
	startNumber: number,
	endNumber: number = startNumber
): Promise<CanvasImageSource[]> {
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
	return getImages(assetPaths)
}
