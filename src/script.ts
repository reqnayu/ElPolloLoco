import { Input } from "./app/modules/input.module.js"
import { Main } from "./app/modules/main.module.js"
import { Messager } from "./app/modules/messager.module.js"

const canvas = document.querySelector("canvas")!
const gameElement = document.querySelector("#game") as HTMLElement

export const MESSAGER = new Messager()
const MAIN = new Main(canvas, gameElement)
const INPUT = new Input()

MAIN.startGame()
