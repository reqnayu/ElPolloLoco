import { MESSAGER } from "../../script.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { GameObject } from "./gameObject.object.js"

@Assets({
	img: ["5_background/layers/4_clouds/full.png"]
})
export class Clouds extends GameObject {
	direction: 1 | -1 = -1
	private windSpeed = 0.5
	private posX = 0
	private cameraResolution

	constructor() {
		super("clouds")
		this.cameraResolution = MESSAGER.dispatch("main").renderer.camera.baseResolution
		this.initialize("5_background/layers/4_clouds/full.png")
		console.log(`wind speed: ${this.windSpeed}`)
	}

	protected initialize(imgSrc: string): void {
		this.setBehaviours()
		this.dimensions.setToVector(this.cameraResolution)
		return super.initialize(imgSrc)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 0.1 }).onAttach(this)
	}

	update(deltaTime: number): void {
		return super.update(deltaTime)
		const { x } = MESSAGER.dispatch("main").renderer.camera.focus
		const cameraOffset = x - this.position.x
		if (cameraOffset > this.cameraResolution.x) {
			this.posX += this.cameraResolution.x * 3
		} else if (cameraOffset < -this.cameraResolution.x) {
			this.posX -= this.cameraResolution.x * 3
		}
		this.posX -= this.windSpeed

		const focusOffset = x + this.posX
		console.log(focusOffset)
		const parallaxFactor = 2 / 3
		this.position.x = focusOffset * parallaxFactor
	}
}
