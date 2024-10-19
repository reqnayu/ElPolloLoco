import { roundTo } from "../util/general.util.js"

export class Vector {
	constructor(public x: number, public y: number) {}

	get magnitude(): number {
		return roundTo(Math.sqrt(this.x ** 2 + this.y ** 2))
	}

	set(x: number, y: number): this {
		this.x = x
		this.y = y
		return this
	}

	setToVector({ x, y }: Vector): this {
		return this.set(x, y)
	}

	/**
	 * modifies instance
	 */
	add(v: Vector): this {
		const { x, y } = this.plus(v)
		this.x = x
		this.y = y
		return this
	}

	/**
	 * returns new instance
	 */
	plus(v: Vector): Vector {
		return new Vector(this.x + v.x, this.y + v.y)
	}

	/**
	 * returns new instance
	 */
	scale(factor: number): Vector {
		return new Vector(this.x * factor, this.y * factor)
	}

	/**
	 * modifies instance
	 */
	toScaled(factor: number): this {
		const { x, y } = this.scale(factor)
		return this.set(x, y)
	}

	static average(vecs: Vector[]): Vector {
		return vecs.reduce((center, v) => center.plus(v), new Vector(0, 0)).scale(1 / vecs.length)
	}

	normalize(): Vector {
		return this.scale(1 / this.magnitude)
	}

	static fromAngleAndRadius(angle: number, radius: number): Vector {
		const x = roundTo(Math.cos(angle) * radius)
		const y = roundTo(Math.sin(angle) * radius)
		return new Vector(x, y)
	}
}
