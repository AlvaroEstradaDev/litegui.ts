import { Trigger } from "../utilities";
import { LiteGUIObject } from "../@types/globals";

/**
 * Configuration options for the Slider widget.
 */
export interface SliderOptions
{
	/** Minimum value */
	min?: number;
	/** Maximum value */
	max?: number;
}

/**
 * Slider widget.
 * @class Slider
 */
export class Slider implements LiteGUIObject
{
	/** Root element of the widget */
	root: HTMLDivElement;
	/** Current value */
	value: number;
	/** Configuration options */
	options: SliderOptions;
	/** Document reference for drag events */
	docBinded?: Document;
	/** Callback executing when value changes */
	onChange?: (value: number) => void;
	mouseMoveBind = this.onMouseMove.bind(this);
	mouseUpBind = this.onMouseUp.bind(this);

	/**
	 * Creates an instance of the Slider widget.
	 * @param {number} value - Initial value.
	 * @param {SliderOptions} [options] - Configuration options.
	 */
	constructor(value: number, options?: SliderOptions)
	{
		this.options = options ?? {};

		const root = this.root = document.createElement("div") as HTMLDivElement;
		this.value = value;
		root.className = "liteslider";
		this.docBinded = root.ownerDocument;
		this.root.addEventListener("mousedown", this.onMouseDown.bind(this));
		this.setValue(value);
	}

	/**
	 * Sets the value from an X coordinate (relative to client).
	 * @param {number} x - X coordinate.
	 */
	setFromX(x: number)
	{
		const rect = this.root.getBoundingClientRect();
		if (!rect) { return; }
		const width = rect.width;
		const norm = x / width;
		const min = this.options.min ?? 0.0;
		const max = this.options.max ?? 1.0;
		const range = max - min;
		this.setValue(range * norm + min);
	}

	/**
	 * Handles mouse down event.
	 * @param {MouseEvent} e - The mouse event.
	 */
	onMouseDown(e: MouseEvent)
	{
		let mouseX: number;
		if (e.offsetX)
		{
			mouseX = e.offsetX;
		}
		else if (e.layerX)
		{
			mouseX = e.layerX;
		}

		this.setFromX(mouseX!);

		if (!this.docBinded) { return; }

		this.root.addEventListener("mousemove", this.mouseMoveBind, false);
		this.root.addEventListener("mouseup", this.mouseUpBind, false);
		e.preventDefault();
		e.stopPropagation();
	}

	/**
	 * Handles mouse move event (dragging).
	 * @param {MouseEvent} e - The mouse event.
	 */
	onMouseMove(e: MouseEvent)
	{
		const rect = this.root.getBoundingClientRect();
		if (!rect) { return; }
		const x = e.x === undefined ? e.pageX : e.x;
		const mouseX = x - rect.left;
		this.setFromX(mouseX);
		if (typeof e.preventDefault == 'function')
		{e.preventDefault();}
		return false;
	}

	/**
	 * Handles mouse up event (drop).
	 * @param {MouseEvent} e - The mouse event.
	 */
	onMouseUp(e: MouseEvent)
	{
		if (!this.docBinded) { return false; }
		this.root.removeEventListener("mousemove", this.mouseMoveBind, false);
		this.root.removeEventListener("mouseup", this.mouseUpBind, false);
		if (typeof e.preventDefault == 'function')
		{e.preventDefault();}
		return false;
	}

	/**
	 * Sets the value of the slider.
	 * @param {number} value - New value.
	 * @param {boolean} [skipEvent=false] - Whether to skip triggering events.
	 */
	setValue(value: number, skipEvent: boolean = false)
	{
		// Var width = canvas.getClientRects()[0].width;
		const min = this.options.min || 0.0;
		const max = this.options.max || 1.0;
		if (value < min) { value = min; }
		else if (value > max) { value = max; }
		const range = max - min;
		const norm = (value - min) / range;
		const percentage = (norm * 100).toFixed(1) + "%";

		const percentage2 = "calc(" + percentage + " + 2px)";
		this.root.style.background = "linear-gradient(to right, #999 " + percentage + ", #FC0 " + percentage + ", #FC0 " + percentage2 + ", #333 " + percentage2 + ")";

		if (value != this.value)
		{
			this.value = value;
			if (!skipEvent)
			{
				Trigger(this.root, "change", value);
				if (this.onChange) { this.onChange(value); }
			}
		}
	}
}
