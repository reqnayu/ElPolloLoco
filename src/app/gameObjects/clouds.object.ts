import { MESSAGER } from "../../script.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { GameObject } from "./gameObject.object.js"

export class Clouds extends GameObject {
	private windSpeed = 0.5
	private posX = 0
	private cameraResolution

	constructor() {
		super("clouds")
		this.cameraResolution = MESSAGER.dispatch("main").renderer.camera.baseResolution
		this.initialize("./app/assets/img/5_background/layers/4_clouds/full.png")
	}

	protected initialize(imgSrc: string): Promise<void> {
		this.setBehaviours()
		this.dimensions.setToVector(this.cameraResolution)
		return super.initialize(imgSrc)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	update(deltaTime: number): void {
		const { x } = MESSAGER.dispatch("main").renderer.camera.focus
		const cameraOffset = x - this.position.x
		if (cameraOffset > this.cameraResolution.x) {
			this.posX += this.cameraResolution.x * 3
		} else if (cameraOffset < -this.cameraResolution.x) {
			this.posX -= this.cameraResolution.x * 3
		}
		this.posX -= this.windSpeed

		const focusOffset = x + this.posX
		const parallaxFactor = 2 / 3
		this.position.x = focusOffset * parallaxFactor
	}
}
