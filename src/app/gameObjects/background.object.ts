import { MESSAGER } from "../../script.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { GameObject } from "./gameObject.object.js"

class BackgroundElement extends GameObject {
	private totalWidth = 0
	private baseResolutionWidth
	private xOffset

	constructor(public layerNumber: number, xOffset: boolean) {
		super(`Background_layer_${layerNumber}`)
		this.baseResolutionWidth = MESSAGER.dispatch("main").renderer.baseResolutionWidth
		this.xOffset = xOffset ? this.baseResolutionWidth * 2 - 1 : 0
	}

	async initialize(imgSrc: string): Promise<void> {
		await super.initialize(imgSrc)
		this.setBehaviours()
		this.initializeDimensions()
	}

	private initializeDimensions(): void {
		const { width: imgWidth, height: imgHeight } = this.image as HTMLImageElement
		const aspectRatio = imgWidth / imgHeight
		this.totalWidth = this.baseResolutionWidth * 2
		this.position.x = this.xOffset
		this.dimensions.set(this.totalWidth, this.totalWidth / aspectRatio)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	updateBackground(focusX: number): void {
		const parallaxFactor = (2 - this.layerNumber) / 2
		this.position.x = focusX * parallaxFactor + this.xOffset
		const offset = focusX - this.position.x
		if (offset > this.totalWidth) {
			this.position.x += this.totalWidth * 2 - 2
		} else if (offset < -this.totalWidth) {
			this.position.x -= this.totalWidth * 2 - 2
		}
	}
}

export class Background extends GameObject {
	private elements: BackgroundElement[] = []
	private isLoaded = false
	private srcSet = [
		"app/assets/img/5_background/layers/3_third_layer/full.png",
		"app/assets/img/5_background/layers/2_second_layer/full.png",
		"app/assets/img/5_background/layers/1_first_layer/full.png"
	]

	constructor() {
		super("Background")
		this.initialize()
	}

	protected async initialize(): Promise<void> {
		this.srcSet.forEach((src, i) => {
			const elementSet = [new BackgroundElement(i, false), new BackgroundElement(i, true)]
			// const elementSet = [new BackgroundElement(i, false)]
			this.elements.push(...elementSet)
		})
		await Promise.all(this.elements.map((el, i) => el.initialize(this.srcSet[Math.floor(i / 2)])))
		await super.initialize("./app/assets/img/5_background/layers/air.png")
		this.isLoaded = true
	}

	draw(ctx: CanvasRenderingContext2D): void {
		super.draw(ctx)
		this.elements.forEach((el) => el.draw(ctx))
	}

	update(deltaTime: number): void {
		if (!this.isLoaded) return
		const { focus } = MESSAGER.dispatch("main").renderer.camera
		// console.log(focus.x, this.elements[0].position.x)
		this.elements.forEach((el) => el.updateBackground(focus.x))
	}
}
