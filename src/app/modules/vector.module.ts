import Util from "../util/general.util.js"

/**
 * The Vector class represents a 2D vector with x and y coordinates.
 * It provides utility methods for vector manipulation such as addition, scaling, and normalization.
 */
export default class Vector {
  /**
   * Creates an instance of the Vector class.
   *
   * @param x The x-coordinate of the vector.
   * @param y The y-coordinate of the vector.
   */
  constructor(public x: number, public y: number) {}

  /**
   * Returns the magnitude (length) of the vector.
   *
   * @returns The magnitude of the vector.
   */
  public get magnitude(): number {
    return Util.roundTo(Math.sqrt(this.x ** 2 + this.y ** 2))
  }

  /**
   * Sets the vector's x and y coordinates.
   *
   * @param x The new x-coordinate (either a number or another vector).
   * @param y The new y-coordinate (if x is a number).
   * @returns The current vector instance, allowing for method chaining.
   */
  public set(x: number, y: number): this
  public set({ x, y }: Vector): this
  public set(xOrVector: number | Vector, y?: number): this {
    const setFromVector: boolean = xOrVector instanceof Vector
    this.x = setFromVector ? (xOrVector as Vector).x : (xOrVector as number)
    this.y = setFromVector ? (xOrVector as Vector).y : y!
    return this
  }

  /**
   * Creates and returns a copy of the current vector.
   *
   * @returns A new instance of Vector with the same x and y values as the current vector.
   */
  public copy(): Vector {
    return new Vector(this.x, this.y)
  }

  /**
   * Creates and returns a new vector that is a copy of the given vector.
   *
   * @param v The vector to copy.
   * @returns A new vector instance with the same x and y values as the provided vector.
   */
  public static copy(v: Vector): Vector {
    return new Vector(v.x, v.y)
  }

  /**
   * Adds the given vector to the current vector and modifies the current vector instance.
   *
   * @param v The vector to add.
   * @returns The current vector instance, allowing for method chaining.
   */
  public add(v: Vector): this {
    const { x, y } = this.plus(v)
    this.x = x
    this.y = y
    return this
  }

  /**
   * Adds the given vector to the current vector and returns a new vector instance.
   *
   * @param v The vector to add.
   * @returns A new vector instance representing the sum of the current vector and the given vector.
   */
  public plus(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  /**
   * Scales the current vector by a given factor and returns a new vector instance.
   *
   * @param factor The factor to scale the vector by.
   * @returns A new vector instance representing the scaled vector.
   */
  public scale(factor: number): Vector {
    return new Vector(this.x * factor, this.y * factor)
  }

  /**
   * Scales the current vector by a given factor and modifies the current vector instance.
   *
   * @param factor The factor to scale the vector by.
   * @returns The current vector instance, allowing for method chaining.
   */
  public toScaled(factor: number): this {
    const { x, y } = this.scale(factor)
    return this.set(x, y)
  }

  /**
   * Calculates the average of an array of vectors and returns a new vector representing the average.
   *
   * @param vecs An array of vectors.
   * @returns A new vector instance representing the average of the input vectors.
   */
  public static average(vecs: Vector[]): Vector {
    return vecs.reduce((center, v) => center.plus(v), this.zero).scale(1 / vecs.length)
  }

  /**
   * Normalizes the vector, returning a new vector with a magnitude of 1.
   *
   * @returns A new vector instance representing the normalized vector.
   */
  public normalize(): Vector {
    return this.scale(1 / this.magnitude)
  }

  /**
   * Creates a new vector from an angle and a radius using polar coordinates.
   *
   * @param angle The angle in radians.
   * @param radius The radius (magnitude) of the vector.
   * @returns A new vector instance representing the vector in Cartesian coordinates.
   */
  public static fromAngleAndRadius(angle: number, radius: number): Vector {
    const x = Util.roundTo(Math.cos(angle) * radius)
    const y = Util.roundTo(Math.sin(angle) * radius)
    return new Vector(x, y)
  }

  /**
   * A static getter that returns a vector with both x and y set to 0 (the zero vector).
   *
   * @returns A new vector with x and y set to 0.
   */
  public static get zero(): Vector {
    return new Vector(0, 0)
  }
}
