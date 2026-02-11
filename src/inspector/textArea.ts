import { FocusElement, SizeToCSS, Trigger } from "../utilities";
import { CreateWidgetOptions, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";
import { InspectorStringWidget } from "./string";

/**
 * Options for creating a TextArea widget.
 */
export interface AddTextAreaOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	/**
	 * If true, triggers the callback on 'keyup' instead of 'change'.
	 */
	immediate?: boolean;
	/**
	 * Whether the textarea is disabled.
	 */
	disabled?: boolean;
	/**
	 * Placeholder text.
	 */
	placeHolder?: string;
	/**
	 * Text alignment.
	 */
	align?: string;
	/**
	 * URL of an icon (though typically used in inputs, might be supported here).
	 */
	icon?: string;
	/**
	 * Callback triggered on 'keydown' event.
	 */
	onKeyDown?: () => void;
}

/**
 * Widget to edit strings with multiline support.
 * @function AddTextArea
 * @param {Inspector} that The inspector instance.
 * @param {string} [name] The name of the widget.
 * @param {string} [value] The initial text value.
 * @param {AddTextAreaOptions} [options] Configuration options.
 * @returns {InspectorStringWidget} The created text area widget.
 */
export function AddTextArea(that: Inspector, name?: string, value?: string, options?: AddTextAreaOptions): InspectorStringWidget
{
	value = value ?? "";
	const opt = options ?? {};
	const valueName = that.getValueName(name, opt);
	that.values.set(valueName!, value);

	const isDisabledText = opt.disabled ? "disabled" : "";
	const element = that.createWidget(name, "<span class='inputfield textarea " +
		isDisabledText + "'><textarea tabIndex='" + that.tabIndex + "' " +
		isDisabledText + "></textarea></span>", opt) as InspectorStringWidget;
	that.tabIndex++;
	const textarea = element.querySelector(".wcontent textarea") as HTMLTextAreaElement;
	textarea.value = value;
	if (opt.placeHolder) { textarea.setAttribute("placeHolder", opt.placeHolder); }
	textarea.addEventListener(opt.immediate ? "keyup" : "change", (e: Event) =>
	{
		that.onWidgetChange(element, valueName, (e.target as HTMLTextAreaElement)?.value, opt, false, e);
	});
	if (opt.onKeyDown)
	{
		textarea.addEventListener("keydown", opt.onKeyDown);
	}

	if (opt.height)
	{
		textarea.style.height = `calc( ${SizeToCSS(opt.height)} - 5px )`;
	}
	// Textarea.style.height = SizeToCSS( opt.height );
	that.appendWidget(element, opt);
	element.setValue = function (result?: InspectorValue, skipEvent?: boolean)
	{
		if (result === undefined || typeof result !== 'string' || result == textarea.value) { return; }
		value = result;
		textarea.value = result;
		if (!skipEvent) { Trigger(textarea, "change"); }
	};
	element.getValue = function ()
	{
		return textarea.value;
	};
	element.focus = function () { FocusElement(textarea); };
	element.disable = function () { textarea.disabled = true; };
	element.enable = function () { textarea.disabled = false; };
	that.processElement(element, opt);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addTextArea(name?: string, value?: string, options?: AddTextAreaOptions): InspectorStringWidget;
	}
}

Inspector.prototype.addTextArea = function (name?: string, value?: string, options?: AddTextAreaOptions): InspectorStringWidget
{
	return AddTextArea(this, name, value, options);
};

Inspector.widgetConstructors.textarea = "addTextArea";