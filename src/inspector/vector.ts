import { Inspector } from "./inspector";
import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { Dragger, DraggerOptions } from "../dragger";
import { Trigger } from "../utilities";

/**
 * Options for creating a Vector widget.
 */
export interface AddVectorOptions extends CreateWidgetOptions, DraggerOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Internal flag to indicate full vector width usage.
	 */
	fullVector?: boolean;
	/**
	 * Callback function triggered when value changes.
	 */
	callback?: (value: number[]) => void;
	/**
	 * Callback function triggered on change (alternative).
	 */
	onChange?: (value: number[]) => number[] | void;
	/**
	 * Callback function triggered before change (start dragging).
	 */
	preCallback?: (e: Event) => void;
}

/**
 * Interface representing a numeric Vector widget.
 */
export interface InspectorNumberVectorWidget extends InspectorActiveWidget
{
	/**
	 * Array of draggers used to edit each component of the vector.
	 */
	draggers: Dragger[];
	/**
	 * Sets the range for all draggers.
	 * @param {number} min Minimum value.
	 * @param {number} max Maximum value.
	 */
	setRange: (min: number, max: number) => void;
	/**
	 * Sets the value of the vector.
	 * @param {InspectorValue} [value] The new vector values.
	 * @param {boolean} [skipEvent] If true, prevents triggering change events.
	 */
	setValue: (value?: InspectorValue, skipEvent?: boolean) => void;
}

interface VectorInput extends HTMLInputElement
{
	dragger: Dragger;
}

/**
 * Widget to edit an array of numbers from 2 to 4 (it adds a dragging mini widget in the right side).
 * @function AddVector
 * @param {Inspector} that The inspector instance.
 * @param {string | undefined} name The name/label of the widget.
 * @param {number[]} value The initial vector values.
 * @param {AddVectorOptions} [options] Configuration options.
 * @returns {InspectorNumberVectorWidget} The created vector widget element.
 */
export function AddVector(that: Inspector, name: string | undefined,
	value: number[], options: AddVectorOptions = {}): InspectorNumberVectorWidget
{
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name, "", options) as InspectorNumberVectorWidget;
	const initLength = value.length;
	options.step = options.step ?? 0.1;
	options.tabIndex = that.tabIndex;
	options.fullVector = true;
	if (!options.step) { options.step = 0.1; }
	that.tabIndex++;

	const draggers: Dragger[] = element.draggers = [];

	const _preChange = function (e: Event)
	{
		if (options!.preCallback) { options!.preCallback(e); }
	};

	for (let i = 0; i < value.length; i++)
	{
		const dragger: Dragger = new Dragger(value[i], options);
		dragger.root.style.marginLeft = '0';
		dragger.root.style.width = "calc( 25% - 1px )";
		element.querySelector(".wcontent")!.appendChild(dragger.root);
		options.tabIndex = that.tabIndex;
		that.tabIndex++;
		dragger.root.addEventListener("start_dragging", _preChange);
		draggers.push(dragger);
	}

	const inputs = element.querySelectorAll("input") as NodeListOf<VectorInput>;
	const onChangeCallback = (e: Event) =>
	{
		// Gather all three parameters
		let r = [];
		for (let j = 0; j < inputs.length; j++)
		{
			r.push(parseFloat(inputs[j].value));
		}

		Trigger(element, "wbeforechange", [r]);

		that.values.set(valueName, r);

		const dragger = (e.target as VectorInput).dragger;
		if (options.onChange && dragger.dragging)
		{
			const new_val = options.onChange.call(element, r);

			if (Array.isArray(new_val) && new_val.length >= initLength)
			{
				for (let j = 0; j < inputs.length; j++)
				{
					inputs[j].value = new_val[j].toString();
				}
				r = new_val;
			}
		}
		else if ((options.onChange || options.callback) && !dragger.dragging)
		{
			let new_val = undefined;
			if (options.callback)
			{
				new_val = options.callback.call(element, r);
			}
			else if (options.onChange)
			{
				new_val = options.onChange.call(element, r);
			}

			if (Array.isArray(new_val) && new_val.length >= initLength)
			{
				for (let j = 0; j < inputs.length; j++)
				{
					inputs[j].value = new_val[j].toString();
				}
				r = new_val;
			}
		}

		Trigger(element, "wchange", [r]);
		if (that.onChange) { that.onChange(valueName, r, element); }
	};
	const onStopDragging = function (input: VectorInput)
	{
		Trigger(input, "change");
	};
	for (let i = 0; i < inputs.length; ++i)
	{
		const dragger = draggers[i];
		const input = inputs[i];
		input.dragger = dragger;
		input.addEventListener("change", onChangeCallback);
		dragger.root.addEventListener("stop_dragging", onStopDragging.bind(undefined, input));
	}

	that.appendWidget(element, options);

	element.setValue = function (value?: InspectorValue, skipEvent?: boolean)
	{
		if (value === undefined || !Array.isArray(value)) { return; }
		const valArray = value as (number | string)[];
		for (let i = 0; i < draggers.length; i++)
		{
			draggers[i].setValue(valArray[i], skipEvent ?? i < draggers.length - 1);
		}
	};
	element.setRange = function (min: number, max: number) { for (const i in draggers) { draggers[i].setRange(min, max); } };

	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addVector(name: string, value: number[], options?: AddVectorOptions): InspectorNumberVectorWidget;
		addVector2(name: string, value: [number, number], options?: AddVectorOptions): InspectorNumberVectorWidget;
		addVector3(name: string, value: [number, number, number], options?: AddVectorOptions): InspectorNumberVectorWidget;
		addVector4(name: string, value: [number, number, number, number], options?: AddVectorOptions): InspectorNumberVectorWidget;
	}
}

Inspector.prototype.addVector = function (name: string, value: number[], options?: AddVectorOptions): InspectorNumberVectorWidget
{
	return AddVector(this, name, value, options);
};

Inspector.prototype.addVector2 = function (name: string, value: [number, number], options?: AddVectorOptions): InspectorNumberVectorWidget
{
	value = value ?? [0, 0];
	options = options ?? {};
	return AddVector(this, name, value, options);
};

Inspector.prototype.addVector3 = function (name: string, value: [number, number, number], options?: AddVectorOptions): InspectorNumberVectorWidget
{
	value = value ?? [0, 0, 0];
	options = options ?? {};
	return AddVector(this, name, value, options);
};

Inspector.prototype.addVector4 = function (name: string, value: [number, number, number, number], options?: AddVectorOptions): InspectorNumberVectorWidget
{
	value = value ?? [0, 0, 0, 0];
	options = options ?? {};
	return AddVector(this, name, value, options);
};

Inspector.widgetConstructors.vector = "addVector";
Inspector.widgetConstructors.vec2 = "addVector2";
Inspector.widgetConstructors.vector2 = "addVector2";
Inspector.widgetConstructors.vec3 = "addVector3";
Inspector.widgetConstructors.vector3 = "addVector3";
Inspector.widgetConstructors.vec4 = "addVector4";
Inspector.widgetConstructors.vector4 = "addVector4";
