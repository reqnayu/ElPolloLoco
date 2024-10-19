export function runOnce<T extends (...args: any) => any>(func: T): T {
	let hasRun = false
	return ((...args) => {
		if (hasRun) return
		func(...args)
		hasRun = true
	}) as T
}
