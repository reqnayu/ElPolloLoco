export function delegateEvent(
	type: keyof DocumentEventMap,
	callback: (event: Event) => any,
	container: Element = document.documentElement
) {
	container.addEventListener(type, (event) => {
		callback(event)
	})
}

export function throttle(cb: (...args: any[]) => any, delay = 1000) {
	let shouldWait = false
	return (...args: any[]) => {
		if (shouldWait) return
		cb(...args)
		shouldWait = true
		setTimeout(() => (shouldWait = false), delay)
	}
}

export function roundTo(number: number, digits?: number): number {
	const _digits = digits || 1
	return Math.round(number * _digits) / _digits
}
