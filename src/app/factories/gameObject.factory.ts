import { bottleParams, coinParams, GameObjectMap, GameObjectParams, GameObjectType } from "../.types/types.js"
import Background from "../gameObjects/background.object.js"
import Bottle from "../gameObjects/bottle.object.js"
import ChickenNormal from "../gameObjects/chicken_normal.object.js"
import ChickenSmall from "../gameObjects/chicken_small.object.js"
import Clouds from "../gameObjects/clouds.object.js"
import Coin from "../gameObjects/coin.object.js"
import Endboss from "../gameObjects/endboss.object.js"
import Player from "../gameObjects/player.object.js"
import Util from "../util/general.util.js"

export default abstract class GameObjectFactory {
	public static create<T extends GameObjectType>(type: T, options?: GameObjectParams[T]): GameObjectMap[T] {
		switch (type) {
			case "player":
				return new Player() as GameObjectMap[T]
			case "background":
				return new Background() as GameObjectMap[T]
			case "clouds":
				return new Clouds() as GameObjectMap[T]
			case "bottle":
				return new Bottle(options as bottleParams) as GameObjectMap[T]
			case "enemy": {
				const randomInt = Util.randomize(0, 1, true)
				return (randomInt === 0 ? new ChickenNormal() : new ChickenSmall()) as GameObjectMap[T]
			}
			case "endboss": {
				return new Endboss() as GameObjectMap[T]
			}
			case "coin": {
				const params = options as coinParams
				return new Coin(params) as GameObjectMap[T]
			}
			default:
				throw Error(`Unknown gameObject type!`)
		}
	}
}
