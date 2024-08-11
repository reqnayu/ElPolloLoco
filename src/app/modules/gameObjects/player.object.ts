import { GameObject, getImages } from "./gameObject.object.js"
import { BehaviourFactory } from "../../factories/behaviour.factory.js"
import { IdleState } from "../../states/idle.state.js"
import { AnimationSet } from "src/app/.types/animation.type.js"

export class Player extends GameObject {
	walkSpeed = 20
	jumpStrength = 40

	constructor() {
		super("Player")
		this.dimensions.set(610, 1200).toScaled(0.5)
		this.position.set(0, 0)
		this.initialize()
	}

	protected async initialize(): Promise<void> {
		await this.setBehaviours()
		await super.initialize("./app/assets/img/2_character_pepe/1_idle/idle/I-1.png")
		this.setState(new IdleState())
	}

	protected async setBehaviours(): Promise<void> {
		const animationSet = await getAnimationSet()
		const { walkSpeed, jumpStrength } = this
		this.image = animationSet.idle[0]

		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed, jumpStrength }).onAttach(this)
		this.gravityBehavoir = BehaviourFactory.create("gravity").onAttach(this)
	}
}

async function getAnimationSet(): Promise<AnimationSet> {
	return {
		idle: await getSingleAnimation("./app/assets/img/2_character_pepe/1_idle/idle", 1, 10),
		idle_long: await getSingleAnimation("./app/assets/img/2_character_pepe/1_idle/idle_long", 11, 20),
		walk: await getSingleAnimation("./app/assets/img/2_character_pepe/2_walk", 21, 26),
		jump: await getSingleAnimation("./app/assets/img/2_character_pepe/3_jump", 31, 39),
		hurt: await getSingleAnimation("./app/assets/img/2_character_pepe/4_hurt", 41, 43),
		dead: await getSingleAnimation("./app/assets/img/2_character_pepe/5_dead", 51, 57)
	}
}

function getSingleAnimation(path: string, startNumber: number, endNumber: number): Promise<CanvasImageSource[]> {
	const assetPaths: string[] = []
	const assetInitial = path
		.split("/")
		.at(-1)!
		.match(/(?<=_?)[a-z]/g)![0]
		.toUpperCase()
	for (let i = startNumber; i <= endNumber; i++) {
		const src = `${path}/${assetInitial}-${i}.png`
		assetPaths.push(src)
	}
	return getImages(assetPaths)
}
