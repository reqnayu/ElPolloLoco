import { MESSAGER } from "../../script.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { GameObject } from "./gameObject.object.js"

@Assets({
	img: ["5_background/layers/4_clouds/full.png"]
})
export class Clouds extends GameObject {
	direction: 1 | -1 = -1
	private windSpeed = 0.1
	private posX = 0
	private cameraResolution

	constructor() {
		super("clouds")
		this.cameraResolution = MESSAGER.dispatch("main").renderer.camera.baseResolution
		this.initialize("5_background/layers/4_clouds/full.png")
		// console.log(`wind speed: ${this.windSpeed}`)
	}

	protected initialize(imgSrc: string): void {
		this.setBehaviours()
		this.dimensions.setToVector(this.cameraResolution)
		return super.initialize(imgSrc)
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: this.windSpeed }).onAttach(this)
		this.movementBehaviour.input.isMovingLeft = true
	}

	update(deltaTime: number): void {
		super.update(deltaTime)
		const { x } = MESSAGER.dispatch("main").renderer.camera.focus
		const cameraOffset = x - this.position.x
		if (cameraOffset > this.cameraResolution.x) {
			this.position.x += this.cameraResolution.x * 2
		} else if (cameraOffset < -this.cameraResolution.x) {
			this.position.x -= this.cameraResolution.x * 2
		}
		const focusOffset = cameraOffset - this.position.x
		// console.log(focusOffset)
		return
		console.log(this.position.x)
		// const focusOffset = x + this.posX
		const parallaxFactor = 2 / 3
		this.position.x += focusOffset * parallaxFactor
		// this.posX -= this.windSpeed

		console.log(focusOffset)
		super.update(deltaTime)
		// this.position.x = (this.position.x * 2) / 3
	}
}
