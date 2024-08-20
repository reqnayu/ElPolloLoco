import { GameObject } from "../gameObjects/gameObject.object.js"
import { AnimationState } from "./animation.type.js"

export interface Behaviour {
	onAttach(gameObject: GameObject): this
}

export interface Updateable extends Behaviour {
	update(deltaTime: number): void
}

export interface Drawable extends Behaviour {
	draw(ctx: CanvasRenderingContext2D): void
}

export interface Animatable extends Updateable, Behaviour {
	animationName: AnimationState
	setAnimation(animationName: AnimationState): void
}

export interface Audible {}
