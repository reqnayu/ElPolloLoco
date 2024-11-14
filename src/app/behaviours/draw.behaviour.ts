import { Drawable } from "../.types/behaviours.interface.js"
import { Frame } from "../.types/frame.type.js"
import { drawParams } from "../.types/behaviour.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { MESSAGER } from "../../script.js"

export class DrawBehaviour implements Drawable {
	private gameObject!: GameObject
	private renderer

	constructor(options: drawParams) {
		this.renderer = MESSAGER.dispatch("main").renderer
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`drawBehaviour added to '${gameObject.name}'`)
		return this
	}

	draw(ctx: CanvasRenderingContext2D): void {
		const frame = this.requestFrame()
		const { image, dx: rawDx, dy: rawDy, dWidth, dHeight, direction } = frame
		ctx.resetTransform()

		const scale = ctx.canvas.width / this.renderer.camera.resolution.x
		ctx.scale(direction * scale, scale)

		const { x, y } = this.renderer.camera.focus
		ctx.translate(-x * direction, y * scale)
		if (direction === 1) ctx.translate(rawDx, ctx.canvas.height / scale)
		else ctx.translate(-(rawDx + dWidth), ctx.canvas.height / scale)
		const dy = -rawDy - dHeight
		ctx.drawImage(image, 0, dy, dWidth, dHeight)
		// if (this.gameObject.collisionBehaviour) this.drawCollider(ctx, 0, dy, dWidth, dHeight)
		ctx.setTransform(1, 0, 0, 1, 0, 0)
	}

	private drawCollider(ctx: CanvasRenderingContext2D, dx: number, dy: number, dWidth: number, dHeight: number): void {
		const [top, right, bottom, left] = this.gameObject.collisionBehaviour?.offsets || [0, 0, 0, 0]
		ctx.strokeRect(dx + left, dy + top, dWidth - left - right, dHeight - bottom - top)
	}

	private requestFrame(): Frame {
		const frame = {
			image: this.gameObject.image!,
			dx: Math.round(this.gameObject.position.x),
			dy: Math.round(this.gameObject.position.y),
			dWidth: Math.round(this.gameObject.dimensions.x),
			dHeight: Math.round(this.gameObject.dimensions.y),
			direction: this.gameObject.direction
		}
		return frame
	}
}
