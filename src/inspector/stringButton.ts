import { FocusElement, SizeToCSS, Trigger } from "../utilities";
import { CreateWidgetOptions, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";
import { InspectorStringWidget } from "./string";

/**
 * Options for creating a StringButton widget.
 */
export interface AddStringButtonOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	/**
	 * Whether the input is disabled.
	 */
	disabled?: boolean;
	/**
	 * Text to display on the button.
	 * @default "..."
	 */
	button?: string;
	/**
	 * URL of an icon to display inside the input.
	 */
	icon?: string;
	/**
	 * Width of the button, auto by default.
	 */
	buttonWidth?: string | number;
	/**
	 * Callback function triggered when the button is clicked.
	 */
	onClick?: (value: string, e: Event) => void;
}

/**
 * Widget to edit strings, but it adds a button behind (useful to search values somewhere in case the user does not remember the name).
 * @function AddStringButton
 * @param {Inspector} that The inspector instance.
 * @param {string} [name] The name of the field.
 * @param {string} [value] The string to show.
 * @param {AddStringButtonOptions} [options] Configuration options.
 * @returns {InspectorStringWidget} The created string widget element.
 */
export function AddStringButton(that: Inspector, name?: string, value?: string, options?: AddStringButtonOptions): InspectorStringWidget
{
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName!, value);

	const element = that.createWidget(name,
		`<span class='inputfield button'><input type='text' tabIndex='${that.tabIndex}' ` +
		`class='text string' value='' ${options.disabled ? "disabled" : ""}/></span>` +
		`<button class='micro'>${options.button ?? "..."}</button>`, options) as InspectorStringWidget;
	const input = element.querySelector(".wcontent input") as HTMLInputElement;
	input.value = value;
	input.addEventListener("change", (e: Event) =>
	{
		const r = that.onWidgetChange(element, valueName, (e.target as HTMLInputElement)!.value, options as unknown as WidgetChangeOptions);
		if (r !== undefined) { input.value = r; }
	});

	if (options.disabled) { input.setAttribute("disabled", "disabled"); }

	const button = element.querySelector(".wcontent button") as HTMLInputElement;

	element.setIcon = function (img: string)
	{
		if (!img)
		{
			button.style.backgroundColor = "";
			button.style.backgroundImage = "";
			button.style.backgroundRepeat = "";
			button.style.backgroundPosition = "";
			button.style.backgroundSize = "";
			button.style.paddingLeft = "";
			button.innerHTML = options.button ?? "...";
		}
		else
		{
			button.innerHTML = "";
			button.style.backgroundColor = "transparent";
			button.style.backgroundImage = `url('${img}')`;
			button.style.backgroundRepeat = "no-repeat";
			button.style.backgroundPosition = "center";
			button.style.backgroundSize = "contain";
			button.style.paddingLeft = "";
			button.style.width = "2em";
			button.style.minWidth = "2em";
			button.style.height = "100%";
			button.style.minHeight = "1.5em";
			button.style.padding = "0";
			button.style.flexShrink = "0";
		}
	};

	button.addEventListener("click", (e: Event) =>
	{
		if (options!.onClick)
		{
            options!.onClick.call(element, input.value, e);
		}
	});

	options.buttonWidth = options.buttonWidth ?? 'auto';
	if (options.buttonWidth)
	{
		const buttonContent = element.querySelector('.wcontent') as HTMLElement;
		if (options.buttonWidth === 'auto' || options.buttonWidth === 'fit-content')
		{
			buttonContent.style.display = 'flex';
			buttonContent.style.alignItems = 'center';
			const inputField = element.querySelector(".inputfield") as HTMLInputElement;
			inputField.style.width = 'auto';
			inputField.style.flexGrow = '1';
			button.style.width = 'auto';
			button.style.whiteSpace = 'nowrap';
			button.style.padding = '0 10px';
			button.style.margin = '0 0 0 4px';
		}
		else
		{
			button.style.width = SizeToCSS(options.buttonWidth) ?? '0px';
			const inputField = element.querySelector(".inputfield") as HTMLInputElement;
			inputField.style.width = `calc( 100% - ${button.style.width} - 6px)`;
		}
	}


	that.tabIndex += 1;
	that.appendWidget(element, options);
	element.setValue = function (value?: InspectorValue, skipEvent?: boolean)
	{
		if (value === undefined || value === input.value) { return; }
		if (typeof value !== 'string') { return; }
		input.value = value;
		if (!skipEvent) { Trigger(input, "change"); }
	};
	element.disable = function () { input.disabled = true; button.disabled = true; };
	element.enable = function () { input.disabled = false; button.disabled = false; };
	element.getValue = function () { return input.value; };
	element.focus = function () { FocusElement(input); };
	that.processElement(element, options);
	if (options.icon) { element.setIcon(options.icon); }
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addStringButton(name?: string, value?: string, options?: AddStringButtonOptions): InspectorStringWidget;
	}
}

Inspector.prototype.addStringButton = function (name?: string, value?: string, options?: AddStringButtonOptions): InspectorStringWidget
{
	return AddStringButton(this, name, value, options);
};

Inspector.widgetConstructors.stringbutton = "addStringButton";