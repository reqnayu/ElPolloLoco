import Interval from "../modules/interval.module.js"
import Timer from "../modules/timer.module.js"

export default abstract class TimerManager {
	private static allTimers: Timer[] = []
	private static allIntervals: Interval[] = []

	public static initialize(): void {
		window.addEventListener("resumegame", () => this.resumeAll())
		window.addEventListener("pausegame", () => this.pauseAll())
	}

	public static toggleAll(): void {
		this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.toggle())
	}

	public static pauseAll(): void {
		this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.pause())
	}

	public static resumeAll(): void {
		this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.resume())
	}

	private static get allTimersAndIntervals(): (Timer | Interval)[] {
		return [...this.allTimers, ...this.allIntervals]
	}

	public static addTimer(timer: Timer): void {
		this.allTimers.push(timer)
	}

	public static addInterval(interval: Interval): void {
		this.allIntervals.push(interval)
	}
}
