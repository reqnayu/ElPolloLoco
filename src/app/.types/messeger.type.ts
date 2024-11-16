import { Input } from "../modules/input.module.js"
import { Main } from "../modules/main.module.js"
import { SoundManager } from "../managers/sound.manager.js"
import { TimerManager } from "../managers/timer.manager.js"
import { CollisionManager } from "../managers/collision.manager.js"
import { Gui } from "../modules/gui.module.js"
import { TriggerManager } from "../managers/trigger.manager.js"

export type DispatchType = {
	main: typeof Main
	input: typeof Input
	soundManager: typeof SoundManager
	timerManager: typeof TimerManager
	collisionManager: typeof CollisionManager
	gui: typeof Gui
	triggerManager: typeof TriggerManager
}

export type DispatchMap = {
	[k in keyof DispatchType]: InstanceType<DispatchType[k]>
}
