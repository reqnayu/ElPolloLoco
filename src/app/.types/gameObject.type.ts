import { Background } from "../gameObjects/background.object.js"
import { Bottle } from "../gameObjects/bottle.object.js"
import { Clouds } from "../gameObjects/clouds.object.js"
import { Endboss } from "../gameObjects/endboss.object.js"
import { Enemy } from "../gameObjects/enemy.object.js"
import { Player } from "../gameObjects/player.object.js"
import { Vector } from "../modules/vector.module.js"

export type GameObjectType = "player" | "bottle" | "enemy" | "endboss" | "background" | "clouds"

export type GameObjectMap = {
	player: Player
	bottle: Bottle
	clouds: Clouds
	enemy: Enemy
	endboss: Endboss
	background: Background
}

export type BottleParams = {
	position: Vector
}

export type GameObjectParams = BottleParams
