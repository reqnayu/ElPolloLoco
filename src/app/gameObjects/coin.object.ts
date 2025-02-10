import { AnimationSet, CoinAnimationState, coinParams } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Timer from "../modules/timer.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents a coin that can be collected by the player.
 * The coin has an idle animation and plays a sound when collected.
 */
@Util.Assets({
  img: [...GameObject.getSingleAnimation("8_coin/1_idle", 1, 7)],
  audio: ["coin/Collect.mp3"],
})
export default class Coin extends GameObject {
  /**
   * The starting frame for the coin's animation.
   *
   * @private
   */
  private startFrame: number | undefined

  /**
   * Creates an instance of the `Coin` class.
   * The coin is initialized at a specific position with a starting animation frame.
   *
   * @param {coinParams} params - Parameters to initialize the coin.
   * @param {Vector} params.spawnPosition - The position where the coin should appear.
   * @param {number} params.startFrame - The starting frame for the coin's animation.
   */
  constructor({ spawnPosition, startFrame }: coinParams) {
    super("coin")
    this.startFrame = startFrame
    this.dimensions.set(300, 301).scale(0.3) // Set size and scale
    this.position.set(spawnPosition) // Set initial position
    this.initialize()
  }

  /**
   * Initializes the coin by setting its behaviors and animation.
   *
   * @override
   */
  protected override initialize(): void {
    this.setBehaviours()
    super.initialize("8_coin/1_idle/I-1.png") // Set default image for idle animation
    this.animationBehaviour!.setAnimation("idle", true, this.startFrame) // Start idle animation
  }

  /**
   * Sets the behaviors for the coin, including drawing, movement, animation, collision, and sound.
   *
   * @override
   */
  protected override setBehaviours(): void {
    const animationSet = this.getAnimationSet()
    this.image = animationSet.idle[0] // Set the initial image for the idle animation
    this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this) // Attach drawing behavior
    this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 0, jumpStrength: 0.8 }).onAttach(
      this
    ) // No movement, slight jump effect
    this.animationBehaviour = BehaviourFactory.create("animation", {
      animationSet: this.getAnimationSet(),
    }).onAttach(this) // Attach animation behavior
    this.collisionBehaviour = BehaviourFactory.create("collision", {
      targets: ["player"], // Coin interacts with the player
      offsets: [100, 100, 100, 100], // Set collision offsets
    }).onAttach(this) // Attach collision behavior
    this.soundBehaviour = BehaviourFactory.create("sound", { soundType: this.name, assets: ["sfx/Collect.mp3"] }) // Attach sound behavior
  }

  /**
   * Retrieves the animation set for the coin, which consists of idle animations.
   *
   * @returns {Pick<AnimationSet, CoinAnimationState>} The animation set for the coin.
   */
  protected getAnimationSet(): Pick<AnimationSet, CoinAnimationState> {
    return {
      idle: GameObject.getImages(GameObject.getSingleAnimation("8_coin/1_idle", 1, 7)), // Idle animation frames
    }
  }

  /**
   * Handles the collision with the player. When the player collides with the coin,
   * the coin is collected and the player gains a coin.
   *
   * @override
   * @param {GameObject} target - The object that collided with the coin (should be the player).
   */
  public override collisionCallback(target: GameObject): void {
    switch (target.name) {
      case "player":
        this.collect(target)
        break
    }
  }

  /**
   * Collects the coin. This adds a coin to the player's resources and plays a collection sound.
   * If the player already has the maximum number of coins, the coin is not collected.
   *
   * @param {GameObject} player - The player collecting the coin.
   */
  private collect(player: GameObject): void {
    // Check if the player already has the maximum number of coins
    if (player.resourceBehaviour!.coins?.fraction === 1) return

    this.soundBehaviour?.playOnce("Collect") // Play the coin collection sound
    this.collisionBehaviour?.targets.remove("player") // Remove the player from collision targets
    this.movementBehaviour?.jump() // Simulate the coin jumping
    new Timer(() => this.delete(), 300).resume() // Delete the coin after 300ms
  }
}
