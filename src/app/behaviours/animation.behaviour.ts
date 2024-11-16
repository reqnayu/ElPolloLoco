import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import { AnimationSet } from "../.types/types.js"
import { animationParams } from "../.types/types.js"

export default class AnimationBehaviour implements Updateable {
	gameObject!: GameObject
	private frameDuration = 1000 / 8
	private currentAnimation: CanvasImageSource[] = []
	private _currentFrameIndex = 0
	public get currentFrameIndex(): number {
		return this._currentFrameIndex
	}
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

	public setAnimation(animationName: keyof AnimationSet): void
	public setAnimation(animationName: keyof AnimationSet, endOfAnimationCallback: () => void): void
	public setAnimation(animationName: keyof AnimationSet, shouldAlternate: boolean, startFrame?: number): void
	public setAnimation(
		animationName: keyof AnimationSet,
		endCallbackOrShouldAlternate?: (() => void) | boolean,
		startFrame?: number
	): void {
		if (!(animationName in this.animationSet)) return
		if (typeof endCallbackOrShouldAlternate === "boolean") this.shouldAlternate = endCallbackOrShouldAlternate
		else {
			this.shouldLoop = false
			this.endOfAnimationCallback = endCallbackOrShouldAlternate
		}
		if (this.shouldAlternate) this.shouldAlternate = this.shouldAlternate
		this.currentAnimation = this.animationSet[animationName]!
		this._currentFrameIndex = startFrame !== undefined ? startFrame : 0
		this.isPlaying = true
	}

	// public setAnimation(
	// 	animationName: keyof AnimationSet,
	// 	shouldLoop = true,
	// 	endOfAnimationCallback?: () => void,
	// 	shouldAlternate = false
	// ): void {
	// 	if (!(animationName in this.animationSet)) return
	// 	this.shouldLoop = shouldLoop
	// 	this.endOfAnimationCallback = endOfAnimationCallback
	// 	this.shouldAlternate = shouldAlternate
	// 	this.currentAnimation = this.animationSet[animationName]!
	// 	this._currentFrameIndex = 0
	// 	this.isPlaying = true
	// }

	public onAttach(gameObject: GameObject): this {
		// console.log(`animationBehaviour added to '${gameObject.name}'`)
		this.gameObject = gameObject

		// this.setAnimation("idle")
		return this
	}

	public update(deltaTime: number): void {
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
		this._currentFrameIndex = isOnLastFrame ? 0 : this.currentFrameIndex + 1
		if (isOnLastFrame && this.shouldAlternate) this.currentAnimation.reverse()
	}
}
