import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { Trigger } from "../utilities";
import { Inspector } from "./inspector";

/**
 * Options for creating a String widget.
 */
export interface AddStringOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * If true, the input type will be 'password' to hide characters.
	 */
	password?: true;
	/**
	 * If true, automatically sets focus to this input.
	 */
	focus?: boolean;
	/**
	 * If true, triggers the callback on 'keyup' instead of 'change'.
	 */
	immediate?: boolean;
	/**
	 * Whether the input is disabled.
	 */
	disabled?: boolean;
	/**
	 * Placeholder text for the input field.
	 */
	placeHolder?: string;
	/**
	 * Text alignment (e.g., 'right').
	 */
	align?: string;
	/**
	 * URL of an icon to display inside the input.
	 */
	icon?: string;
	/**
	 * Callback function triggered when the Enter key is pressed.
	 */
	onEnter?: () => void;
}

/**
 * Interface representing the String widget.
 */
export interface InspectorStringWidget extends InspectorActiveWidget
{
	/**
	 * Sets the value of the string input.
	 * @param {string} [value] The new string value.
	 * @param {boolean} [skipEvent] If true, prevents triggering the change event.
	 */
	setValue: (value?: InspectorValue, skipEvent?: boolean) => void;
	/**
	 * Sets an icon inside the input field.
	 * @param {string} img URL of the icon image.
	 */
	setIcon: (img: string) => void;
}

/**
 * Widget to edit strings.
 * @function AddString
 * @param {Inspector} that The inspector instance.
 * @param {string} [name] The name/label of the widget.
 * @param {string} [value] The initial value.
 * @param {AddStringOptions} [options] Configuration options.
 * @returns {InspectorStringWidget} The created string widget element.
 */
export function AddString(that: Inspector, name?: string, value?: string, options?: AddStringOptions): InspectorStringWidget
{
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const inputType = options.password ? "password" : "text";
	const focus = options.focus ? "autofocus" : "";
	const isDisabledText = options.disabled ? "disabled" : "";

	const element = that.createWidget(name, "<span class='inputfield full " + isDisabledText +
		"'><input type='" + inputType + "' tabIndex='" + that.tabIndex + "' " + focus + " class='text string' value='" +
		value + "' " + isDisabledText + "/></span>", options) as InspectorStringWidget;
	const input = element.querySelector(".wcontent input") as HTMLInputElement;

	if (options.placeHolder) { input.setAttribute("placeHolder", options.placeHolder); }

	if (options.align == "right")
	{
		input.style.direction = "rtl";
	}

	input.addEventListener(options.immediate ? "keyup" : "change", (e: Event) =>
	{
		const target = e.target as HTMLInputElement;
		const value = target.value;
		const r = that.onWidgetChange(element, valueName, value, options!);
		if (r !== undefined) { input.value = r; }
	});

	if (options.onEnter)
	{
		input.addEventListener("keydown", (e: KeyboardEvent) =>
		{
			if (e.key === 'Enter')
			{
				const target = e.target as HTMLInputElement;
				const value = target.value;
				that.onWidgetChange(element, name!, value, options!);
				if (options!.onEnter) { options!.onEnter(); }
				e.preventDefault();
			}
		});
	}

	that.tabIndex += 1;

	element.setIcon = function (img: string)
	{
		if (!img)
		{
			input.style.background = "";
			input.style.paddingLeft = "";
		}
		else
		{
			input.style.background = `transparent url('${img}') no-repeat left 4px center`;
			input.style.paddingLeft = "1.7em";
		}
	};
	if (options.icon) { element.setIcon(options.icon); }

	element.setValue = function (value?: InspectorValue, skipEvent?: boolean)
	{
		if (value === undefined || value === input.value) { return; }
		if (typeof value !== 'string') { return; }
		input.value = value;
		if (!skipEvent) { Trigger(input, "change"); }
	};
	element.getValue = function () { return input.value; };
	element.focus = function () { this.querySelector("input")?.focus(); };
	element.disable = function () { input.disabled = true; };
	element.enable = function () { input.disabled = false; };
	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addString(name?: string, value?: string, options?: AddStringOptions): InspectorStringWidget;
	}
}

Inspector.prototype.addString = function (name?: string, value?: string, options?: AddStringOptions): InspectorStringWidget
{
	return AddString(this, name, value, options);
};

Inspector.widgetConstructors.string = "addString";
Inspector.widgetConstructors.text = "addString";
