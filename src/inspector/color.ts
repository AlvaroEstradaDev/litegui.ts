import { RGBAToHEXA, Trigger } from "../utilities";
import { CreateWidgetOptions, InspectorValue, InspectorWidget } from "../@types/Inspector";
import { Inspector } from "./inspector";
import Pickr from "@simonwep/pickr";

/**
 * Configuration options for the Color widget.
 */
export interface AddColorOptions extends CreateWidgetOptions
{
	/**
	 * Whether to show the numeric RGB representation alongside the color picker.
	 */
	showRGB?: boolean;

	/**
	 * Callback function triggered when the color changes.
	 */
	callback?: (value: number[], hex: string) => void;

	/**
	 * Alias for callback.
	 */
	onChange?: (value: number[], hex: string) => void;

	/**
	 * Whether to enable opacity (alpha) control in the color picker.
	 */
	opacityControl?: boolean;

	/**
	 * Whether the color picker is disabled.
	 */
	disabled?: boolean;
}

/**
 * Adds a color input widget to the Inspector.
 * @function AddColor
 * @param {Inspector} that - The Inspector instance.
 * @param {string} name - The name of the color input.
 * @param {number[]} [value=[0, 0, 0, 255]] - The initial RGBA value of the color input.
 * @param {AddColorOptions} [options] - Additional options for the color input.
 * @returns {InspectorWidget} The created color input widget.
 */
export function AddColor(that: Inspector, name: string,
	value: [number, number, number, number] | [number, number, number] = [0, 0, 0, 255],
	options: AddColorOptions = {})
{
	// Normalize value to RGBA
	if (value.length === 3)
	{
		value = value.concat(255) as [number, number, number, number];
	}
	that.values.set(name, value);
	const processedOptions = that.processOptions(options) as AddColorOptions;

	// Create the widget HTML structure
	let code = `<div class='input_container' style='display: inline-block; width: calc(100% - 4px);'><input tabIndex='${that.tabIndex}' id='colorpicker-${name}' class='color' value='${value[0]},${value[1]},${value[2]},${value[3]}' ${processedOptions.disabled ? "disabled" : ""}/></div>`;
	that.tabIndex++;

	if (processedOptions.showRGB)
	{
		code += `<span class='rgb-color'>${Inspector.parseColor(value.concat() as [number, number, number, number])}</span>`;
	}
	const element = that.createWidget(name, code, processedOptions) as InspectorWidget;
	that.appendWidget(element, processedOptions); // Add now or won't work

	const input_element = element.querySelector("input.color") as HTMLInputElement;

	// Pickr setup and initialization
	const pickr = new Pickr({
		el: input_element,
		theme: 'nano', // Or 'classic', or 'monolith', or 'nano'
		default: RGBAToHEXA(value),
		components: {
			// Main components
			preview: true,
			opacity: processedOptions.opacityControl ?? false,
			hue: true,

			// Input / output Options
			interaction: {
				hex: true,
				rgba: true,
				hsla: false,
				hsva: false,
				cmyk: false,
				input: true,
				clear: false,
				cancel: true,
				save: true
			}
		},
		position: 'bottom-start',
		disabled: processedOptions.disabled
	});

	// Helper to update widget state from Pickr events
	const _updateFromPickr = (color: Pickr.HSVaColor) =>
	{
		// Color is a Pickr color object
		if (!color) {return;}

		const rgba = color.toRGBA(); // Returns [r, g, b, a]
		rgba[3] = rgba[3] * 255;
		const hex = color.toHEXA().toString();

		const rgbelement = element.querySelector(".rgb-color");
		if (rgbelement)
		{
			rgbelement.innerHTML = Inspector.parseColor(
				rgba.concat() as [number, number, number, number]);
		}

		that.values.set(name, rgba.concat());

		// Trigger callbacks and events
		const event_data = [rgba.concat(), hex];

		Trigger(element, "wbeforechange", event_data);

		if (processedOptions.callback)
		{
			processedOptions.callback.call(element, rgba.concat(), hex);
		}
		else if (processedOptions.onChange)
		{
			processedOptions.onChange.call(element, rgba.concat(), hex);
		}

		Trigger(element, "wchange", event_data);
		if (that.onChange) { that.onChange(name, rgba.concat(), element); }
	};

	// Save event listener
	pickr.on('save', (color: Pickr.HSVaColor) =>
	{
		_updateFromPickr(color);
		pickr.hide();
	});

	// Change event listener (handling dragging)
	pickr.on('change', (color: Pickr.HSVaColor) =>
	{
		// Use this for "dragging" / immediate updates
		_updateFromPickr(color);
	});

	// Handle external value updates
	element.setValue = function (v: InspectorValue, skipEvent?: boolean)
	{
		if (v === undefined || !Array.isArray(v) || v.length < 3) { return; }
		const val = v as number[];
		const cssVal = `rgba(${val[0]},${val[1]},${val[2]},${(val.length > 3 ? val[3] : 255)})`;
		pickr.setColor(cssVal);

		if (!skipEvent)
		{
			const color = pickr.getColor();
			_updateFromPickr(color);
		}
	};

	element.getValue = function ()
	{
		return that.values.get(name);
	};

	that.processElement(element, processedOptions);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addColor(name: string, value?: [number, number, number, number] | [number, number, number], options?: AddColorOptions): InspectorWidget;
	}
}

Inspector.prototype.addColor = function (name: string, value?: [number, number, number, number] | [number, number, number], options?: AddColorOptions): InspectorWidget
{
	return AddColor(this, name, value, options);
};

Inspector.widgetConstructors.color = "addColor";