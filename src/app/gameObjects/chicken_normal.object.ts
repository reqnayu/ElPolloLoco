import { AnimationSet, EnemyAnimationState } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Settings from "../modules/settings.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"
import Enemy from "./enemy.object.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents a normal chicken enemy in the game.
 * The chicken can walk and die, with different animations for each state.
 * It inherits from the `Enemy` class, which provides basic functionality for enemies.
 */
@Util.Assets({
  img: [
    ...GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3),
    ...GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1),
  ],
})
export default class ChickenNormal extends Enemy {
  /**
   * Creates an instance of the `ChickenNormal` class.
   *
   * @param {Vector} spawnPosition - The initial position of the chicken in the game world.
   */
  constructor(spawnPosition: Vector) {
    super({
      type: "enemy",
      spawnPosition,
      walkSpeed: 0.35,
      colliderOffsets: [10, 10, 10, 10],
      healthPoints: Settings.resources["enemyNormalHp"],
    })
    this.dimensions.toScaled(0.7) // Scaling down the chicken size
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
   * Sets up the behaviors for the chicken, including its animations and image.
   *
   * @override
   */
  protected override setBehaviours(): void {
    const animationSet = this.getAnimationSet()
    this.image = animationSet.walk[0] // Set the initial walking image
    this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
  }

  /**
   * Retrieves the animation set for the chicken's different states.
   * The set includes animations for walking and death.
   *
   * @returns {Pick<AnimationSet, EnemyAnimationState>} - The animation set for the chicken.
   */
  protected getAnimationSet(): Pick<AnimationSet, EnemyAnimationState> {
    return {
      walk: GameObject.getImages(GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3)),
      dead: GameObject.getImages(GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1)),
    }
  }
}
