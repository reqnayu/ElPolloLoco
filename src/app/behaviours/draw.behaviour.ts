import { GameObject } from "../modules/gameObjects/gameObject.object.js"
import { Drawable } from "../.types/behaviours.interface.js"
import { Frame } from "../.types/frame.type.js"

export class DrawBehaviour implements Drawable {
	private gameObject!: GameObject
	scaleFactor = 1 / 2000

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`drawBehaviour added to '${gameObject.name}'`)
		return this
	}

	draw(ctx: CanvasRenderingContext2D): void {
		const frame = this.requestFrame(ctx.canvas)
		const { image, dx: rawDx, dy: rawDy, dWidth, dHeight, direction } = frame
		if (image === undefined) return
		ctx.save()
		ctx.scale(direction, 1)
		ctx.translate(direction === 1 ? 0 : -dWidth, ctx.canvas.height)

		const dx = rawDx * direction
		const dy = -rawDy - dHeight
		ctx.drawImage(image, dx, dy, dWidth, dHeight)

		ctx.restore()
	}

	private requestFrame(canvas: HTMLCanvasElement): Frame {
		return this.scaleToCanvas(
			{
				image: this.gameObject.image!,
				dx: this.gameObject.position.x,
				dy: this.gameObject.position.y,
				dWidth: this.gameObject.dimensions.x,
				dHeight: this.gameObject.dimensions.y,
				direction: this.gameObject.direction
			},
			canvas
		)
	}

	private scaleToCanvas({ image, dx, dy, dWidth, dHeight, direction }: Frame, canvas: HTMLCanvasElement): Frame {
		const scale = this.scaleFactor * canvas.width
		return {
			image,
			dx: dx * scale,
			dy: dy * scale,
			dWidth: dWidth * scale,
			dHeight: dHeight * scale,
			direction
		}
	}
}
