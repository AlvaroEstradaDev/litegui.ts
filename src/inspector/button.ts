import { CreateWidgetOptions, InspectorValue, InspectorWidget, WidgetChangeOptions } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "./inspector";

/**
 * Options for creating a button widget.
 */
export interface AddButtonOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Whether the button should be disabled.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether to use the micro style for the button.
	 * @default false
	 */
	micro?: boolean;
	/**
	 * The text to display on the button.
	 */
	buttonText?: string;
	/**
	 * Callback function to be executed when the button is clicked.
	 */
	callback?: (value?: string) => void;
}

/**
 * Interface representing the button widget in the Inspector.
 */
export interface InspectorButtonWidget extends InspectorWidget
{
	/**
	 * Adds a callback for the widget click event.
	 * @param {(event: Event) => void} callback - The function to call on click.
	 */
	wclick: (callback: (event: Event) => void) => void;
}

/**
 * Creates an HTML button widget with optional name, value, and options.
 * @function AddButton
 * @param {Inspector} that - The Inspector instance.
 * @param {string} [name] - The name of the button.
 * @param {string} [value] - The value of the button (text label).
 * @param {AddButtonOptions | (() => void)} [options] - The options for the button or a callback function.
 * @returns {InspectorButtonWidget} - The created button widget element.
 */
export function AddButton(that: Inspector, name?: string, value?: string, options?: AddButtonOptions | (() => void)): InspectorButtonWidget
{
	const processedOptions = that.processOptions(options) as AddButtonOptions;
	value = processedOptions.buttonText ?? value;
	value = value ?? "";
	name = name ?? value;

	// Create a valid ID for the widget if one wasn't provided
	const id = that.getValueName(name, processedOptions);
	if (!processedOptions.widgetName)
	{
		processedOptions.widgetName = id;
	}

	let buttonClassName = "";
	if (!name) { buttonClassName = "single"; } // Single button without label
	if (processedOptions.micro) { buttonClassName += " micro"; } // Micro style

	let attrs = "";
	if (processedOptions.disabled) { attrs = "disabled='disabled'"; }

	const title = processedOptions.title?.toString() ?? "";

	// Create the widget structure
	const element = that.createWidget(name, "<button tabIndex='" +
		that.tabIndex + "' " + attrs + "></button>", processedOptions) as InspectorButtonWidget;
	that.tabIndex++;

	// Configure the button element
	const button = element.querySelector("button") as HTMLButtonElement;
	button.setAttribute("title", title);
	button.className = "litebutton " + buttonClassName;
	button.innerHTML = value;

	// Add click event listener
	button.addEventListener("click", (event: MouseEvent) =>
	{
		that.onWidgetChange(element, name, button.innerHTML, processedOptions as unknown as WidgetChangeOptions, false, event);
		LiteGUI.trigger(button, "wclick", value);
	});
	that.appendWidget(element, processedOptions);

	element.wclick = function (callback: (event: Event) => void)
	{
		if (!processedOptions.disabled)
		{
			LiteGUI.bind(element, "wclick", callback);
		}
	};

	element.setValue = function (value: InspectorValue)
	{
		if (value === undefined || (typeof value !== 'string')) { return; }
		button.innerHTML = value;
	};

	element.disable = function () { button.disabled = true; };
	element.enable = function () { button.disabled = false; };

	that.processElement(element, processedOptions);
	return element;
}

/**
 * Creates a widget with multiple HTML buttons.
 * @function AddButtons
 * @param {Inspector} that - The Inspector instance.
 * @param {string} [name] - The name of the widget.
 * @param {string[]} [values] - Array of strings to be displayed on the buttons.
 * @param {AddButtonOptions | ((name: string) => void)} [options] - The options for the buttons or a callback function.
 * @returns {InspectorButtonWidget} - The element containing the buttons.
 */
export function AddButtons(that: Inspector, name?: string, values?: string[], options?: AddButtonOptions | ((name: string) => void)): InspectorButtonWidget
{
	const processedOptions = that.processOptions(options) as AddButtonOptions;
	values = values ?? [];

	// Create a valid ID for the widget
	const id = that.getValueName(name, processedOptions);
	if (!processedOptions.widgetName)
	{
		processedOptions.widgetName = id;
	}

	let code = "";
	// Calculate width for each button to fit in the row
	const w = `calc( ${(100 / values.length).toFixed(3)}% - 4px )`;
	const style = `width: ${w}; width: -moz-${w}; width: -webkit-${w}; margin: 2px;`;

	// Generate HTML for each button
	for (const i in values)
	{
		let title = "";
		if (processedOptions.title)
		{
			if (Array.isArray(processedOptions.title))
			{
				title = processedOptions.title[i];
			}
			else
			{
				title = processedOptions.title as string;
			}
		}
		code += `<button class='litebutton' title='${title}' tabIndex='${that.tabIndex}' style='${style}'>${values[i]}</button>`;
		that.tabIndex++;
	}

	const element = that.createWidget(name, code, processedOptions) as InspectorButtonWidget;
	const buttons = element.querySelectorAll("button");

	// Callback wrapper to handle button clicks
	const buttonCallback = function (button: HTMLButtonElement, evt: PointerEvent)
	{
		that.onWidgetChange(element, id, button.innerHTML, processedOptions as unknown as WidgetChangeOptions, false, evt);
	};

	// Attach event listeners to all buttons
	for (let i = 0; i < buttons.length; ++i)
	{
		const button = buttons[i];
		button.addEventListener("click", buttonCallback.bind(undefined, button));
	}

	that.appendWidget(element, processedOptions);
	that.processElement(element, processedOptions);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addButton(name?: string, value?: string, options?: AddButtonOptions | (() => void)): InspectorButtonWidget;
		addButtons(name?: string, values?: string[], options?: AddButtonOptions | ((name: string) => void)): InspectorButtonWidget;
	}
}

Inspector.prototype.addButton = function (name?: string, value?: string, options?: AddButtonOptions | (() => void)): InspectorButtonWidget
{
	return AddButton(this, name, value, options);
};

Inspector.prototype.addButtons = function (name?: string, values?: string[], options?: AddButtonOptions | ((name: string) => void)): InspectorButtonWidget
{
	return AddButtons(this, name, values, options);
};

Inspector.widgetConstructors.button = "addButton";
Inspector.widgetConstructors.buttons = "addButtons";
