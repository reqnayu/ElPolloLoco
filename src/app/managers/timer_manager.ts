import { MESSAGER } from "../../script.js"
import { Interval } from "../modules/interval.module.js"
import { Timer } from "../modules/timer.module.js"

export class TimerManager {
	private allTimers: Timer[] = []
	private allIntervals: Interval[] = []
	private main

	constructor() {
		this.main = MESSAGER.dispatch("main")
		MESSAGER.elements.set("timerManager", this)
		window.addEventListener("pausegame", () => this.pauseAll())
		window.addEventListener("resumegame", () => this.resumeAll())
	}

	toggleAll(): void {
		this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.toggle())
	}

	pauseAll(): void {
		this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.pause())
	}

	resumeAll(): void {
		this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.resume())
	}

	private get allTimersAndIntervals(): (Timer | Interval)[] {
		return [...this.allTimers, ...this.allIntervals]
	}

	addTimer(timer: Timer): void {
		this.allTimers.push(timer)
		// if (this.main.isPaused) this.pauseAll()
	}

	addInterval(interval: Interval): void {
		this.allIntervals.push(interval)
		// if (this.main.isPaused) this.pauseAll()
	}
}
