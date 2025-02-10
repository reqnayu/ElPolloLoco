import { resourceAmountParams } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import { BottleResource } from "../modules/bottle_resource.module.js"
import { CoinResource } from "../modules/coin_resource.module.js"
import { HealthResource } from "../modules/health_resource.module.js"
import GameObject from "../gameObjects/gameObject.object.js"

/**
 * Manages resource-related attributes such as health, bottles, and coins for a game object.
 *
 * @implements {Updateable}
 */
export default class ResourceBehaviour implements Updateable {
  /** The game object this resource behavior is attached to. */
  gameObject!: GameObject

  /** Health resource management for the game object. */
  public healthPoints: HealthResource

  /** Optional bottle resource management. */
  public bottles?: BottleResource

  /** Optional coin resource management. */
  public coins?: CoinResource

  /**
   * Creates an instance of ResourceBehaviour.
   *
   * @param {resourceAmountParams} params - Parameters specifying initial resource amounts.
   * @param {number} params.healthPoints - The maximum health points for the game object.
   * @param {number} [params.bottles] - The maximum number of bottles (optional).
   * @param {number} [params.coins] - The maximum number of coins (optional).
   */
  constructor({ healthPoints, bottles, coins }: resourceAmountParams) {
    this.healthPoints = new HealthResource({ maxAmount: healthPoints })
    if (bottles) this.bottles = new BottleResource({ maxAmount: bottles })
    if (coins) this.coins = new CoinResource({ maxAmount: coins, currentAmount: 0 })
  }

  /**
   * Attaches this resource behavior to a game object.
   *
   * @param {GameObject} gameObject - The game object to attach the resource behavior to.
   * @returns {this} The current instance for method chaining.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    return this
  }

  /**
   * Updates the resource behavior.
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {}

  /**
   * Uses a specified amount of a given resource.
   *
   * @param {keyof resourceAmountParams} type - The type of resource to use (e.g., "healthPoints", "bottles", "coins").
   * @param {number} amount - The amount of the resource to consume.
   * @returns {boolean} `true` if the resource was successfully used, otherwise `false`.
   */
  public use(type: keyof resourceAmountParams, amount: number): boolean {
    return this[type]?.use(amount) || false
  }

  /**
   * Adds a specified amount to a given resource.
   *
   * @param {keyof resourceAmountParams} type - The type of resource to add to.
   * @param {number} amount - The amount to add.
   */
  public add(type: keyof resourceAmountParams, amount: number): void {
    return this[type]?.add(amount)
  }

  /**
   * Applies damage by reducing the health points of the game object.
   *
   * @param {number} amount - The amount of damage to deal.
   */
  public receiveDamage(amount: number): void {
    this.use("healthPoints", amount)
  }
}
