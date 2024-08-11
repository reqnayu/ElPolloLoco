export class Vector {
	constructor(public x: number, public y: number) {}

	set(x: number, y: number): this {
		this.x = x
		this.y = y
		return this
	}

	setToVector({ x, y }: Vector): this {
		return this.set(x, y)
	}

	add(v: Vector): void {
		this.x += v.x
		this.y += v.y
	}

	scale(factor: number): Vector {
		return new Vector(this.x * factor, this.y * factor)
	}

	toScaled(factor: number): this {
		const { x, y } = this.scale(factor)
		return this.set(x, y)
	}
}
