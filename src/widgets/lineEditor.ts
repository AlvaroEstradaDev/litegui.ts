import { AppendOptions } from "../@types/Inspector";
import { LiteGUIObject } from "../@types/globals";
import { Trigger } from "../utilities";

/**
 * Options for the LineEditor widget.
 */
export interface LineEditorOptions extends AppendOptions
{
	/** Callback function when value changes */
	callback?: (value: number[][], e?: Event) => void;
	/** Height of the editor */
	height?: number;
	/** Width of the editor */
	width?: number;
	/** Number of samples to show */
	showSamples?: number;
	/** Prevent crossing lines (monotonic function) */
	noTrespassing?: boolean;
	/** Default Y value */
	defaultY?: number;
	/** X axis range [min, max] */
	xRange?: number[];
	/** Y axis range [min, max] */
	yRange?: number[];
	/** Color of the line */
	lineColor?: string;
	/** Color of the points */
	pointsColor?: string;
	/** Background color */
	bgColor?: string;
	/** Extra CSS class */
	extraClass?: string;
}

/**
 * Element interface containing LineEditor properties.
 */
export interface LineEditorElement extends HTMLDivElement
{
	canvas: HTMLCanvasElement;
	valuesArray: number[][];
	callback?: (values: number[][]) => void;
	height?: number;
	width?: number;
	showSamples?: number;
	noTrespassing?: boolean;
	defaultY: number;
	xRange: number[];
	yRange: number[];
	lineColor: string;
	pointsColor?: string;
	bgColor?: string;
	extraClass?: string;
	options?: LineEditorOptions;
}

/**
 * Line editor widget for editing curves.
 * @class LineEditor
 */
export class LineEditor implements LiteGUIObject
{
	root: LineEditorElement;
	options: LineEditorOptions;
	canvas: HTMLCanvasElement;
	selected: number;
	lastMousePos: number[];

	mouseMoveBind = this.onMouseMove.bind(this);
	mouseUpBind = this.onMouseUp.bind(this);

	/**
	 * Creates an instance of the LineEditor widget.
	 * @param {number[][]} value - Array of points [x, y].
	 * @param {LineEditorOptions} [options] - Configuration options.
	 */
	constructor(value: number[][], options: LineEditorOptions = {})
	{
		this.options = options;
		const element = this.root = <LineEditorElement>document.createElement("div");
		element.className = "curve " + (this.options.extraClass ?? "");
		element.style.minHeight = "50px";
		element.style.width = this.options.width?.toString() ?? "100%";

		element.bgColor = this.options.bgColor ?? "#222";
		element.pointsColor = this.options.pointsColor ?? "#5AF";
		element.lineColor = this.options.lineColor ?? "#444";

		element.valuesArray = value ?? [];
		element.xRange = this.options.xRange ?? [0, 1]; // Min,max
		element.yRange = this.options.yRange ?? [0, 1]; // Min,max
		element.defaultY = this.options.defaultY ?? 0.5;
		element.noTrespassing = this.options.noTrespassing ?? false;
		element.showSamples = this.options.showSamples ?? 0;
		element.options = options;
		element.style.minWidth = "50px";
		element.style.minHeight = "20px";

		const canvas = this.canvas = document.createElement("canvas");
		canvas.width = this.options.width ?? 200;
		canvas.height = this.options.height ?? 50;
		element.appendChild(canvas);
		element.canvas = canvas;

		element.addEventListener("mousedown", this.onMouseDown.bind(this));

		this.selected = -1;

		this.lastMousePos = [0, 0];

		this.redraw();
	}

	/**
	 * Gets value at given x coordinate (interpolates).
	 * @param {number} x - X coordinate.
	 * @returns {number} The interpolated Y value.
	 */
	getValueAt(x: number)
	{
		if (x < this.root.xRange[0] || x > this.root.xRange[1])
		{
			return this.root.defaultY;
		}

		let last = <number[]>[this.root.xRange[0], this.root.defaultY];
		let f = 0, v: number[];
		for (let i = 0; i < this.root.valuesArray.length; i++)
		{
			v = this.root.valuesArray[i];
			if (x == v[0]) { return v[1]; }
			if (x < v[0])
			{
				f = (x - last[0]) / (v[0] - last[0]);
				return last[1] * (1 - f) + v[1] * f;
			}
			last = v;
		}

		v = [this.root.xRange[1], this.root.defaultY];
		f = (x - last[0]) / (v[0] - last[0]);
		return last[1] * (1 - f) + v[1] * f;
	}

