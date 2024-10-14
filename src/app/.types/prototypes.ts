import { getAllElements, getElement } from "../util/general.util.js"

HTMLElement.prototype.getElement = function <T extends HTMLElement>(selector: string): T {
	return getElement(selector, this)
}

HTMLElement.prototype.getAllElements = function <T extends HTMLElement>(selector: string): T[] {
	return getAllElements(selector, this)
}
