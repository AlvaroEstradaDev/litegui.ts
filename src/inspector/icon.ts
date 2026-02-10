import { LiteGUI } from "../core";
import { Inspector } from "./inspector";
import { CreateWidgetOptions, InspectorValue, InspectorWidget, WidgetChangeOptions } from "../@types/Inspector";

/**
 * Options for configuring the Icon widget.
 * Extends universal widget options with icon-specific properties.
 */
export interface AddIconOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * URL of the image to use as the icon.
	 */
	imageURL?: string;
	/**
	 * Size of the icon in pixels (width and height).
	 */
	size?: number;
	/**
	 * X offset for the background position.
	 */
	x?: number;
	/**
	 * Index to calculate x offset (-index * width).
	 */
	index?: number;
	/**
	 * If false, the icon acts as a momentary button (blinks) instead of a toggle.
	 * @default true
	 */
	toggle?: boolean;
	/**
	 * Callback function triggered when value changes.
	 */
	callback?: (value: boolean) => void;
}

/**
 * Interface representing the DOM element for an Icon widget.
 */
export interface InspectorIconWidget extends InspectorWidget
{
	/**
	 * Updates the value (state) of the icon.
	 * @param {boolean} value New value (true for active/toggled).
	 * @param {boolean} [skipEvent] If true, prevents triggering the change event.
	 */
	setValue: (value: InspectorValue, skipEvent?: boolean) => void;
}


/**
 * Adds an icon widget to the Inspector.
 * @function AddIcon
 * @param {Inspector} that The Inspector instance calling this function.
 * @param {string} [name] The name/label of the icon widget.
 * @param {boolean} [value] The initial toggle state of the icon.
 * @param {AddIconOptions} [options] Configuration options for the icon.
 * @returns {InspectorIconWidget} The created icon widget element.
 */
export function AddIcon(that: Inspector, name?: string,
	value?: boolean, options?: AddIconOptions): InspectorIconWidget
{
	const processedOptions = that.processOptions(options) as AddIconOptions;

	// Initialize defaults
	name = name ?? '';
	value = value ?? false;
	const imgURL = processedOptions.imageURL ?? "";
	const width = processedOptions.width ?? processedOptions.size ?? 20;
	const height = processedOptions.height ?? processedOptions.size ?? 20;

	// Create widget structure
	const element = that.createWidget(name, `<span class='icon' ${processedOptions.title ?
		`title='${processedOptions.title}'` : ""} tabIndex='${that.tabIndex}'></span>`,
	processedOptions) as InspectorIconWidget;
	that.tabIndex++;
	const content = element.querySelector("span.wcontent") as HTMLElement;
	const icon = element.querySelector("span.icon") as HTMLElement;

	// Calculate background position
	let x = processedOptions.x ?? 0;
	if (processedOptions.index) { x = processedOptions.index * -width; }
	const y = value ? height : 0;

	// Apply styles to elements
	element.style.margin = "0 2px";
	element.style.padding = "0";
	content.style.margin = "0";
	content.style.padding = "0";

	icon.style.display = "inline-block";
	icon.style.cursor = "pointer";
	icon.style.width = `${width}px`;
	icon.style.height = `${height}px`;
	if (imgURL) { icon.style.backgroundImage = `url('${imgURL}')`; }
	icon.style.backgroundSize = "contain";
	icon.style.backgroundPosition = `${x}px ${y}px`;

	// Handle user interaction
	icon.addEventListener("mousedown", (e: MouseEvent) =>
	{
		e.preventDefault();
		value = !value;
		const ret = that.onWidgetChange(element, name!, value, processedOptions as unknown as WidgetChangeOptions);
		LiteGUI.trigger(element, "wclick", value);

		if (ret !== undefined) { value = ret; }

		const y = value ? height : 0;
		icon.style.backgroundPosition = `${x}px ${y}px`;

		// Momentary switch logic: blink and return to off state if toggle is false
		if (processedOptions.toggle === false)
		{
			setTimeout(() =>
			{
				icon.style.backgroundPosition = `${x}px 0px`;
				value = false;
			}, 200);
		}

	});
	that.appendWidget(element, options);

	// Define public methods
	element.setValue = (v: InspectorValue, skipEvent?: boolean) =>
	{
		if (v === undefined || typeof v !== 'boolean') { return; }
		value = v;
		const y = value ? height : 0;
		icon.style.backgroundPosition = `${x}px ${y}px`;
		if (!skipEvent)
		{
			that.onWidgetChange(element, name!, value, processedOptions as unknown as WidgetChangeOptions);
		}
	};
	element.getValue = function () { return value; };
	that.processElement(element, processedOptions);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addIcon(name?: string, value?: boolean, options?: AddIconOptions): InspectorIconWidget;
	}
}

Inspector.prototype.addIcon = function (name?: string, value?: boolean, options?: AddIconOptions): InspectorIconWidget
{
	return AddIcon(this, name, value, options);
};

Inspector.widgetConstructors.icon = "addIcon";