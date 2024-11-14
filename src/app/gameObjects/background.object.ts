import { MESSAGER } from "../../script.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { Display } from "../util/devtools.util.js"
import { modPos } from "../util/general.util.js"
import { GameObject } from "./gameObject.object.js"

class BackgroundElement extends GameObject {
	private camera

	get totalWidth(): number {
		return this.dimensions.x * (this.camera.resolution.x / this.camera.zoom)
	}

	constructor(public layerNumber: number) {
		super("background")
		this.camera = MESSAGER.dispatch("main").renderer.camera
	}

	async initialize(imgSrc: string): Promise<void> {
		super.initialize(imgSrc)
		this.setBehaviours()
		this.initializeDimensions()
	}

	private initializeDimensions(): void {
		this.position.x = 0
		this.dimensions.set(this.camera._baseResolution.x * 2, this.camera._baseResolution.y)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	private parallaxFactor = (2 - this.layerNumber) / 3

	draw(ctx: CanvasRenderingContext2D): void {
		const baseOffsetX = this.camera._focus.x * this.parallaxFactor
		const loopOffsetX = Math.floor((this.camera.focus.x - baseOffsetX) / this.dimensions.x) * this.dimensions.x

		const numRepeats = Math.ceil(this.camera.resolution.x / this.dimensions.x) + 1
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
	private camera

	constructor() {
		super("background")
		this.camera = MESSAGER.dispatch("main").renderer.camera
		this.dimensions.setToVector(this.camera.resolution.scale(this.camera.maxZoom / this.camera.zoom))
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
		this.position.setToVector(MESSAGER.dispatch("main").renderer.camera.focus)
	}
}

// this.elements.forEach((el) => el.updateBackground())
