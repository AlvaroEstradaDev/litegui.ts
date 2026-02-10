import { LiteGUIObject } from "../@types/globals";

/**
 * The options for the standard button class construction.
 */
export interface ButtonOptions
{
	/**
	 * Callback function to be executed when the button is clicked.
	 */
	callback?: () => void;
}

/**
 * Standard button class.
 * @class Button
 */
export class Button implements LiteGUIObject
{
	/** Root element of the widget */
	public root: HTMLDivElement;
	/** Button element inside the root */
	public content: HTMLButtonElement;
	/** Callback function to be executed when the button is clicked */
	public callback?: () => void;

	/**
	 * Creates an instance of the Button widget.
	 * @param {string} value - The text to be displayed on the button.
	 * @param {ButtonOptions | Function} [options] - Configuration options or a callback function.
	 */
	constructor(value: string, options: (() => void) | ButtonOptions = {})
	{
		if (typeof (options) === "function") { options = { callback: options }; }

		const element = document.createElement("div") as HTMLDivElement;
		element.className = "litegui button";

		this.root = element;
		const button = document.createElement("button");
		button.className = "litebutton";
		this.content = button;
		element.appendChild(button);

		button.innerHTML = value;
		button.addEventListener("click", () =>
		{
			this.click();
		});

		if (options.callback) { this.callback = options.callback; }
	}

	/**
	 * Triggers the click event on the button.
	 */
	click()
	{
		if (this.callback) { this.callback(); }
	}
}
