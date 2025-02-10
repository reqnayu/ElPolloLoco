import { AnimationSet, BottleAnimationState, GameObjectParams, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import AssetManager from "../managers/asset.manager.js"
import Main from "../modules/main.module.js"
import Settings from "../modules/settings.module.js"
import Timer from "../modules/timer.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents a bottle object that can be thrown and collected in the game.
 * The bottle can interact with enemies, the player, and the environment.
 * It has animations for rotation, splash, and idle states.
 */
@Util.Assets({
  img: [
    "6_salsa_bottle/salsa_bottle.png",
    "6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
    "6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
    "6_salsa_bottle/2_salsa_bottle_on_ground.png",
  ],
  audio: ["bottle/Splash.mp3", "bottle/Throw_1.mp3", "bottle/Throw_2.mp3", "bottle/Pick-up.mp3"],
})
export default class Bottle extends GameObject {
  /**
   * A list of states that this bottle can have.
   */
  protected states: (keyof stateMap)[] = ["rotation"]

  /**
   * The default state of the bottle, which is "rotation".
   */
  protected defaultState: keyof stateMap = "rotation"

  /** The initial velocity of the bottle when thrown. */
  private startingVelocity = Vector.zero

  /**
   * Creates an instance of the `Bottle` class.
   *
   * @param {Object} params - Parameters for the bottle's initial setup.
   * @param {Vector} params.position - The position of the bottle in the game world.
   * @param {number} params.direction - The direction the bottle is facing (either 1 or -1).
   */
  constructor({ position, direction }: GameObjectParams["bottle"]) {
    super("bottle")
    this.dimensions.set(400, 400).toScaled(0.5)
    this.position.set(position)
    this.direction = direction
    this.initialize()
    this.soundBehaviour!.playRandom(["Throw_1", "Throw_2"])
  }

  /**
   * Initializes the bottle, including setting its behaviors and state.
   *
   * @override
   */
  protected override initialize(): void {
    this.setBehaviours()
    super.initialize("6_salsa_bottle/salsa_bottle.png")
    this.setState()
  }

  /**
   * Sets the behaviors for the bottle, including animation, movement, gravity, sound, and collision.
   *
   * @override
   */
  protected override setBehaviours(): void {
    const animationSet: Pick<AnimationSet, BottleAnimationState> = {
      rotation: [
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/1_bottle_rotation.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/2_bottle_rotation.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/3_bottle_rotation.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"),
      ],
      splash: [
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png"),
        AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png"),
      ],
      idle: [AssetManager.getAsset<"img">("6_salsa_bottle/2_salsa_bottle_on_ground.png")],
    }
    this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
    this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
    this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 1.5, jumpStrength: 0.6 }).onAttach(
      this
    )
    this.movementBehaviour.velocity.add(this.startingVelocity)
    this.movementBehaviour.input.isMovingLeft = this.direction === -1
    this.movementBehaviour.input.isMovingRight = this.direction === 1
    this.movementBehaviour.jump()
    this.gravityBehavior = BehaviourFactory.create("gravity", { landCallback: () => this.land() }).onAttach(this)
    this.collisionBehaviour = BehaviourFactory.create("collision", {
      targets: ["enemy", "endboss"],
      offsets: [30, 30, 30, 30],
      damage: Settings.damage.bottle,
    }).onAttach(this)
    this.soundBehaviour = BehaviourFactory.create("sound", {
      soundType: "bottle",
      assets: ["sfx/Splash.mp3", "sfx/Throw_1.mp3", "sfx/Throw_2.mp3", "sfx/Pick-up.mp3"],
    })
  }

  /**
   * Callback triggered when the bottle collides with a target.
   *
   * @param {GameObject} target - The object the bottle collided with.
   */
  public override collisionCallback(target: GameObject): void {
    switch (target.name) {
      case "enemy":
      case "endboss":
        return this.hitEnemy(target)
      case "player":
        this.collect(target)
    }
  }

  /**
   * Handles the bottle hitting an enemy or boss.
   *
   * @param {GameObject} target - The enemy or boss that the bottle hits.
   */
  private hitEnemy(target: GameObject): void {
    this.gravityBehavior = undefined
    this.movementBehaviour = undefined
    this.collisionBehaviour = undefined
    this.soundBehaviour?.playOnce("Splash")
    this.animationBehaviour?.setAnimation("splash", () => Main.removeObject(this.id))
  }

  /**
   * Callback triggered when the bottle lands on the ground.
   */
  private land(): void {
    this.movementBehaviour!.input.isMovingLeft = false
    this.movementBehaviour!.input.isMovingRight = false
    this.animationBehaviour?.setAnimation("idle")
    this.collisionBehaviour!.targets = ["player"]
  }

  /**
   * Handles the bottle being collected by the player.
   *
   * @param {GameObject} player - The player collecting the bottle.
   */
  private collect(player: GameObject): void {
    const playerBottles = player.resourceBehaviour!.bottles!
    if (playerBottles.fraction === 1) return
    playerBottles.add()
    this.soundBehaviour?.playOnce("Pick-up")
    this.collisionBehaviour?.targets.remove("player")
    this.movementBehaviour?.jump()
    new Timer(() => this.delete(), 300).resume()
  }
}
