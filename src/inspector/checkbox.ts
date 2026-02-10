import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "./inspector";

/**
 * Options for creating a checkbox widget.
 */
export interface AddCheckboxOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Text to show. If labelOn or labelOff aren't set it will take this value.
	 */
	label?: string;

	/**
	 * Text to show when the checkbox is 'on'.
	 */
	labelOn?: string;

	/**
	 * Text to show when the checkbox is 'off'.
	 */
	labelOff?: string;

	/**
	 * Callback function to call once the value changes.
	 */
	callback?: (value: boolean) => void;
}

/**
 * Interface representing the checkbox widget.
 */
export interface InspectorCheckboxWidget extends InspectorActiveWidget
{
	/**
	 * Updates the value of the checkbox.
	 * @param {boolean} [value] The new value.
	 * @param {boolean} [skipEvent] If true, the callback will not be triggered.
	 */
	setValue: (value?: InspectorValue, skipEvent?: boolean) => void;
}

/**
 * Widget to edit a boolean value using a checkbox.
 * @function AddCheckbox
 * @param {Inspector} that The Inspector instance.
 * @param {string} name The name/label of the widget.
 * @param {boolean} value The initial boolean value.
 * @param {AddCheckboxOptions} [options] Configuration options for the checkbox.
 * @returns {InspectorCheckboxWidget} The created checkbox widget element.
 */
export function AddCheckbox(that: Inspector, name: string, value: boolean, options?: AddCheckboxOptions): InspectorCheckboxWidget
{
	value = value ?? false;
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	// Determine labels for on/off states
	const labelOn = options.labelOn ?? options.label ?? "on";
	const labelOff = options.labelOff ?? options.label ?? "off";
	const label = (value ? labelOn : labelOff);

	// Create the widget element
	const element = that.createWidget(name,
		`<span class='inputfield'><span tabIndex='${that.tabIndex}' class='fixed flag checkbox ${value ? "on" : "off"}'>${label}</span></span>`,
		options) as InspectorCheckboxWidget;
	that.tabIndex++;

	// Event handling for keypress (Space) to toggle checkbox
	const checkbox = element.querySelector(".wcontent .checkbox") as HTMLElement;
	checkbox.addEventListener("keypress", (e: KeyboardEvent) =>
	{
		if (e.code === "Space" || e.key === " ") { LiteGUI.trigger(checkbox, "click"); }
	});

	// Toggle value on click
	element.addEventListener("click", () =>
	{
		value = !value;
		element.querySelector("span.flag")!.innerHTML = value ? labelOn : labelOff;
		if (value)
		{
			checkbox.classList.add("on");
		}
		else
		{
			checkbox.classList.remove("on");
		}
		that.onWidgetChange(element, valueName, value, options as unknown as WidgetChangeOptions);
	});

	element.getValue = function ()
	{
		return value;
	};

	element.setValue = (v?: InspectorValue, skipEvent?: boolean) =>
	{
		if (v === undefined || typeof v !== 'boolean') { return; }
		if (value != v)
		{
			value = v;
			that.values.set(valueName, v);
			if (!skipEvent)
			{
				LiteGUI.trigger(checkbox, "click");
			}
		}
	};

	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addCheckbox(name: string, value: boolean, options?: AddCheckboxOptions): InspectorCheckboxWidget;
	}
}

Inspector.prototype.addCheckbox = function (name: string, value: boolean, options?: AddCheckboxOptions): InspectorCheckboxWidget
{
	return AddCheckbox(this, name, value, options);
};

Inspector.widgetConstructors.checkbox = "addCheckbox";
Inspector.widgetConstructors.boolean = "addCheckbox";
