import { Inspector } from "./inspector";
import { Dragger, DraggerOptions } from "../dragger";
import { CreateWidgetOptions, WidgetChangeOptions, InspectorActiveWidget, InspectorValue } from "../@types/Inspector";
import { FocusElement, Trigger } from "../utilities";

/**
 * Options for creating a Number widget.
 */
export interface AddNumberOptions extends CreateWidgetOptions, DraggerOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Tab index for the input element.
	 */
	tabIndex?: number;
	/**
	 * CSS class to apply to the widget.
	 */
	extraClass?: string;
	/**
	 * Whether to use full number width.
	 */
	fullNumWidth?: boolean;
	/**
	 * Number of digits after the decimal point.
	 */
	precision?: number;
	/**
	 * Step value for incrementing/decrementing.
	 */
	step?: number;
	/**
	 * Unit string to display after the number (e.g. "px", "%").
	 */
	units?: string;
	/**
	 * Whether the widget is disabled.
	 */
	disabled?: boolean;
	/**
	 * Callback function triggered when the value changes visually.
	 */
	onChange?: (value: number) => number | void;
	/**
	 * Callback function triggered after the value changes logically.
	 */
	callback?: (value: number) => void;
	/**
	 * Callback function triggered before the value changes (on start dragging).
	 */
	preCallback?: () => void;
}

/**
 * Interface representing the Number widget.
 */
export interface InspectorNumberWidget extends InspectorActiveWidget
{
	/**
	 * Reference to the internal Dragger instance.
	 */
	dragger: Dragger;
	/**
	 * Sets the valid range for the number.
	 * @param {number} min Minimum value.
	 * @param {number} max Maximum value.
	 */
	setRange: (min: number, max: number) => void;
	/**
	 * Sets the value of the widget.
	 * @param {number | string} [value] The new value.
	 * @param {boolean} [skipEvent] If true, change event is not triggered.
	 */
	setValue: (value?: InspectorValue, skipEvent?: boolean) => void;
}

/**
 * Widget to edit numbers (it adds a dragging mini widget in the right side).
 * @function AddNumber
 * @param {Inspector} that The inspector instance.
 * @param {string | undefined} name The name of the widget.
 * @param {number | undefined} value The initial value.
 * @param {AddNumberOptions | undefined} options Configuration options.
 * @returns {InspectorNumberWidget} The created number widget element.
 */
export function AddNumber(that: Inspector, name?: string, value?: number, options?: AddNumberOptions): InspectorNumberWidget
{
	value = value ?? 0;
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name, "", options) as InspectorNumberWidget;
	that.appendWidget(element, options);

	options.extraClass = "full";
	options.tabIndex = that.tabIndex;
	options.fullNumWidth = true;
	options.precision = options.precision ?? 2;
	options.step = options.step ?? (options.precision == 0 ? 1 : 0.1);

	that.tabIndex++;

	const dragger = new Dragger(value, options);
	dragger.root.style.width = "calc( 100% - 1px )";
	element.querySelector(".wcontent")!.appendChild(dragger.root);

	const _preChange = function (options: AddNumberOptions)
	{
		if (options.preCallback) { options.preCallback.call(element); }
	};
	dragger.root.addEventListener("start_dragging", _preChange.bind(undefined, options));
	element.dragger = dragger;

	if (options.disabled) { dragger.input.setAttribute("disabled", "disabled"); }

	const input = element.querySelector("input") as HTMLInputElement;
	input.addEventListener("change", (e: Event) =>
	{
		const el = e.target as HTMLInputElement;
		Trigger(element, "wbeforechange", el.value);

		that.values.set(valueName, el.value);
		if (options == undefined || typeof (options) == "function") { return; }
		if (options.onChange && dragger.dragging)
		{
			const ret = options.onChange.call(element, parseFloat(el.value));
			if (typeof (ret) == "number") { el.value = ret.toString(); }
		}
		else if ((options.onChange || options.callback) && !dragger.dragging)
		{
			let ret = undefined;
			if (options.callback)
			{
				ret = options.callback.call(element, parseFloat(el.value));
			}
			else if (options.onChange)
			{
				ret = options.onChange.call(element, parseFloat(el.value));
			}
			if (typeof (ret) == "number") { el.value = ret.toString(); }
		}
		Trigger(element, "wchange", el.value);
		if (that.onChange) { that.onChange(valueName, el.value, element); }
	});

	dragger.root.addEventListener("stop_dragging", () =>
	{
		Trigger(input, "change");
	});

	element.setValue = function (value?: InspectorValue, skipEvent?: boolean)
	{
		if (options == undefined || typeof options == "function") { return; }
		if (value === undefined || (typeof value !== 'number' && typeof value !== 'string')) { return; }

		let numValue = (typeof value === 'string') ? parseFloat(value) : value;
		if (options.precision) { numValue = parseFloat(numValue.toFixed(options.precision)); }
		let strValue = numValue.toString();
		strValue += options.units ?? '';
		if (input.value == strValue) { return; }
		input.value = strValue;
		if (!skipEvent) { Trigger(input, "change"); }
	};

	element.setRange = function (min: number, max: number) { dragger.setRange(min, max); };
	element.getValue = function () { return parseFloat(input.value); };
	element.focus = function () { FocusElement(input); };
	element.disable = function () { input.disabled = true; };
	element.enable = function () { input.disabled = false; };
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addNumber(name?: string, value?: number, options?: AddNumberOptions): InspectorNumberWidget;
	}
}

Inspector.prototype.addNumber = function (name?: string, value?: number, options?: AddNumberOptions): InspectorNumberWidget
{
	return AddNumber(this, name, value, options);
};

Inspector.widgetConstructors.number = "addNumber";