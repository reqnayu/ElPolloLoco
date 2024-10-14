import { Input } from "./app/modules/input.module.js"
import { Main } from "./app/modules/main.module.js"
import { Messager } from "./app/modules/messager.module.js"
import { getElement } from "./app/util/general.util.js"

const canvas = getElement<HTMLCanvasElement>("canvas")
const gameElement = getElement("#game")

export const MESSAGER = new Messager()
const MAIN = new Main(canvas, gameElement)
await MAIN.initialize()
const INPUT = new Input()

// MAIN.startGame()