	/**
	 * Resamples line editor to fixed number of samples.
	 * @param {number} samples - Number of samples.
	 * @returns {number[]} Array of sampled values.
	 */
	resample(samples: number)
	{
		const r: number[] = [];
		const dx = (this.root.xRange[1] - this.root.xRange[0]) / samples;
		for (let i = this.root.xRange[0]; i <= this.root.xRange[1]; i += dx)
		{
			const v = this.getValueAt(i);
			if (v) { r.push(v); }
		}
		return r;
	}

	/**
	 * Adds a point to the line.
	 * @param {number[]} v - Point [x, y].
	 */
	addValue(v: number[])
	{
		for (let i = 0; i < this.root.valuesArray.length; i++)
		{
			const value = this.root.valuesArray[i];
			if (value[0] < v[0]) { continue; }
			this.root.valuesArray.splice(i, 0, v);
			this.redraw();
			return;
		}

		this.root.valuesArray.push(v);
		this.redraw();
	}

	/**
	 * Converts value to canvas coordinates.
	 * @param {number[]} v - Point in value space [x, y].
	 * @returns {number[]} Point in canvas space [x, y].
	 */
	convert(v: number[])
	{
		return [this.canvas.width * ((this.root.xRange[1] - this.root.xRange[0]) * v[0] + this.root.xRange[0]),
			this.canvas.height * ((this.root.yRange[1] - this.root.yRange[0]) * v[1] + this.root.yRange[0])];
	}

	/**
	 * Deconverts canvas coordinates to value space.
	 * @param {number[]} v - Point in canvas space [x, y].
	 * @returns {number[]} Point in value space [x, y].
	 */
	deconvert(v: number[])
	{
		return [(v[0] / this.canvas.width - this.root.xRange[0]) / (this.root.xRange[1] - this.root.xRange[0]),
			(v[1] / this.canvas.height - this.root.yRange[0]) / (this.root.yRange[1] - this.root.yRange[0])];
	}

