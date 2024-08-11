import { Input } from "../modules/input.module.js"
import { Main } from "../modules/main.module.js"

export type DispatchType = {
	main: typeof Main
	input: typeof Input
}

export type DispatchMap = {
	[k in keyof DispatchType]: InstanceType<DispatchType[k]>
}
