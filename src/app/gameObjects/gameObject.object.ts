import { GameObjectType } from "../.types/gameObject.type.js"
import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { Vector } from "../modules/vector.module.js"
import { State } from "../states/state.state.js"

export class GameObject {
	dimensions = new Vector(0, 0)
	position = new Vector(0, 0)
	image?: CanvasImageSource
	// finishedLoading = false

	direction: -1 | 1 = 1
	input = {
		isMovingRight: false,
		isMovingLeft: false,
		isJumping: false
	}

	private state?: State
	drawBehaviour?: DrawBehaviour
	movementBehaviour?: MovementBehaviour
	gravityBehavoir?: GravityBehaviour
	animationBehaviour?: AnimationBehaviour

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

	setState(newState: State): void {
		this.state?.exit(this)
		this.state = newState
		this.state.enter(this)
	}

	update(deltaTime: number): void {
		// console.log("updating")
		this.animationBehaviour?.update(deltaTime)
		this.movementBehaviour?.update(deltaTime)
		this.gravityBehavoir?.update(deltaTime)

		this.state?.update(this, deltaTime)
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.drawBehaviour?.draw(ctx)
	}

	getCenterPoint(): Vector {
		return this.position.plus(this.dimensions.scale(0.5))
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
