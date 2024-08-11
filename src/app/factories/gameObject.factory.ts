import { Background } from "../modules/gameObjects/background.object.js"
import { Player } from "../modules/gameObjects/player.object.js"
import { GameObjectMap, GameObjectType } from "../.types/gameObject.type.js"

export class GameObjectFactory {
	static create<T extends GameObjectType>(type: T): GameObjectMap[T] {
		switch (type) {
			case "player":
				return new Player() as GameObjectMap[T]
			case "background":
				return new Background() as GameObjectMap[T]
			default:
				throw Error(`Unknown gameObject type!`)
		}
	}
}
