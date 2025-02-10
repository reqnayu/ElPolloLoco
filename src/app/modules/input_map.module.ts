import { inputMap } from "../.types/types.js"
import KeyBindManager from "../managers/keybind.manager.js"
import Gui from "./gui.module.js"
import Input from "./input.module.js"

/**
 * The InputMap class is responsible for defining the mappings between keys or mouse buttons and actions in the game.
 * It includes separate maps for keyboard inputs and mouse click inputs.
 */
export default abstract class InputMap {
  /**
   * A mapping between keyboard inputs and corresponding game actions.
   * Each action can have a `press` or `release` handler to respond to key events.
   */
  public static keyMap: inputMap<"key"> = {
    /**
     * Toggles fullscreen mode when the fullscreen key is released.
     */
    FULLSCREEN: {
      release: () => Input.toggleFullscreen(),
    },
    /**
     * Toggles the pause state when the pause key is released.
     */
    PAUSE: {
      release: () => Input.togglePause(),
    },
    /**
     * Starts or stops the jump action depending on the key press or release.
     */
    JUMP: {
      press: () => Input.jump(true),
      release: () => Input.jump(false),
    },
    /**
     * Starts or stops the left movement action depending on the key press or release.
     */
    MOVE_LEFT: {
      press: () => Input.startMove("left"),
      release: () => Input.stopMove("left"),
    },
    /**
     * Starts or stops the right movement action depending on the key press or release.
     */
    MOVE_RIGHT: {
      press: () => Input.startMove("right"),
      release: () => Input.stopMove("right"),
    },
    /**
     * Triggers a throw action when the throw key is released.
     */
    THROW: {
      release: () => Input.throw(),
    },
  }

  /**
   * A mapping between mouse click events and corresponding game actions.
   * In addition to the keymap actions, this includes mouse click-specific actions.
   */
  static clickTargetMap: inputMap<"mouse"> = {
    ...this.keyMap,
    /**
     * Opens the settings window when the mouse click is released on the settings button.
     */
    OPEN_SETTINGS: {
      release: () => Gui.openWindow("settings"),
    },
    /**
     * Opens the keybind settings window when the mouse click is released.
     */
    OPEN_KEYBIND_SETTINGS: {
      release: () => Input.openKeyBindSettings(),
    },
    /**
     * Opens the game settings window when the mouse click is released.
     */
    OPEN_GAME_SETTINGS: {
      release: () => Input.openGameSettings(),
    },
    /**
     * Opens the keybind window for a specific key when the mouse click is released on the target.
     */
    OPEN_SINGLE_KEYBIND: {
      release: (target) => KeyBindManager.openSingleKeyBind(target),
    },
    /**
     * Cancels the current keybinding setup when the mouse click is released.
     */
    CANCEL_KEYBIND: {
      release: () => KeyBindManager.cancelKeybind(),
    },
    /**
     * Opens the audio settings window when the mouse click is released.
     */
    OPEN_AUDIO_SETTINGS: {
      release: () => Input.openAudioSettings(),
    },
    /**
     * Closes a container or modal window when the mouse click is released.
     */
    CLOSE_CONTAINER: {
      release: (target) => Input.closeContainer(target),
    },
    /**
     * Restarts the game when the mouse click is released on the restart button.
     */
    RESTART_GAME: {
      release: () => Input.restartGame(),
    },
    /**
     * Toggles the snore sound setting when the mouse click is released.
     */
    TOGGLE_SNORE: {
      release: () => Input.toggleSnore(),
    },
    /**
     * Changes the game language when the mouse click is released on the target.
     */
    CHANGE_LANGUAGE: {
      release: (target) => Input.changeLanguage(target),
    },
    /**
     * Toggles the FPS display when the mouse click is released.
     */
    TOGGLE_FPS: {
      release: () => Input.toggleFps(),
    },
    /**
     * Starts a new game when the mouse click is released.
     */
    NEW_GAME: {
      release: () => Input.newGame(),
    },
    /**
     * Navigates back to the main menu when the mouse click is released.
     */
    MAIN_MENU: {
      release: () => Input.backToMainMenu(),
    },
    /**
     * Opens the imprint or legal information when the mouse click is released.
     */
    IMPRINT: {
      release: () => Input.openImprint(),
    },
    /**
     * Resumes the game when the mouse click is released on the resume button.
     */
    RESUME_GAME: {
      release: () => Input.togglePause(),
    },
    /**
     * Allows the player to buy health when the mouse click is released on the buy health button.
     */
    BUY_HEALTH: {
      release: () => Input.buyHealth(),
    },
    /**
     * Allows the player to buy a bottle when the mouse click is released on the buy bottle button.
     */
    BUY_BOTTLE: {
      release: () => Input.buyBottle(),
    },
  }
}
