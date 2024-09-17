import { GameObjectMap, GameObjectParams, GameObjectType } from "../.types/gameObject.type.js"
import { Background } from "../gameObjects/background.object.js"
import { Bottle } from "../gameObjects/bottle.object.js"
import { ChickenNormal } from "../gameObjects/chicken_normal.object.js"
import { ChickenSmall } from "../gameObjects/chicken_small.object.js"
import { Clouds } from "../gameObjects/clouds.object.js"
import { Player } from "../gameObjects/player.object.js"
import { randomize, roundTo } from "../util/general.util.js"

export class GameObjectFactory {
	private constructor() {}

	static create<T extends GameObjectType>(type: T, options?: GameObjectParams): GameObjectMap[T] {
		switch (type) {
			case "player":
				return new Player() as GameObjectMap[T]
			case "background":
				return new Background() as GameObjectMap[T]
			case "clouds":
				return new Clouds() as GameObjectMap[T]
			case "bottle":
				if (!options) throw Error(`BottleParams Invalid!`)
				return new Bottle(options) as GameObjectMap[T]
			case "enemy": {
				const randomInt = roundTo(randomize(0, 1))
				return (randomInt === 1 ? new ChickenNormal() : new ChickenSmall()) as GameObjectMap[T]
			}
			default:
				throw Error(`Unknown gameObject type!`)
		}
	}
}
