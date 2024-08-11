import { Player } from "../modules/gameObjects/player.object.js"
import { Bottle } from "../modules/gameObjects/bottle.object.js"
import { Enemy } from "../modules/gameObjects/enemy.object.js"
import { Endboss } from "../modules/gameObjects/endboss.object.js"
import { Background } from "../modules/gameObjects/background.object.js"

export type GameObjectType = "player" | "bottle" | "enemy" | "endboss" | "background"

export type GameObjectMap = {
	player: Player
	bottle: Bottle
	enemy: Enemy
	endboss: Endboss
	background: Background
}
