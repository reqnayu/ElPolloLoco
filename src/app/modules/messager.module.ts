import { DispatchMap, DispatchType } from "../.types/messeger.type.js"

export class Messager {
	elements: Map<keyof DispatchType, DispatchMap[keyof DispatchType]> = new Map()
	constructor() {}

	dispatch<T extends keyof DispatchType>(type: T): DispatchMap[T] {
		const el = this.elements.get(type)
		if (!el) throw Error(`element of type "${type.toString()}" not found!`)
		return el as DispatchMap[T]
	}
}
