import { AnimationSet, PlayerAnimationState, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Vector from "../modules/vector.module.js"
import Bottle from "./bottle.object.js"
import Timer from "../modules/timer.module.js"
import Settings from "../modules/settings.module.js"
import Input from "../modules/input.module.js"
import Gui from "../modules/gui.module.js"
import Main from "../modules/main.module.js"
import Camera from "../modules/camera.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"
import Enemy from "./enemy.object.js"

/**
 * Represents the player character in the game. Handles movement, animations, collisions, health, and interactions with game objects.
 */
@Util.Assets({
  img: [
    ...GameObject.getSingleAnimation("2_character_pepe/1_idle/idle", 1, 10),
    ...GameObject.getSingleAnimation("2_character_pepe/1_idle/idle_long", 11, 20),
    ...GameObject.getSingleAnimation("2_character_pepe/2_walk", 21, 26),
    ...GameObject.getSingleAnimation("2_character_pepe/3_jump", 31, 39),
    ...GameObject.getSingleAnimation("2_character_pepe/4_hurt", 41, 43),
    ...GameObject.getSingleAnimation("2_character_pepe/5_dead", 51, 57),
  ],
  audio: [
    "player/Jump.mp3",
    "player/Landing.mp3",
    "player/Walk.mp3",
    "player/Snore.mp3",
    "player/Death.mp3",
    "player/Hurt_1.mp3",
    "player/Hurt_2.mp3",
    "player/Hurt_3.mp3",
  ],
})
export default class Player extends GameObject {
  /**
   * The player's walking speed.
   *
   * @protected
   */
  protected walkSpeed = 0.6

  /**
   * The strength of the player's jump.
   *
   * @private
   */
  private jumpStrength = 1

  /**
   * The default state of the player, which is "idle".
   *
   * @protected
   */
  protected defaultState: keyof stateMap = "idle"

  /**
   * The horizontal offset for the camera focus when following the player.
   *
   * @public
   */
  focusOffset = 400

  /**
   * The list of possible states for the player.
   *
   * @protected
   */
  states: (keyof stateMap)[] = ["idle", "walk", "jump", "hurt", "dead"]

  /**
   * Gets the player's current focus position relative to the camera.
   * The offset depends on whether the camera is focused on multiple objects.
   *
   * @protected
   * @returns {Vector} The focus position of the player.
   */
  protected getFocus(): Vector {
    if (Camera.focusObjects.length > 1) return this.getCenterPoint()
    return this.getCenterPoint().plus(new Vector(this.focusOffset * this.direction, 0))
  }

  /**
   * Creates an instance of the Player class, initializes its properties and behaviors.
   */
  constructor() {
    super("player")
    this.dimensions.set(610, 1200).toScaled(0.4) // Set the default dimensions and scale of the player
    this.position.set(0, 100) // Set the initial position of the player
    this.initialize()
  }

  /**
   * Initializes the player, including setting behaviors and adjusting the position based on settings.
   *
   * @override
   */
  protected override initialize(): void {
    this.setBehaviours()
    this.position.y = Settings.floorHeight // Set the player position on the floor
    super.initialize("2_character_pepe/1_idle/idle/I-1.png") // Set the initial idle animation
  }

  /**
   * Sets the behaviors for the player, including animations, movement, collision detection, and sound effects.
   *
   * @override
   */
  protected override setBehaviours(): void {
    const animationSet = this.getAnimationSet()
    const { walkSpeed, jumpStrength } = this

    this.image = animationSet.idle[0]
    this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
    this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
    this.movementBehaviour = BehaviourFactory.create("movement", {
      walkSpeed,
      jumpStrength,
      clampToWorld: true,
    }).onAttach(this)
    this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
    this.soundBehaviour = BehaviourFactory.create("sound", {
      soundType: this.name,
      assets: [
        "sfx/Jump.mp3",
        "sfx/Landing.mp3",
        "sfx/Walk.mp3",
        "sfx/Snore.mp3",
        "sfx/Death.mp3",
        "sfx/Hurt_1.mp3",
        "sfx/Hurt_2.mp3",
        "sfx/Hurt_3.mp3",
      ],
    })
    this.collisionBehaviour = BehaviourFactory.create("collision", {
      targets: ["enemy", "endboss", "coin", "bottle"],
      offsets: [200, 60, 20, 45],
      cooldown: 1000,
    }).onAttach(this)
    const { hp: healthPoints, bottle: bottles, coin: coins } = Settings.resources
    this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints, bottles, coins }).onAttach(this)
  }

  /**
   * Retrieves the animation set for the player, which includes various states like idle, walk, jump, etc.
   *
   * @protected
   * @returns {Pick<AnimationSet, PlayerAnimationState>} The animation set for the player.
   */
  protected getAnimationSet(): Pick<AnimationSet, PlayerAnimationState> {
    return {
      idle: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/1_idle/idle", 1, 10)),
      idle_long: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/1_idle/idle_long", 11, 20)),
      walk: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/2_walk", 21, 26)),
      jump: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/3_jump", 31, 39)),
      hurt: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/4_hurt", 41, 43)),
      dead: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/5_dead", 51, 57)),
    }
  }

  /**
   * Handles throwing a bottle, if the player has any bottles remaining in their inventory.
   *
   * @public
   */
  public throwBottle(): void {
    if (!this.resourceBehaviour?.use("bottles", 1)) return // Check if the player has bottles left
    const spawnPosition = this.position // Set spawn position for the bottle
    new Bottle({ position: spawnPosition, direction: this.direction }) // Create the bottle object
    this.setState("idle") // Set the player back to idle state
  }

  /**
   * Handles collision with various objects such as coins, enemies, and bottles.
   *
   * @override
   * @param {GameObject} target - The object that collided with the player.
   */
  public override collisionCallback(target: GameObject): void {
    switch (target.name) {
      case "coin":
        return this.resourceBehaviour?.add("coins", 1) // Add coins to the player's inventory
      case "enemy":
      case "endboss": {
        return this.collideWithEnemy(target as Enemy) // Handle collision with enemies
      }
    }
  }

  /**
   * Handles interactions with enemies, including jumping on them or being hit.
   *
   * @private
   * @param {Enemy} enemy - The enemy the player collided with.
   */
  private collideWithEnemy(enemy: Enemy): void {
    if (this.isCollidingFromAbove(enemy)) this.jumpOnEnemy(enemy)
    else this.getHitByEnemy(enemy)
  }

  /**
   * Checks if the player is colliding with an enemy from above, in which case the player can jump on the enemy.
   *
   * @private
   * @param {GameObject} target - The enemy being checked for collision.
   * @returns {boolean} Whether the player is colliding from above.
   */
  private isCollidingFromAbove(target: GameObject): boolean {
    const enemyCollider = target.collisionBehaviour!.collider
    const playerCollider = this.collisionBehaviour!.collider
    const isAbove = Math.abs(enemyCollider.y + enemyCollider.height - playerCollider.y) < 20
    return isAbove && this.movementBehaviour!.velocity.y < 0
  }

  /**
   * Handles the player jumping on top of an enemy, which results in the enemy dying.
   *
   * @private
   * @param {Enemy} enemy - The enemy the player jumped on.
   */
  private jumpOnEnemy(enemy: Enemy): void {
    this.movementBehaviour!.jump() // Make the player jump
    this.soundBehaviour!.playOnce("Jump") // Play jump sound
    enemy.die() // Destroy the enemy
  }

  /**
   * Handles the player getting hit by an enemy, which reduces health and possibly causes the player to die.
   *
   * @private
   * @param {GameObject} enemy - The enemy that hit the player.
   */
  private getHitByEnemy(enemy: GameObject): void {
    this.collisionBehaviour!.addCollisionCooldown("enemy", "endboss") // Add cooldown to avoid repeated collisions
    const damage = enemy.name === "enemy" ? Settings.damage.enemy : Settings.damage.endboss
    this.resourceBehaviour!.receiveDamage(damage) // Apply damage to the player
    const { currentAmount, maxAmount } = this.resourceBehaviour!.healthPoints
    Gui.updateStatusBar("hp", currentAmount, maxAmount, true) // Update the health status bar
    if (this.resourceBehaviour!.healthPoints.currentAmount === 0) return this.die() // If health reaches 0, die
    this.setState("hurt") // Set the player to hurt state
    this.soundBehaviour!.playRandom(["Hurt_1", "Hurt_2", "Hurt_3"]) // Play a random hurt sound
  }

  /**
   * Handles the player's death, stops movement, disables input, and ends the game.
   *
   * @private
   */
  private die(): void {
    this.setState("dead") // Set the player to dead state
    this.soundBehaviour?.playOnce("Death") // Play death sound
    new Timer(() => {
      this.movementBehaviour?.stopMoving() // Stop the player's movement
      Input.toggleInput(false) // Disable input
      this.movementBehaviour = undefined // Clear the movement behavior
      Main.endGame(false) // End the game
    }, 2000).resume() // Execute after a 2-second delay
  }
}
