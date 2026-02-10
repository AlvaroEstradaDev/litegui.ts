import { Slider } from "../widgets";
import type { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";

/**
 * Options for creating a Slider widget.
 */
export interface AddSliderOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Minimum value of the range.
	 */
	min?: number;
	/**
	 * Maximum value of the range.
	 */
	max?: number;
	/**
	 * Step size for the slider.
	 */
	step?: number;
	/**
	 * Callback function triggered when value changes.
	 */
	callback?: (value: number) => void;
}

/**
 * Interface representing the Slider widget.
 */
export interface InspectorSliderWidget extends InspectorActiveWidget
{
	/**
	 * Reference to the internal Slider widget.
	 */
	slider: Slider;
	/**
	 * Sets the value of the slider.
	 * @param {number} [value] The new value.
	 * @param {boolean} [skipEvent] If true, prevents triggering the change event.
	 */
	setValue: (value?: InspectorValue, skipEvent?: boolean) => void;
}

/**
 * Widget to edit a number using a slider.
 * @function AddSlider
 * @param {Inspector} that The inspector instance.
 * @param {string | undefined} name The name of the widget.
 * @param {number | undefined} value The initial value.
 * @param {AddSliderOptions | undefined} options Configuration options.
 * @returns {InspectorSliderWidget} The created slider widget element.
 */
export function AddSlider(that: Inspector, name?: string, value?: number, options?: AddSliderOptions): InspectorSliderWidget
{
	value = value ?? 0;
	options = options ?? {};
	options.min = options.min ?? 0;
	options.max = options.max ?? 1;
	options.step = options.step || 0.01;
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name,
		"<span class='inputfield full'>\n<input tabIndex='" + that.tabIndex +
		"' type='text' class='slider-text fixed liteslider-value' value='' /><span class='slider-container'></span></span>",
		options) as InspectorSliderWidget;

	const slider_container = element.querySelector(".slider-container") as HTMLElement;

	const slider = new Slider(value, options);
	element.slider = slider;
	slider_container.appendChild(slider.root);

	// Text change -> update slider
	const skip_change = false; // Used to avoid recursive loops
	const textInput = element.querySelector(".slider-text") as HTMLInputElement;
	textInput.value = value.toString();
	textInput.addEventListener('change', () =>
	{
		if (skip_change) { return; }
		const v = parseFloat(textInput.value);
		value = v;
		slider.setValue(v);
		that.onWidgetChange(element, valueName, v, options as unknown as WidgetChangeOptions);
	});

	// Slider change -> update Text
	slider.onChange = (value: number) =>
	{
		textInput.value = value.toString();
		that.onWidgetChange(element, valueName, value, options as unknown as WidgetChangeOptions);
	};

	that.appendWidget(element, options);

	element.setValue = function (v?: InspectorValue, skipEvent?: boolean)
	{
		if (v === undefined || typeof v !== 'number') { return; }
		value = v;
		slider.setValue(v, skipEvent);
	};
	element.getValue = function ()
	{
		return value;
	};

	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addSlider(name?: string, value?: number, options?: AddSliderOptions): InspectorSliderWidget;
	}
}

Inspector.prototype.addSlider = function (name?: string, value?: number, options?: AddSliderOptions): InspectorSliderWidget
{
	return AddSlider(this, name, value, options);
};

Inspector.widgetConstructors.slider = "addSlider";