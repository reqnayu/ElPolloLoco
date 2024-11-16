import { Drawable } from "../.types/interfaces.js"
import { Frame } from "../.types/types.js"
import { drawParams } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Camera from "../modules/camera.module.js"

export default class DrawBehaviour implements Drawable {
	private gameObject!: GameObject

	constructor(options: drawParams) {}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`drawBehaviour added to '${gameObject.name}'`)
		return this
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		const frame = this.requestFrame()
		const { image, dx: rawDx, dy: rawDy, dWidth, dHeight, direction } = frame
		ctx.resetTransform()

		const scale = ctx.canvas.width / Camera.resolution.x
		ctx.scale(direction * scale, scale)

		const { x, y } = Camera.focus
		ctx.translate(-x * direction, y * scale)
		if (direction === 1) ctx.translate(rawDx, ctx.canvas.height / scale)
		else ctx.translate(-(rawDx + dWidth), ctx.canvas.height / scale)
		const dy = -rawDy - dHeight
		ctx.drawImage(image, 0, dy, dWidth, dHeight)
		// if (this.gameObject.collisionBehaviour) this.drawCollider(ctx, 0, dy, dWidth, dHeight)
		ctx.setTransform(1, 0, 0, 1, 0, 0)
	}

	public drawCollider(ctx: CanvasRenderingContext2D, dx: number, dy: number, dWidth: number, dHeight: number): void {
		const [top, right, bottom, left] = this.gameObject.collisionBehaviour?.offsets || [0, 0, 0, 0]
		ctx.strokeRect(dx + left, dy + top, dWidth - left - right, dHeight - bottom - top)
	}

	private requestFrame(): Frame {
		const frame = {
			image: this.gameObject.image!,
			dx: Math.round(this.gameObject.position.x),
			dy: Math.round(this.gameObject.position.y),
			dWidth: Math.round(this.gameObject.Dimensions.x),
			dHeight: Math.round(this.gameObject.Dimensions.y),
			direction: this.gameObject.direction
		}
		return frame
	}
}