	/**
	 * Redraws the canvas.
	 */
	redraw()
	{
		if (!this.canvas || !this.canvas.parentNode) { return; }
		const rect = this.canvas.getBoundingClientRect();
		if (rect && this.canvas.width != rect.width && rect.width && rect.width < 1000) { this.canvas.width = rect.width; }
		if (rect && this.canvas.height != rect.height && rect.height && rect.height < 1000) { this.canvas.height = rect.height; }

		const ctx = this.canvas.getContext("2d");
		if (!ctx) { return; }
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.translate(0, this.canvas.height);
		ctx.scale(1, -1);

		ctx.fillStyle = this.root.bgColor as string;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.strokeStyle = this.root.lineColor as string;
		ctx.beginPath();

		// Draw line
		let pos = this.convert([this.root.xRange[0], this.root.defaultY]);
		ctx.moveTo(pos[0], pos[1]);

		for (const i in this.root.valuesArray)
		{
			const value: number[] = this.root.valuesArray[parseInt(i)];
			pos = this.convert(value);
			ctx.lineTo(pos[0], pos[1]);
		}

		pos = this.convert([this.root.xRange[1], this.root.defaultY]);
		ctx.lineTo(pos[0], pos[1]);
		ctx.stroke();

		// Draw points
		for (let i = 0; i < this.root.valuesArray.length; i += 1)
		{
			const value = this.root.valuesArray[i];
			pos = this.convert(value);
			if (this.selected == i) { ctx.fillStyle = "white"; }
			else { ctx.fillStyle = this.root.pointsColor as string; }
			ctx.beginPath();
			ctx.arc(pos[0], pos[1], this.selected == i ? 4 : 2, 0, Math.PI * 2);
			ctx.fill();
		}

		if (this.root.showSamples)
		{
			const samples = this.resample(this.root.showSamples);
			ctx.fillStyle = "#888";
			for (let i = 0; i < samples.length; i += 1)
			{
				const value = [i * ((this.root.xRange[1] - this.root.xRange[0]) / this.root.showSamples) + this.root.xRange[0], samples[i]] as number[];
				pos = this.convert(value);
				ctx.beginPath();
				ctx.arc(pos[0], pos[1], 2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	onMouseDown(evt: MouseEvent)
	{
		document.addEventListener("mousemove", this.mouseMoveBind);
		document.addEventListener("mouseup", this.mouseUpBind);

		const rect = this.canvas.getBoundingClientRect();
		const mouseX = evt.clientX - rect.left;
		const mouseY = evt.clientY - rect.top;

		this.selected = this.computeSelected(mouseX, this.canvas.height - mouseY);

		if (this.selected == -1)
		{
			const v = this.deconvert([mouseX, this.canvas.height - mouseY]);
			this.root.valuesArray.push(v);
			this.sortValues();
			this.selected = this.root.valuesArray.indexOf(v);
		}

		this.lastMousePos = [mouseX, mouseY];
		this.redraw();
		evt.preventDefault();
		evt.stopPropagation();
	}

	onMouseMove(evt: MouseEvent)
	{
		const rect = this.canvas.getBoundingClientRect();
		let mouseX = evt.clientX - rect.left;
		let mouseY = evt.clientY - rect.top;

		if (mouseX < 0)
		{
			mouseX = 0;
		}
		else if (mouseX > this.canvas.width)
		{
			mouseX = this.canvas.width;
		}

		if (mouseY < 0)
		{
			mouseY = 0;
		}
		else if (mouseY > this.canvas.height)
		{
			mouseY = this.canvas.height;
		}

		// Dragging to remove
		if (this.selected != -1 && this.distance([evt.clientX - rect.left, evt.clientY - rect.top], [mouseX, mouseY]) > this.canvas.height * 0.5)
		{
			this.root.valuesArray.splice(this.selected, 1);
			this.onMouseUp(evt);
			return;
		}

		const dx = this.lastMousePos[0] - mouseX;
		const dy = this.lastMousePos[1] - mouseY;
		const delta = this.deconvert([-dx, dy]);
		if (this.selected != -1)
		{
			let minX = this.root.xRange[0];
			let maxX = this.root.xRange[1];

			if (this.root.noTrespassing)
			{
				if (this.selected > 0)
				{
					minX = this.root.valuesArray[this.selected - 1][0];
				}
				if (this.selected < (this.root.valuesArray.length - 1))
				{
					maxX = this.root.valuesArray[this.selected + 1][0];
				}
			}

			const v = this.root.valuesArray[this.selected];
			v[0] += delta[0];
			v[1] += delta[1];
			if (v[0] < minX)
			{
				v[0] = minX;
			}
			else if (v[0] > maxX)
			{
				v[0] = maxX;
			}

			if (v[1] < this.root.yRange[0])
			{
				v[1] = this.root.yRange[0];
			}
			else if (v[1] > this.root.yRange[1])
			{
				v[1] = this.root.yRange[1];
			}
		}

		this.sortValues();
		this.redraw();
		this.lastMousePos[0] = mouseX;
		this.lastMousePos[1] = mouseY;
		this.onChange();

		evt.preventDefault();
		evt.stopPropagation();
	}

	onMouseUp(evt: MouseEvent)
	{
		this.selected = -1;
		this.redraw();
		document.removeEventListener("mousemove", this.mouseMoveBind);
		document.removeEventListener("mouseup", this.mouseUpBind);
		this.onChange();
		evt.preventDefault();
		evt.stopPropagation();
	}

	onResize()
	{
		this.redraw();
	}

	onChange()
	{
		if (this.options.callback) { this.options.callback.call(this.root, this.root.valuesArray); }
		else { Trigger(this.root, "change"); }
	}

	distance(a: [number, number], b: [number, number])
	{
		return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
	}

	computeSelected(x: number, y: number)
	{
		let minDist = 100000;
		const maxDist = 8; // Pixels
		let selected = -1;
		for (let i = 0; i < this.root.valuesArray.length; i++)
		{
			const value = this.root.valuesArray[i];
			const pos = this.convert(value) as [number, number];
			if (pos.length >= 2)
			{
				const dist = this.distance([x, y], pos);
				if (dist < minDist && dist < maxDist)
				{
					minDist = dist;
					selected = i;
				}
			}
		}
		return selected;
	}

	sortValues()
	{
		let v: number[] | undefined = undefined;
		if (this.selected != -1)
		{
			v = this.root.valuesArray[this.selected];
		}
		this.root.valuesArray.sort((a: number[], b: number[]) =>
		{ return a[0] - b[0]; });

		if (v) { this.selected = this.root.valuesArray.indexOf(v); }
	}
}
