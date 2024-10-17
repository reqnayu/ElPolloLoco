import { getAllElements, getElement } from "../util/general.util.js"

HTMLElement.prototype.getElement = function <T extends HTMLElement>(selector: string): T {
	return getElement(selector, this)
}

HTMLElement.prototype.getAllElements = function <T extends HTMLElement>(selector: string): T[] {
	return getAllElements(selector, this)
}

Array.prototype.remove = function (element: any): boolean {
	const i = this.indexOf(element)
	const removed = this.splice(i, 1)
	return removed.length === 0
}

Map.prototype.filter = function <K, V>(filterFunc: ([key, value]: [K, V]) => boolean) {
	const filteredArray = Array.from(this).filter(filterFunc)
	return new Map<K, V>(filteredArray)
}
