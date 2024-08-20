import { MESSAGER } from "../../script.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { AnimationState } from "../.types/animation.type.js"
import { AnimationParams } from "../.types/behaviour.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class AnimationBehaviour implements Updateable {
	private gameObject!: GameObject
	framesPerImage = 30
	private currentAnimation: CanvasImageSource[] = []
	currentAnimationState!: AnimationState
	private currentFrameIndex = 0
	private currentImage?: CanvasImageSource

	animationSet

	constructor(options: AnimationParams) {
		this.animationSet = options.animationSet
	}

	onAttach(gameObject: GameObject): this {
		// console.log(`animationBehaviour added to '${gameObject.name}'`)
		this.gameObject = gameObject

		this.setAnimation("idle")
		return this
	}

	update(deltaTime: number): void {
		if (MESSAGER.dispatch("main").currentFrame % this.framesPerImage > 0) return
		this.advanceFrame()
	}

	private advanceFrame() {
		const isOnLastFrame = this.currentFrameIndex === this.currentAnimation.length - 1
		this.currentImage = this.currentAnimation[this.currentFrameIndex]
		this.gameObject.image = this.currentImage
		this.currentFrameIndex = isOnLastFrame ? 0 : this.currentFrameIndex + 1
	}

	setAnimation(animationName: AnimationState): void {
		this.currentAnimation = this.animationSet[animationName]
		this.currentFrameIndex = 0

		// this.gameObject.currentAnimation = this.gameObject.animations[animationName]
		// this.gameObject.currentImage = this.gameObject.currentAnimation[0]
	}
}
