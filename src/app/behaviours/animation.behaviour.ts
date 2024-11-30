import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import { animationParams, AnimationSet } from "../.types/types.js"

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
		else if (typeof endCallbackOrShouldAlternate === "function") {
			this.shouldLoop = false
			this.endOfAnimationCallback = endCallbackOrShouldAlternate
		}
		if (this.shouldAlternate) this.shouldAlternate = this.shouldAlternate
		this.currentAnimation = this.animationSet[animationName]!
		this._currentFrameIndex = startFrame !== undefined ? startFrame : 0
		this.isPlaying = true
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}

	public update(deltaTime: number): void {
		if (!this.isPlaying) return
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
