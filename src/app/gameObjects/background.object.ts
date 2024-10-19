import { MESSAGER } from "../../script.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets, getAsset } from "../managers/asset_manager.module.js"
import { GameObject } from "./gameObject.object.js"

class BackgroundElement extends GameObject {
	private totalWidth
	private cameraResolution
	private xOffset

	constructor(public layerNumber: number, xOffset: boolean) {
		super("background")
		this.cameraResolution = MESSAGER.dispatch("main").renderer.camera.baseResolution
		this.totalWidth = this.cameraResolution.x * 2
		this.xOffset = xOffset ? this.totalWidth - 1 : 0
	}

	async initialize(imgSrc: string): Promise<void> {
		super.initialize(imgSrc)
		this.setBehaviours()
		this.initializeDimensions()
	}

	private initializeDimensions(): void {
		const { width: imgWidth, height: imgHeight } = this.image as HTMLImageElement
		const aspectRatio = imgWidth / imgHeight
		this.position.x = this.xOffset
		this.dimensions.set(this.totalWidth, this.totalWidth / aspectRatio)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	updateBackground(focusX: number): void {
		const parallaxFactor = (2 - this.layerNumber) / 3
		this.position.x = focusX * parallaxFactor + this.xOffset
		const offset = focusX - this.position.x
		if (offset > this.totalWidth) {
			this.position.x += this.totalWidth * 2 - 2
		} else if (offset < -this.totalWidth) {
			this.position.x -= this.totalWidth * 2 - 2
		}
	}
}

@Assets({
	img: [
		"5_background/layers/3_third_layer/full.png",
		"5_background/layers/2_second_layer/full.png",
		"5_background/layers/1_first_layer/full.png",
		"5_background/layers/air.png"
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
	private cameraResolution

	constructor() {
		super("background")
		this.cameraResolution = MESSAGER.dispatch("main").renderer.camera.baseResolution
		this.dimensions.setToVector(this.cameraResolution.scale(1.05))
		this.initialize()
	}

	protected initialize(): void {
		this.srcSet.forEach((src, i) => {
			const elementSet = [new BackgroundElement(i, false), new BackgroundElement(i, true)]
			this.elements.push(...elementSet)
		})
		this.setBehaviours()
		this.elements.forEach((el, i) => el.initialize(this.srcSet[Math.floor(i / 2)]))
		super.initialize("5_background/layers/air.png")
		this.isLoaded = true
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.drawBehaviour?.draw(ctx)
		this.elements.forEach((el) => el.drawBehaviour?.draw(ctx))
	}

	update(deltaTime: number): void {
		if (!this.isLoaded) return
		const { focus } = MESSAGER.dispatch("main").renderer.camera
		this.position = focus
		this.position.x -= 10
		this.elements.forEach((el) => el.updateBackground(focus.x))
	}
}
