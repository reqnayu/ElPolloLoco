import { getElement } from "./app/util/general.util.js"

const canvas = getElement<HTMLCanvasElement>("canvas")
const ctx = canvas.getContext("2d")!

canvas.width = 1280
canvas.height = 720

const sky = ctx.createLinearGradient(0, canvas.height, 0, 0)
sky.addColorStop(0, "#e7eeed")
sky.addColorStop(0.2, "#f9d69d")
sky.addColorStop(0.4, "#b0d4e3")
sky.addColorStop(1, "#0183a8")
ctx.fillStyle = sky
ctx.fillRect(0, 0, canvas.width, canvas.height)

const link = getElement<HTMLAnchorElement>("a")
const img = canvas.toDataURL()
link.href = img
