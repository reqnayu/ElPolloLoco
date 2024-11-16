import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset.manager.js"
import { Camera } from "../modules/camera.module.js"
import { GameObject } from "./gameObject.object.js"

class BackgroundElement extends GameObject {
	get totalWidth(): number {
		return this.dimensions.x * (Camera.resolution.x / Camera.zoom)
	}

	constructor(public layerNumber: number) {
		super("background")
	}

	async initialize(imgSrc: string): Promise<void> {
		super.initialize(imgSrc)
		this.setBehaviours()
		this.initializeDimensions()
	}

	private initializeDimensions(): void {
		this.position.x = 0
		this.dimensions.set(Camera._baseResolution.x * 2, Camera._baseResolution.y)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	private parallaxFactor = (2 - this.layerNumber) / 3

	draw(ctx: CanvasRenderingContext2D): void {
		const baseOffsetX = Camera._focus.x * this.parallaxFactor
		const loopOffsetX = Math.floor((Camera.focus.x - baseOffsetX) / this.dimensions.x) * this.dimensions.x

		const numRepeats = Math.ceil(Camera.resolution.x / this.dimensions.x) + 1
		for (let i = 0; i < numRepeats; i++) {
			this.position.x = baseOffsetX + loopOffsetX + (this.dimensions.x - 1) * i
			super.draw(ctx)
		}
		this.position.x = baseOffsetX
	}
}

@Assets({
	img: [
		"5_background/layers/3_third_layer/full.png",
		"5_background/layers/2_second_layer/full.png",
		"5_background/layers/1_first_layer/full.png",
		"5_background/layers/sky.png"
	]
})
export class Background extends GameObject {
	private elements: BackgroundElement[] = []
	private isLoaded = false
	private srcSet = [
		"5_background/layers/3_third_layer/full.png",
		"5_background/layers/2_second_layer/full.png",
		"5_background/layers/1_first_layer/full.png"
	]

	constructor() {
		super("background")
		this.dimensions.set(Camera.resolution.scale(Camera.maxZoom / Camera.zoom))
		this.setBehaviours()
		this.initialize()
	}

	protected initialize(): void {
		this.srcSet.forEach((src, i) => {
			const elementSet = [new BackgroundElement(i)]
			this.elements.push(...elementSet)
			this.elements[i].initialize(src)
		})
		super.initialize("5_background/layers/sky.png")
		this.isLoaded = true
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.drawBehaviour?.draw(ctx)
		this.elements.forEach((el) => el.draw(ctx))
	}

	update(deltaTime: number): void {
		if (!this.isLoaded) return
		this.position.set(Camera.focus)
	}
}

// this.elements.forEach((el) => el.updateBackground())
