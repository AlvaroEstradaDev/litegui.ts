import { LiteGUIObject } from "./@types/globals";
import { Trigger } from "./utilities";

/**
 * Configuration options for the Dragger widget.
 */
export interface DraggerOptions
{
	/**
	 * Number of decimal places to display.
	 */
	precision?: number;

	/**
	 * Additional CSS class to apply to the dragger element.
	 */
	extraClass?: string;

	/**
	 * Whether the dragger should take full width.
	 */
	full?: boolean;

	/**
	 * Whether the dragger is disabled.
	 */
	disabled?: boolean;

	/**
	 * Specific class for the dragger element.
	 */
	draggerClass?: string;

	/**
	 * Tab index for the input element.
	 */
	tabIndex?: number;

	/**
	 * Unit suffix to display (e.g., "px", "%").
	 */
	units?: string;

	/**
	 * Whether dragging should be horizontal.
	 */
	horizontal?: boolean;

	/**
	 * Whether the dragging response should be linear.
	 */
	linear?: boolean;

	/**
	 * Step size for incrementing/decrementing value.
	 */
	step?: number;

	/**
	 * Minimum allowed value.
	 */
	min?: number;

	/**
	 * Maximum allowed value.
	 */
	max?: number;
}

/**
 * Interface extending HTMLDivElement to include a reference to the Dragger instance parts.
 */
export interface DraggerRootDivElement extends HTMLDivElement
{
	/**
	 * Reference to the input element associated with this root.
	 */
	input?: HTMLInputElement;

	/**
	 * Reference to the draggable div element associated with this root.
	 */
	dragger?: DraggerDivElement;
}

/**
 * Interface extending HTMLDivElement for the draggable area.
 */
export interface DraggerDivElement extends HTMLDivElement
{
	/**
	 * Storage for drag data (e.g., coordinates).
	 */
	data?: number[];
}

/** *** DRAGGER **********/

/**
 * Widget that provides a draggable number input.
 * @class Dragger
 * @example
 * ```typescript
 * const dragger = new Dragger(10, { min: 0, max: 100, step: 0.1 });
 * parentElement.appendChild(dragger.root);
 * ```
 */
export class Dragger implements LiteGUIObject
{
	/**
	 * Current value of the dragger.
	 */
	value: number;

	/**
	 * Root HTML element of the widget.
	 */
	root: DraggerRootDivElement;

	/**
	 * Configuration options.
	 */
	options: DraggerOptions;

	/**
	 * Input element displaying the value.
	 */
	input: HTMLInputElement;

	/**
	 * Whether the user is currently dragging.
	 */
	dragging: boolean = false;

