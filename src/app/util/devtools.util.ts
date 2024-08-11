export function componentCreated(component: any) {
	console.log(`new instance of "${component.constructor.name}" created!`, component)
}
