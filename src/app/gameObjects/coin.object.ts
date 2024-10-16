import { BehaviourFactory } from "../factories/behaviour.factory.js";
import { Assets, getAsset } from "../managers/asset_manager.module.js";
import { GameObject } from "./gameObject.object.js";

@Assets({
    img: [
        "8_coin/coin_1.png"
    ]
})
export class Coin extends GameObject {
    isFriendly: boolean = false
    constructor() {
        super("coin")
        this.dimensions.set(300, 301).scale(0.5)
        this.position.set(300, 0)
        this.initialize()
    }

    protected initialize(): void {
        this.image = getAsset<"img">("8_coin/coin_1.png")
        this.setBehaviours()
        super.initialize("8_coin/coin_1.png")
    }

    protected setBehaviours(): void {
        this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
        this.collisionBehaviour = BehaviourFactory.create("collision", { offsets: [0, 0, 0, 0] }).onAttach(this)
    }

    collisionCallback(target: GameObject): void {
        console.log("coin collected!")
    }
}