import GameObject from "../gameObjects/gameObject.object.js"
import { AnimationState } from "./types.js"

export interface Behaviour {
	onAttach(gameObject: GameObject): this
}

export interface Updateable extends Behaviour {
	gameObject: GameObject
	update(deltaTime: number): void
}

export interface Drawable extends Behaviour {
	draw(ctx: CanvasRenderingContext2D): void
}

export interface Animatable extends Updateable {
	animationName: AnimationState
	setAnimation(animationName: AnimationState): void
}
