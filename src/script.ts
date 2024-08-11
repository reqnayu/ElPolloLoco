import { Input } from "./app/modules/input.module.js"
import { Main } from "./app/modules/main.module.js"
import { Messager } from "./app/modules/messager.module.js"

const canvas = document.querySelector("canvas")!

export const MESSAGER = new Messager()
const MAIN = new Main(canvas)
const INPUT = new Input()

MAIN.startGame()
