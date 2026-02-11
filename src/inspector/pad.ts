import { Inspector } from "./inspector";
import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { DraggerOptions } from "../dragger";
import { Trigger } from "../utilities";

/**
 * Options for creating a Pad widget.
 */
export interface AddPadOptions extends CreateWidgetOptions, DraggerOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Minimum value for both axes (shorthand).
	 */
	min?: number;
	/**
	 * Maximum value for both axes (shorthand).
	 */
	max?: number;
	/**
	 * Minimum X value.
	 */
	minX?: number;
	/**
	 * Minimum Y value.
	 */
	minY?: number;
	/**
	 * Maximum X value.
	 */
	maxX?: number;
	/**
	 * Maximum Y value.
	 */
	maxY?: number;
	/**
	 * URL of the background image for the pad.
	 */
	background?: string;
	/**
	 * Callback function triggered when value changes.
	 */
	callback?: (values: [number, number]) => [number, number];
}

/**
 * Interface representing the Pad widget.
 */
export interface InspectorPadWidget extends InspectorActiveWidget
{
	/**
	 * Sets the values for the pad.
	 * @param {[number, number]} [values] The new X and Y values.
	 */
	setValue: (values?: InspectorValue) => void;
}

/**
 * Widget to edit two numbers using a rectangular pad where you can drag horizontally and vertically a handler.
 * @function AddPad
 * @param {Inspector} that The inspector instance.
 * @param {string} name The name of the widget.
 * @param {[number, number]} [value] Initial values [x, y].
 * @param {AddPadOptions | ((value: [number, number]) => [number, number])} [options] Configuration options or callback function.
 * @returns {InspectorPadWidget} The created pad widget element.
 */
export function AddPad(that: Inspector, name: string,
	value: [number, number] = [0, 0],
	options: AddPadOptions | ((value: [number, number]) => [number, number]) = {}):
	InspectorPadWidget
{
	if (typeof options === "function")
	{
		options = { callback: options };
	}
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name, "", options) as InspectorPadWidget;

	options.step = options.step ?? 0.1;
	options.tabIndex = that.tabIndex;
	options.full = true;
	that.tabIndex++;

	const minX = options.minX ?? options.min ?? 0;
	const minY = options.minY ?? options.min ?? 0;
	const maxX = options.maxX ?? options.max ?? 1;
	const maxY = options.maxY ?? options.max ?? 1;

	const wcontent = element.querySelector(".wcontent") as HTMLElement;

	const pad = document.createElement("div") as HTMLDivElement;
	pad.className = "litepad";
	wcontent.appendChild(pad);
	pad.style.width = "100%";
	pad.style.height = "100px";
	if (options.background)
	{
		pad.style.backgroundImage = `url('${options.background}')`;
		pad.style.backgroundSize = "100%";
		pad.style.backgroundRepeat = "no-repeat";
	}

	const handler = document.createElement("div");
	handler.className = "litepad-handler";
	pad.appendChild(handler);

	options.tabIndex = that.tabIndex;
	that.tabIndex++;

	function mouseDown(e: MouseEvent)
	{
		e.preventDefault();
		e.stopPropagation();

		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);
	}

	function mouseMove(e: MouseEvent)
	{
		const b = pad.getBoundingClientRect();

		const mouse_x = e.pageX - b.left;
		const mouse_y = e.pageY - b.top;
		e.preventDefault();
		e.stopPropagation();

		let x = mouse_x / (b.width);
		let y = mouse_y / (b.height);

		x = x * (maxX - minX) + minX;
		y = y * (maxY - minY) + minX;

		const r = [x, y] as [number, number];

		Trigger(element, "wbeforechange", [r]);
		element.setValue(r);

		if (options && (options as AddPadOptions).callback)
		{
			const new_val = (options as AddPadOptions).callback?.call(element, r);
			if (new_val && new_val.length >= 2)
			{
				element.setValue(new_val);
			}
		}

		Trigger(element, "wchange", [r]);
		if (that.onChange) { that.onChange(valueName, r, element); }
	}

	function mouseUp(e: MouseEvent)
	{
		e.preventDefault();
		e.stopPropagation();

		document.body.removeEventListener("mousemove", mouseMove);
		document.body.removeEventListener("mouseup", mouseUp);
	}

	pad.addEventListener("mousedown", mouseDown);

	element.setValue = function (value?: InspectorValue)
	{
		if (value === undefined || !Array.isArray(value) || value.length < 2) { return; }
		if (typeof value[0] !== 'number' || typeof value[1] !== 'number') { return; }

		const b = pad.getBoundingClientRect();
		let x = (value[0] - minX) / (maxX - minX);
		let y = (value[1] - minY) / (maxY - minY);
		x = Math.max(0, Math.min(x, 1)); // Clamp
		y = Math.max(0, Math.min(y, 1));

		const w = ((b.width - 10) / b.width) * 100;
		const h = ((b.height - 10) / b.height) * 100;
		handler.style.left = `${(x * w).toFixed(1)}%`;
		handler.style.top = `${(y * h).toFixed(1)}%`;
	};

	that.appendWidget(element, options);
	element.setValue(value);
	that.processElement(element, options);

	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addPad(name: string, value?: [number, number], options?: AddPadOptions | ((value: [number, number]) => [number, number])): InspectorPadWidget;
	}
}

Inspector.prototype.addPad = function (name: string, value?: [number, number], options?: AddPadOptions | ((value: [number, number]) => [number, number])): InspectorPadWidget
{
	return AddPad(this, name, value, options);
};

Inspector.widgetConstructors.pad = "addPad";
