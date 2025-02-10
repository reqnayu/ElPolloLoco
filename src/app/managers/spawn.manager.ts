import { coinParams, enemyParams, Spawnable } from "../.types/types.js"
import GameObjectFactory from "../factories/gameObject.factory.js"
import Settings from "../modules/settings.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"

/**
 * SpawnManager is responsible for initializing and spawning various game objects
 * such as coins, enemies, and the endboss at specified locations.
 */
export default abstract class SpawnManager {
  /**
   * Initializes the spawning system by calling methods to spawn coins, enemies, and the endboss.
   * @returns {void}
   */
  public static initialize(): void {
    this.initializeCoins()
    this.initializeEnemies()
    this.initializeEndboss()
  }

  /**
   * Initializes coin spawning at random positions with varying patterns.
   * @returns {void}
   */
  private static initializeCoins(): void {
    for (
      let i = Util.randomize(600, 1000, true);
      i < Settings.spawnLocations.endboss;
      i += Util.randomize(1000, 1500, true)
    ) {
      Util.randomize([this.square, this.arch, this.line]).call(this, i)
    }
  }

  /**
   * Initializes enemy spawning at random positions within a defined limit.
   * @returns {void}
   */
  private static initializeEnemies(): void {
    for (
      let i = Util.randomize(800, 1000, true), amount = 0;
      i < Settings.spawnLocations.endboss && amount < Settings.maxAmountOfEnemies;
      i += Util.randomize(200, 1000, true), amount++
    ) {
      this.spawn("enemy", new Vector(i, Settings.floorHeight))
    }
  }

  /**
   * Initializes the endboss spawning at a specific location.
   * @returns {void}
   */
  private static initializeEndboss(): void {
    const spawnLocation = new Vector(Settings.spawnLocations.endboss, Settings.floorHeight)
    this.spawn("endboss", spawnLocation)
  }

  /**
   * Spawns coins in an arch pattern at the given spawn position.
   * @param {number} spawnPosition - The horizontal position where the coins will be spawned.
   * @returns {void}
   */
  private static arch(spawnPosition: number): void {
    const amount = 5
    const radius = 200
    const verticalPosition = 180
    const centerPoint = new Vector(spawnPosition, verticalPosition)
    const positions = this.newForm(amount, (i) => {
      const angle = (i / (amount - 1)) * Math.PI
      return centerPoint.plus(Vector.fromAngleAndRadius(angle, radius))
    })
    this.spawn("coin", positions)
  }

  /**
   * Spawns coins in a square pattern at the given spawn position.
   * @param {number} spawnPosition - The horizontal position where the coins will be spawned.
   * @returns {void}
   */
  private static square(spawnPosition: number): void {
    const sideLength = 100
    const rotation = Math.PI / 4
    const radius = Math.sqrt(2) * sideLength
    const verticalPosition = 100
    const centerPoint = new Vector(spawnPosition, verticalPosition)
    const positions = this.newForm(4, (i) => {
      const angle = Math.PI / 4 + rotation + (i * Math.PI) / 2
      return centerPoint.plus(Vector.fromAngleAndRadius(angle, radius))
    })
    this.spawn("coin", positions)
  }

  /**
   * Spawns coins in a line pattern at the given spawn position.
   * @param {number} spawnPosition - The horizontal position where the coins will be spawned.
   * @returns {void}
   */
  private static line(spawnPosition: number): void {
    const length = 400
    const amount = 5
    const rotation = 0
    const verticalPosition = Util.randomize(40, 220, true)
    const centerPoint = new Vector(spawnPosition, verticalPosition)
    const startPoint = centerPoint.plus(Vector.fromAngleAndRadius(-rotation, length / 2))
    const step = length / (amount - 1)
    const positions = this.newForm(amount, (i) => startPoint.plus(Vector.fromAngleAndRadius(rotation, step * i)))
    this.spawn("coin", positions)
  }

  /**
   * Spawns a game object (coin, enemy, endboss) at a specific position or set of positions.
   * @param {Spawnable} type - The type of object to spawn (e.g., "coin", "enemy", "endboss").
   * @param {Vector | Vector[]} positionOrPositions - The position or array of positions where the object(s) will be spawned.
   * @returns {void}
   */
  private static spawn(type: Spawnable, position: Vector): void
  private static spawn(type: Spawnable, positions: Vector[]): void
  private static spawn(type: Spawnable, positionOrPositions: Vector | Vector[]): void {
    const positions = Array.isArray(positionOrPositions) ? positionOrPositions : [positionOrPositions]
    positions.forEach((pos, i) => {
      const params: Partial<coinParams> = { spawnPosition: pos }
      if (type === "coin") params.startFrame = i % 8
      GameObjectFactory.create(type, params as enemyParams | coinParams)
    })
  }

  /**
   * Creates a new form (array of positions) based on the specified amount and mapping function.
   * @param {number} amount - The number of positions to generate.
   * @param {(i: number) => Vector} mapFunc - The function to generate positions based on the index.
   * @returns {Vector[]} - An array of generated positions.
   */
  private static newForm(amount: number, mapFunc: (i: number) => Vector): Vector[] {
    return Array(amount)
      .fill(null)
      .map((n, i) => mapFunc(i))
  }
}
