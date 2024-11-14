import { MESSAGER } from "../../script.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { AnimationSet } from "../.types/animation.type.js"
import { animationParams } from "../.types/behaviour.type.js"

export class AnimationBehaviour implements Updateable {
	gameObject!: GameObject
	private frameDuration = 1000 / 8
	private currentAnimation: CanvasImageSource[] = []
	currentFrameIndex = 0
	private currentImage?: CanvasImageSource
	private timeOfLastFrame = 0
	private shouldLoop = true
	private shouldAlternate = false
	animationSet
	endOfAnimationCallback?: () => void
	private isPlaying = true

	constructor({ animationSet }: animationParams) {
		this.animationSet = animationSet
	}

	setAnimation(
		animationName: keyof AnimationSet,
		shouldLoop = true,
		endOfAnimationCallback?: () => void,
		shouldAlternate = false
	): void {
		if (!(animationName in this.animationSet)) return
		this.shouldLoop = shouldLoop
		this.endOfAnimationCallback = endOfAnimationCallback
		this.shouldAlternate = shouldAlternate
		this.currentAnimation = this.animationSet[animationName]!
		this.currentFrameIndex = 0
		this.isPlaying = true
	}

	onAttach(gameObject: GameObject): this {
		// console.log(`animationBehaviour added to '${gameObject.name}'`)
		this.gameObject = gameObject

		// this.setAnimation("idle")
		return this
	}

	update(deltaTime: number): void {
		if (!this.isPlaying) return
		// if (MESSAGER.dispatch("main").renderer.currentFrame % this.framesPerImage > 0) return
		const now = Date.now()
		const dt = now - this.timeOfLastFrame
		if (dt >= this.frameDuration) {
			this.timeOfLastFrame = now
			this.advanceFrame()
		}
	}

	private advanceFrame() {
		const isOnLastFrame = this.currentFrameIndex === this.currentAnimation.length - 1
		this.currentImage = this.currentAnimation[this.currentFrameIndex]
		this.gameObject.image = this.currentImage
		if (isOnLastFrame && !this.shouldLoop) {
			this.isPlaying = false
			this.endOfAnimationCallback?.()
			return
		}
		this.currentFrameIndex = isOnLastFrame ? 0 : this.currentFrameIndex + 1
		if (isOnLastFrame && this.shouldAlternate) this.currentAnimation.reverse()
	}
}
