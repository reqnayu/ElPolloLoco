import { Main } from "./app/modules/main.module.js"
import { getElement } from "./app/util/general.util.js"

const canvas = getElement<HTMLCanvasElement>("canvas")
const gameElement = getElement("#game")

await Main.initialize(canvas, gameElement)