	/**
	 * Creates an instance of the Dragger widget.
	 * @param {number} value Initial value.
	 * @param {DraggerOptions} [options] Configuration options.
	 */
	constructor(value: number, options?: DraggerOptions)
	{
		value = value ?? 0;
		if (typeof value === "string")
		{
			value = parseFloat(value);
		}
		else if (typeof value !== "number")
		{
			value = 0;
		}

		this.value = value;
		this.options = options = options ?? {};
		const precision = options.precision ?? 3; // Num decimals

		const element = document.createElement("div") as DraggerRootDivElement;
		element.className = `dragger ${options.extraClass}`;
		this.root = element;

		const wrap = document.createElement("span");
		wrap.className = `inputfield ${options.extraClass} ${options.full ? "full" : ""}`;
		if (options.disabled) { wrap.className += " disabled"; }
		element.appendChild(wrap);

		const draggerClass = options.draggerClass || "full";

		const input = document.createElement("input");
		input.className = `text number ${draggerClass}`;
		input.value = value.toFixed(precision) + (options.units ? options.units : "");
		input.tabIndex = options.tabIndex ?? 0;
		this.input = input;
		element.input = input;

		if (options.disabled) { input.disabled = true; }
		if (options.tabIndex) { input.tabIndex = options.tabIndex; }
		wrap.appendChild(input);

		input.addEventListener("keydown", (e: KeyboardEvent) =>
		{
			const keyCode = e.key;
			// Arrow key handling
			switch (keyCode)
			{
			case "ArrowUp":
				_onEvent(1, e);
				break;
			case "ArrowDown":
				_onEvent(-1, e);
				break;
			default:
				return false;
			}
			e.stopPropagation();
			e.preventDefault();
			return true;
		});

		const dragger = document.createElement("div") as DraggerDivElement;
		dragger.className = "drag_widget";
		if (options.disabled) { dragger.className += " disabled"; }

		wrap.appendChild(dragger);
		element.dragger = dragger;

		const _onMouseDown = (e: MouseEvent) =>
		{
			docBound = input.ownerDocument;

			docBound.removeEventListener("mousemove", _onMouseMove);
			docBound.removeEventListener("mouseup", _onMouseUp);

			if (!options!.disabled)
			{
				if (element.requestPointerLock) { element.requestPointerLock(); }
				docBound.addEventListener("mousemove", _onMouseMove);
				docBound.addEventListener("mouseup", _onMouseUp);

				dragger.data = [e.screenX, e.screenY];

				this.dragging = true;
				Trigger(element, "start_dragging");
			}

			e.stopPropagation();
			e.preventDefault();
		};

		dragger.addEventListener("mousedown", _onMouseDown);

		const _onMouseWheel = function (e: WheelEvent)
		{
			if (document.activeElement !== input) { return; }
			const delta = (e.deltaY ? -e.deltaY / 3 : 0);
			_onEvent(delta > 0 ? 1 : -1, e);
			e.stopPropagation();
			e.preventDefault();
		};
		input.addEventListener("wheel", _onMouseWheel.bind(input), false);

		let docBound: Document | null = null;

		function _onMouseMove(e: MouseEvent)
		{
			const deltaX = e.screenX - (dragger.data ? dragger.data[0] : 0);
			const deltaY = (dragger.data ? dragger.data[1] : 0) - e.screenY;
			let diff = [deltaX, deltaY];
			if (e.movementX !== undefined) { diff = [e.movementX, -e.movementY]; }
			dragger.data = [e.screenX, e.screenY];
			const axis = options!.horizontal ? 0 : 1;
			_onEvent(diff[axis], e);

			e.stopPropagation();
			e.preventDefault();
			return false;
		}

		const _onMouseUp = (e: MouseEvent) =>
		{
			this.dragging = false;
			Trigger(element, "stop_dragging");
			const doc = docBound || document;
			docBound = null;
			doc.removeEventListener("mousemove", _onMouseMove);
			doc.removeEventListener("mouseup", _onMouseUp);
			if (doc.exitPointerLock) { doc.exitPointerLock(); }
			Trigger(dragger, "blur");
			e.stopPropagation();
			e.preventDefault();
			return false;
		};

		function _onEvent(v: number, e: KeyboardEvent | MouseEvent | WheelEvent)
		{
			let value = v;
			if (!options!.linear)
			{
				value = value > 0 ? Math.pow(value, 1.2) : Math.pow(Math.abs(value), 1.2) * -1;
			}
			let scale = (options!.step ? options!.step : 1.0);
			if (e && e.shiftKey)
			{
				scale *= 10;
			}
			else if (e && e.ctrlKey)
			{
				scale *= 0.1;
			}
			let result = parseFloat(input.value) + value * scale;
			if (typeof options!.max == "number" && result > options!.max)
			{
				result = options!.max;
			}
			if (typeof options!.min == "number" && result < options!.min)
			{
				result = options!.min;
			}

			input.value = result.toFixed(precision);
			if (options!.units) { input.value += options!.units; }
			Trigger(input, "change");
		}
	}

	/**
	 * Sets the range of allowed values.
	 * @param {number} min Minimum value.
	 * @param {number} max Maximum value.
	 */
	setRange(min: number, max: number)
	{
		this.options.min = min;
		this.options.max = max;
	}

	/**
	 * Sets the value of the dragger.
	 * @param {string | number} value New value.
	 * @param {boolean} skipEvent Whether to skip triggering the 'change' event.
	 */
	setValue(value: string | number, skipEvent: boolean)
	{
		this.value = typeof value == "string" ? parseFloat(value) : value;
		let stringValue: string;
		if (this.options.precision)
		{
			stringValue = this.value.toFixed(this.options.precision);
		}
		else
		{
			stringValue = this.value.toString();
		}

		if (this.options.units) { stringValue += this.options.units; }
		this.input.value = stringValue;
		if (!skipEvent) { Trigger(this.input, "change"); }
	}

	/**
	 * Gets the current value of the dragger.
	 * @returns {number} The current value.
	 */
	getValue(): number
	{
		return this.value;
	}
}