import Util from "../util/general.util.js"

export default class Vector {
	constructor(public x: number, public y: number) {}

	public get magnitude(): number {
		return Util.roundTo(Math.sqrt(this.x ** 2 + this.y ** 2))
	}

	public set(x: number, y: number): this
	public set({ x, y }: Vector): this
	public set(xOrVector: number | Vector, y?: number): this {
		const setFromVector: boolean = xOrVector instanceof Vector
		this.x = setFromVector ? (xOrVector as Vector).x : (xOrVector as number)
		this.y = setFromVector ? (xOrVector as Vector).y : y!
		return this
	}

	public copy(): Vector {
		return new Vector(this.x, this.y)
	}

	public static copy(v: Vector): Vector {
		return new Vector(v.x, v.y)
	}

	/**
	 * modifies instance
	 */
	public add(v: Vector): this {
		const { x, y } = this.plus(v)
		this.x = x
		this.y = y
		return this
	}

	/**
	 * returns new instance
	 */
	public plus(v: Vector): Vector {
		return new Vector(this.x + v.x, this.y + v.y)
	}

	/**
	 * returns new instance
	 */
	public scale(factor: number): Vector {
		return new Vector(this.x * factor, this.y * factor)
	}

	/**
	 * modifies instance
	 */
	public toScaled(factor: number): this {
		const { x, y } = this.scale(factor)
		return this.set(x, y)
	}

	public static average(vecs: Vector[]): Vector {
		return vecs.reduce((center, v) => center.plus(v), this.zero).scale(1 / vecs.length)
	}

	public normalize(): Vector {
		return this.scale(1 / this.magnitude)
	}

	public static fromAngleAndRadius(angle: number, radius: number): Vector {
		const x = Util.roundTo(Math.cos(angle) * radius)
		const y = Util.roundTo(Math.sin(angle) * radius)
		return new Vector(x, y)
	}

	public static get zero(): Vector {
		return new Vector(0, 0)
	}
}
