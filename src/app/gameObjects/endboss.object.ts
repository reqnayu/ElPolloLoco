import { AnimationSet, EndbossAnimationState, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Enemy from "./enemy.object.js"
import Util from "../util/general.util.js"
import Timer from "../modules/timer.module.js"
import Gui from "../modules/gui.module.js"
import Main from "../modules/main.module.js"
import Camera from "../modules/camera.module.js"
import GameObject from "./gameObject.object.js"
import Vector from "../modules/vector.module.js"
import Input from "../modules/input.module.js"

/**
 * Represents the final boss in the game, the Endboss.
 * The Endboss has multiple states (walk, alert, attack, hurt, and dead) and interacts with the player and other objects.
 */
@Util.Assets({
  img: [
    ...GameObject.getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4),
    ...GameObject.getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12),
    ...GameObject.getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20),
    ...GameObject.getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23),
    ...GameObject.getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26),
  ],
  audio: ["endboss/Alert.mp3", "endboss/Attack.mp3", "endboss/Dead.mp3"],
})
export default class Endboss extends Enemy {
  /**
   * The direction the Endboss is facing. 1 represents right, -1 represents left.
   *
   * @public
   */
  public direction: 1 | -1 = -1

  /**
   * The list of possible states for the Endboss.
   *
   * @public
   */
  public states: (keyof stateMap)[] = ["walk", "alert", "attack", "hurt", "dead"]

  /**
   * The HTML element representing the Endboss's health bar.
   *
   * @private
   */
  private healthBarElement = Util.getElement("#endboss-hp-bar")

  /**
   * Flag indicating whether the Endboss has spawned.
   *
   * @public
   */
  hasSpawned = false

  /**
   * The default state of the Endboss when it is first initialized.
   *
   * @protected
   */
  protected defaultState: keyof stateMap = "alert"

  /**
   * Creates an instance of the `Endboss` class with the given spawn position.
   *
   * @param {Vector} spawnPosition - The spawn position of the Endboss.
   */
  constructor(spawnPosition: Vector) {
    super({
      type: "endboss",
      spawnPosition,
      walkSpeed: 0.2,
      colliderOffsets: [200, 60, 70, 60],
      healthPoints: 400,
    })
    this.dimensions.set(1045, 1217).toScaled(0.5) // Set the dimensions and scale of the Endboss
    this.initialize()
  }

  /**
   * Initializes the Endboss by setting its behaviors and hiding the health bar initially.
   *
   * @override
   */
  protected override initialize(): void {
    this.setBehaviours()
    super.initialize()
    this.healthBarElement.classList.add("d-none") // Hide the health bar initially
  }

  /**
   * Sets the behaviors for the Endboss, including animation, sound, and collision.
   *
   * @override
   */
  protected override setBehaviours(): void {
    super.setBehaviours()
    const animationSet = this.getAnimationSet()
    this.image = animationSet.alert[0] // Set the initial image to the alert animation
    this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this) // Attach the animation behavior
    this.soundBehaviour = BehaviourFactory.create("sound", {
      soundType: "endboss",
      assets: ["sfx/Alert.mp3", "sfx/Attack.mp3", "sfx/Dead.mp3"],
    }) // Attach the sound behavior for the Endboss
  }

  /**
   * Retrieves the animation set for the Endboss, including walk, alert, attack, hurt, and dead animations.
   *
   * @returns {Pick<AnimationSet, EndbossAnimationState>} The animation set for the Endboss.
   */
  protected getAnimationSet(): Pick<AnimationSet, EndbossAnimationState> {
    return {
      walk: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4)),
      alert: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12)),
      attack: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20)),
      hurt: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23)),
      dead: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26)),
    }
  }

  /**
   * Handles the collision with the Endboss. The Endboss can be hit by a bottle or attack the player.
   *
   * @override
   * @param {GameObject} target - The object that collided with the Endboss.
   */
  public override collisionCallback(target: GameObject): void {
    switch (target.name) {
      case "bottle":
        return this.getHitByBottle(target) // Handle being hit by a bottle
      case "player":
        return this.attackPlayer() // Attack the player if colliding with the player
    }
  }

  /**
   * Handles the behavior when the Endboss is hit by a bottle.
   * This reduces the Endboss's health and triggers the hurt state.
   *
   * @protected
   * @override
   * @param {GameObject} bottle - The bottle that hit the Endboss.
   */
  protected override getHitByBottle(bottle: GameObject): void {
    super.getHitByBottle(bottle)
    const { currentAmount, maxAmount } = this.resourceBehaviour!.healthPoints
    Gui.updateStatusBar("endbossHp", currentAmount, maxAmount, true) // Update the health bar
    if (currentAmount > 0) this.setState("hurt") // Set the Endboss to the hurt state if it still has health
  }

  /**
   * Makes the Endboss attack the player.
   *
   * @private
   */
  private attackPlayer(): void {
    this.setState("attack") // Set the Endboss to the attack state
    this.soundBehaviour?.playOnce("Attack") // Play the attack sound
  }

  /**
   * Handles the Endboss's death. Plays the death sound and ends the game after a delay.
   *
   * @override
   */
  public override die(): void {
    super.die()
    this.soundBehaviour?.playOnce("Dead") // Play the death sound
    new Timer(() => {
      Main.endGame(true) // End the game
      Main.player.movementBehaviour?.stopMoving() // Stop the player's movement
      Input.toggleInput(false) // Disable input
      Camera.focusObjects.remove(this) // Remove the Endboss from the camera focus
    }, 2000).resume() // Wait for 2 seconds before ending the game
  }

  /**
   * Starts the Endboss's actions, including showing the health bar and playing the alert sound.
   *
   * @override
   */
  public override startActing(): void {
    this.healthBarElement.classList.remove("d-none") // Show the health bar
    this.soundBehaviour?.playOnce("Alert") // Play the alert sound
    Camera.focusObjects.push(this) // Add the Endboss to the camera's focus objects
    new Timer(() => {
      this.hasSpawned = true // Mark the Endboss as spawned after 2 seconds
    }, 2000).resume()
  }

  /**
   * Makes the Endboss follow the player based on the player's position.
   * The Endboss will walk toward the player unless in the attack state.
   *
   * @private
   */
  private followPlayer(): void {
    const thisX = this.getCenterPoint().x
    const playerX = Main.player.getCenterPoint().x
    const direction = thisX < playerX ? 1 : -1 // Determine if the Endboss should move left or right
    this.direction = direction
    if (Math.abs(thisX - playerX) < this.dimensions.x / 2) return // Stop if too close to the player
    this.movementBehaviour!.input.isMovingRight = direction === 1 // Move right
    this.movementBehaviour!.input.isMovingLeft = direction === -1 // Move left
    if (this.state?.type !== "attack") this.setState("walk") // Set the Endboss to walk state if not attacking
  }

  /**
   * Updates the Endboss's behavior every frame.
   * Makes the Endboss follow the player if it has spawned and is alive.
   *
   * @override
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public override update(deltaTime: number): void {
    if (this.hasSpawned && this.resourceBehaviour!.healthPoints.currentAmount > 0) {
      this.followPlayer() // Make the Endboss follow the player
    }
    super.update(deltaTime) // Call the superclass update method
  }
}
