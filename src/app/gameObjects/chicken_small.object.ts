import { AnimationSet, EnemyAnimationState } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Settings from "../modules/settings.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"
import Enemy from "./enemy.object.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents a small chicken enemy in the game.
 * The chicken can walk and die, with different animations for each state.
 * It inherits from the `Enemy` class, which provides basic functionality for enemies.
 */
@Util.Assets({
  img: [
    ...GameObject.getSingleAnimation(`3_enemies_chicken/chicken_small/1_walk`, 1, 3),
    ...GameObject.getSingleAnimation(`3_enemies_chicken/chicken_small/2_dead`, 1),
  ],
})
export default class ChickenSmall extends Enemy {
  /**
   * Creates an instance of the `ChickenSmall` class.
   *
   * @param {Vector} spawnPosition - The initial position of the small chicken in the game world.
   */
  constructor(spawnPosition: Vector) {
    super({
      type: "enemy",
      spawnPosition,
      walkSpeed: 0.2, // The chicken's walking speed
      colliderOffsets: [10, 15, 10, 15], // Collider offsets for the chicken
      healthPoints: Settings.resources["enemySmallHp"], // The chicken's health points
    })
    this.dimensions.toScaled(0.5) // Scaling down the chicken size
    this.initialize()
  }

  /**
   * Initializes the chicken's behaviors and properties.
   *
   * @override
   */
  protected override initialize(): void {
    this.setBehaviours()
    super.setBehaviours()
    super.initialize()
  }

  /**
   * Sets up the behaviors for the small chicken, including its animations and image.
   *
   * @override
   */
  protected override setBehaviours(): void {
    const animationSet = this.getAnimationSet()
    this.image = animationSet.walk[0] // Set the initial walking image
    this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
  }

  /**
   * Retrieves the animation set for the small chicken's different states.
   * The set includes animations for walking and death.
   *
   * @returns {Pick<AnimationSet, EnemyAnimationState>} - The animation set for the chicken.
   */
  protected getAnimationSet(): Pick<AnimationSet, EnemyAnimationState> {
    return {
      walk: GameObject.getImages(GameObject.getSingleAnimation(`3_enemies_chicken/chicken_small/1_walk`, 1, 3)),
      dead: GameObject.getImages(GameObject.getSingleAnimation(`3_enemies_chicken/chicken_small/2_dead`, 1)),
    }
  }
}
