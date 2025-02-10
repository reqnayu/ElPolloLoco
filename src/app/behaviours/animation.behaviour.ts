import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import { animationParams, AnimationSet } from "../.types/types.js"

/**
 * Represents an animation behavior that can be applied to a game object.
 * This class handles animation updates, frame advancement, looping, and optional alternating playback.
 *
 * @implements {Updateable}
 */
export default class AnimationBehaviour implements Updateable {
  /** The game object this animation is attached to. */
  gameObject!: GameObject

  /** The duration of each frame in milliseconds. Default is 1000/8 (8 FPS). */
  private frameDuration = 1000 / 8

  /** The current animation frames. */
  private currentAnimation: CanvasImageSource[] = []

  /** The current frame index of the animation. */
  private _currentFrameIndex = 0

  /**
   * Gets the current frame index.
   * @returns {number} The current frame index.
   */
  public get currentFrameIndex(): number {
    return this._currentFrameIndex
  }

  /** The currently displayed image of the animation. */
  private currentImage?: CanvasImageSource

  /** Timestamp of the last frame update. */
  private timeOfLastFrame = 0

  /** Determines if the animation should loop. */
  private shouldLoop = true

  /** Determines if the animation should alternate (reverse direction at the end). */
  private shouldAlternate = false

  /** The set of animations available. */
  animationSet: Partial<AnimationSet>

  /** Optional callback function that runs when a non-looping animation ends. */
  endOfAnimationCallback?: () => void

  /** Indicates whether the animation is currently playing. */
  private isPlaying = true

  /**
   * Creates an instance of AnimationBehaviour.
   *
   * @param {animationParams} params - The parameters for initializing the animation.
   */
  constructor({ animationSet }: animationParams) {
    this.animationSet = animationSet
  }

  /**
   * Sets the current animation by name.
   * Can accept a callback for when the animation finishes or a flag for alternating playback.
   *
   * @param {keyof AnimationSet} animationName - The name of the animation to set.
   * @param {(() => void) | boolean} [endCallbackOrShouldAlternate] -
   *        If a function is provided, it is called at the end of the animation.
   *        If a boolean is provided, it enables alternating playback.
   * @param {number} [startFrame] - The starting frame index.
   */
  public setAnimation(
    animationName: keyof AnimationSet,
    endCallbackOrShouldAlternate?: (() => void) | boolean,
    startFrame?: number
  ): void {
    if (!(animationName in this.animationSet)) return

    if (typeof endCallbackOrShouldAlternate === "boolean") {
      this.shouldAlternate = endCallbackOrShouldAlternate
    } else if (typeof endCallbackOrShouldAlternate === "function") {
      this.shouldLoop = false
      this.endOfAnimationCallback = endCallbackOrShouldAlternate
    }

    if (this.shouldAlternate) this.shouldAlternate = this.shouldAlternate
    this.currentAnimation = this.animationSet[animationName]!
    this._currentFrameIndex = startFrame !== undefined ? startFrame : 0
    this.isPlaying = true
  }

  /**
   * Attaches the animation behavior to a game object.
   *
   * @param {GameObject} gameObject - The game object to attach the animation to.
   * @returns {this} The current instance for method chaining.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    return this
  }

  /**
   * Updates the animation, advancing frames based on elapsed time.
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {
    if (!this.isPlaying) return

    const now = Date.now()
    const dt = now - this.timeOfLastFrame

    if (dt >= this.frameDuration) {
      this.timeOfLastFrame = now
      this.advanceFrame()
    }
  }

  /**
   * Advances the animation to the next frame, handling looping and alternating playback.
   */
  private advanceFrame(): void {
    const isOnLastFrame = this.currentFrameIndex === this.currentAnimation.length - 1
    this.currentImage = this.currentAnimation[this.currentFrameIndex]
    this.gameObject.image = this.currentImage

    if (isOnLastFrame && !this.shouldLoop) {
      this.isPlaying = false
      this.endOfAnimationCallback?.()
      return
    }

    this._currentFrameIndex = isOnLastFrame ? 0 : this.currentFrameIndex + 1

    if (isOnLastFrame && this.shouldAlternate) {
      this.currentAnimation.reverse()
    }
  }
}
