import { enemyParams, GameObjectType, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import CollisionManager from "../managers/collision.manager.js"
import Camera from "../modules/camera.module.js"
import Main from "../modules/main.module.js"
import Settings from "../modules/settings.module.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents a generic enemy in the game. This class is the base for all enemy types (including the Endboss).
 * It includes basic movement, health management, and collision detection behaviors.
 */
export default abstract class Enemy extends GameObject {
  /**
   * The direction the enemy is facing. 1 represents right, -1 represents left.
   *
   * @public
   */
  direction: 1 | -1 = -1

  /**
   * The list of possible states for the enemy, including walk and dead states.
   *
   * @protected
   */
  protected states: (keyof stateMap)[] = ["walk", "dead"]

  /**
   * The offsets for the enemy's collision box.
   *
   * @private
   */
  private colliderOffsets

  /**
   * The health points of the enemy.
   *
   * @private
   */
  private healthPoints

  /**
   * The type of the enemy (can be "enemy" or "endboss").
   *
   * @private
   */
  private type: Extract<GameObjectType, "enemy" | "endboss">

  /**
   * The default state for the enemy, which is "walk" by default.
   *
   * @protected
   */
  protected defaultState: keyof stateMap = "walk"

  /**
   * Creates an instance of the `Enemy` class.
   *
   * @param {enemyParams} params - The parameters for the enemy, including its type, spawn position, walk speed, collision offsets, and health points.
   */
  constructor({ type, spawnPosition, walkSpeed, colliderOffsets, healthPoints }: enemyParams) {
    super(type)
    this.type = type
    this.walkSpeed = walkSpeed
    this.colliderOffsets = colliderOffsets
    this.healthPoints = healthPoints
    this.dimensions.set(236, 210) // Set the default dimensions for the enemy
    this.position.set(spawnPosition) // Set the spawn position of the enemy
  }

  /**
   * Initializes the enemy by setting its state and behaviors.
   *
   * @override
   */
  protected override initialize(): void {
    super.initialize()
    this.setState() // Set the default state for the enemy
  }

  /**
   * Sets the behaviors for the enemy, including drawing, movement, gravity, collision, and resource management.
   *
   * @override
   */
  protected override setBehaviours(): void {
    this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this) // Set the draw behavior
    this.movementBehaviour = BehaviourFactory.create("movement", {
      walkSpeed: this.walkSpeed,
      jumpStrength: 0.7, // Set the jump strength for the enemy
    }).onAttach(this) // Set the movement behavior
    this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this) // Set the gravity behavior
    this.collisionBehaviour = BehaviourFactory.create("collision", {
      cooldown: 500, // Set the cooldown for collision detection
      offsets: this.colliderOffsets, // Use the enemy's collision offsets
      targets: ["bottle", "player"], // The targets that the enemy can collide with
      damage: Settings.damage[this.type], // Set the damage for the enemy based on its type
    }).onAttach(this) // Attach the collision behavior
    this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints: this.healthPoints }).onAttach(
      this
    ) // Attach the resource (health) behavior
    this.triggerBehaviour = BehaviourFactory.create("trigger", [
      {
        condition: () => this.position.x < Main.player.position.x + Camera._baseResolution.x, // Trigger the enemy's behavior when it is within camera range
        callback: () => this.startActing(), // Start the enemy's actions
      },
    ])
  }

  /**
   * Handles the collision with the enemy. In this case, the enemy can be hit by a bottle.
   *
   * @override
   * @param {GameObject} target - The object that collided with the enemy.
   */
  public override collisionCallback(target: GameObject): void {
    switch (target.name) {
      case "bottle": {
        this.getHitByBottle(target) // Handle being hit by a bottle
        return
      }
    }
  }

  /**
   * Starts the enemy's actions, such as moving left.
   *
   * @protected
   */
  protected startActing(): void {
    this.movementBehaviour!.input.isMovingLeft = true // Set the enemy to move left
  }

  /**
   * Handles the behavior when the enemy is hit by a bottle.
   * This reduces the enemy's health and triggers the death state if health reaches 0.
   *
   * @protected
   * @param {GameObject} bottle - The bottle that hit the enemy.
   */
  protected getHitByBottle(bottle: GameObject): void {
    this.resourceBehaviour?.receiveDamage(bottle.collisionBehaviour!.damage) // Reduce health based on the bottle's damage
    if (this.resourceBehaviour?.healthPoints.currentAmount === 0) {
      this.die() // If health reaches 0, the enemy dies
    }
  }

  /**
   * Handles the death of the enemy. Removes it from collision detection and sets its state to dead.
   *
   * @public
   */
  public die(): void {
    CollisionManager.removeObject(this.id) // Remove the enemy from collision detection
    this.collisionBehaviour!.targets = [] // Clear the targets for collision
    this.setState("dead") // Set the enemy's state to dead
    this.movementBehaviour?.stopMoving() // Stop the enemy's movement
  }
}
