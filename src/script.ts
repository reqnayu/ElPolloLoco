import Main from "./app/modules/main.module.js"
import Util from "./app/util/general.util.js"

const canvas = Util.getElement<HTMLCanvasElement>("canvas")
const gameElement = Util.getElement("#game")

Main.initialize(canvas, gameElement)
