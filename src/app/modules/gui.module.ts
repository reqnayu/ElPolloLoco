export class Gui {
	elements: GuiElements

	constructor() {
		this.elements = {
			"pause-screen": document.querySelector("#pause-screen") as HTMLDialogElement
		}
		document.querySelectorAll("dialog").forEach((dialog) => {
			// dialog.addEventListener("cancel", (e) => e.preventDefault(), false)
		})
	}
}

type GuiElements = {
	"pause-screen": HTMLDialogElement
}
