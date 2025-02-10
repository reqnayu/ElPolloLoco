import GameObject from "../gameObjects/gameObject.object.js"

/**
 * Manages collision detection and handling between `GameObject`s.
 * Keeps track of all active objects in the game and checks for collisions between them.
 */
export default abstract class CollisionManager {
  /**
   * A map that stores all objects by their unique `id`. The key is the object `id`, and the value is the `GameObject`.
   *
   * @private
   * @type {Map<number, GameObject>}
   */
  private static allObjects: Map<number, GameObject> = new Map()

  /**
   * Resets the collision manager by clearing the list of all objects.
   *
   * @public
   */
  public static reset(): void {
    this.allObjects.clear()
  }

  /**
   * Adds an object to the collision manager.
   *
   * @public
   * @param {number} id - The unique identifier for the object.
   * @param {GameObject} obj - The object to add.
   */
  public static addObject(id: number, obj: GameObject): void {
    this.allObjects.set(id, obj)
  }

  /**
   * Removes an object from the collision manager using its `id`.
   *
   * @public
   * @param {number} id - The unique identifier for the object to remove.
   * @returns {boolean} - Returns `true` if the object was successfully removed, `false` otherwise.
   */
  public static removeObject(id: number): boolean {
    return this.allObjects.delete(id)
  }

  /**
   * Retrieves an object from the collision manager by its `id`.
   *
   * @public
   * @param {number} id - The unique identifier for the object.
   * @returns {GameObject | undefined} - Returns the object if found, or `undefined` if no object with the specified `id` exists.
   */
  public static getObject(id: number): GameObject | undefined {
    return this.allObjects.get(id)
  }

  /**
   * Checks for collisions between all objects in the `allObjects` map.
   * For each pair of objects, it determines whether they are colliding and triggers the collision behavior for each object if a collision occurs.
   *
   * @public
   */
  public static checkAll(): void {
    const allObjects = Array.from(this.allObjects).map(([id, obj]) => obj)
    const lastIndex = allObjects.length - 1

    // Loop through each pair of objects to check for collisions.
    for (let i = 0; i < lastIndex; i++) {
      const obj1 = allObjects[i]
      for (let j = i + 1; j < lastIndex + 1; j++) {
        const obj2 = allObjects[j]

        // If objects are colliding, handle the collision.
        if (!this.areColliding(obj1, obj2)) continue
        obj1.collisionBehaviour?.collide(obj2)
        obj2.collisionBehaviour?.collide(obj1)
      }
    }
  }

  /**
   * Checks if two objects are colliding based on their collision behaviors and colliders.
   *
   * @private
   * @param {GameObject} obj1 - The first object to check for collision.
   * @param {GameObject} obj2 - The second object to check for collision.
   * @returns {boolean} - Returns `true` if the objects are colliding, `false` otherwise.
   */
  private static areColliding(obj1: GameObject, obj2: GameObject): boolean {
    // Check if collision behaviors are defined.
    if (obj1.collisionBehaviour === undefined || obj2.collisionBehaviour === undefined) return false

    // Check for any cooldown timers (i.e., prevent collisions if objects are in a cooldown state).
    if (obj1.collisionBehaviour.cooldownTimer || obj2.collisionBehaviour.cooldownTimer) return false

    // Ensure the objects are of types that can collide with each other.
    if (
      !obj1.collisionBehaviour.targets.includes(obj2.name) ||
      !obj2.collisionBehaviour.targets.includes(obj1.name)
    )
      return false

    // Get the colliders for both objects.
    const collider1 = obj1.collisionBehaviour.collider
    const collider2 = obj2.collisionBehaviour.collider

    // Perform the AABB (Axis-Aligned Bounding Box) collision check.
    if (collider1.x + collider1.width < collider2.x || collider1.x > collider2.x + collider2.width) return false
    if (collider1.y + collider1.height < collider2.y || collider1.y > collider2.y + collider2.height) return false

    // If no condition for non-collision is met, the objects are colliding.
    return true
  }
}
