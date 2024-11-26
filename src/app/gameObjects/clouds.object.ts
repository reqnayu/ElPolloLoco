import BehaviourFactory from "../factories/behaviour.factory.js"
import Camera from "../modules/camera.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

@Util.Assets({
	img: ["5_background/layers/4_clouds/full.png"]
})
export default class Clouds extends GameObject {
	direction: 1 | -1 = -1
	private windSpeed = 0.1

	constructor() {
		super("clouds")
		this.initialize("5_background/layers/4_clouds/full.png")
	}

	protected override initialize(imgSrc: string): void {
		this.setBehaviours()
		this.dimensions.set(Camera.resolution)
		return super.initialize(imgSrc)
	}

	protected override setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: this.windSpeed }).onAttach(this)
		this.movementBehaviour.input.isMovingLeft = true
	}

	public override update(deltaTime: number): void {
		super.update(deltaTime)

		const resolutionX = Camera.resolution.x
		const cameraOffset = Camera.focus.x - this.position.x
		if (cameraOffset > resolutionX) {
			this.position.x += resolutionX * 2
		} else if (cameraOffset < -resolutionX) {
			this.position.x -= resolutionX * 2
		}
	}
}
