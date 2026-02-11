import {
	AddContainerOptions,
	CreateWidgetOptions,
	InspectorWidgetTypes,
	WidgetChangeOptions,
	InspectorContainer,
	GenericCreationOptions,
	PropertyOptions,
	InspectorWidget,
	InspectorValue
} from "../@types/Inspector";
import { Inspector } from "./inspector";
import { SizeToCSS } from "../utilities";

/**
 * Type representing the values that can be edited in the array inspector.
 * It can be a string, number, or a record object.
 */
export type InspectorArrayEditableValue = string | number | boolean |
	Record<string, string | number | boolean> | number[] | string[] | boolean[];

/**
 * Interface for the container element of the array widget.
 * Extends the standard InspectorContainer to include value management methods.
 */
export interface ArrayWidgetContainer extends InspectorContainer, InspectorWidget
{
	/**
	 * The current array of values being edited.
	 */
	value: InspectorArrayEditableValue[];
	/**
	 * Method to set multiple values at once.
	 * @param {InspectorArrayEditableValue[]} value The array of values to set.
	 */
	setValue: (value: InspectorValue, skipEvent?: boolean) => void;
	/**
	 * Method to retrieve the current array of values.
	 * @returns {InspectorArrayEditableValue[]} The current array of values.
	 */
	getValue: () => InspectorArrayEditableValue[];
}

/**
 * Configuration options for creating an array widget.
 */
export interface AddArrayOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, "callback">, AddContainerOptions
{
	/**
	 * The type of data held in the array (e.g., 'string', 'number').
	 * Defaults to 'string'.
	 */
	dataType?: InspectorWidgetTypes;
	/**
	 * The maximum number of items to display in the array inspector.
	 * Defaults to 100.
	 */
	maxItems?: number;
	/**
	 * Configuration options for the widgets created for each item in the array.
	 */
	dataOptions?: GenericCreationOptions;
	/**
	 * Callback function triggered when an item in the array is changed, added, or removed.
	 * @param value The updated array of values.
	 * @param index The index of the item that changed, or -1 if an item was removed.
	 */
	callback?: (value: InspectorArrayEditableValue[], index: number) => void;
	/**
	 * Whether to show the length input field in the controls.
	 */
	showLength?: boolean;
}

/**
 * Widget to edit an array of values of a certain type
 * @function AddArray
 * @param {Inspector} that The inspector instance
 * @param {string} name The name/label of the widget
 * @param {InspectorArrayEditableValue[]} value The initial array of values
 * @param {AddArrayOptions} options Configuration options for the widget. Common options include:
 * - `dataType`: The type of every value inside the array (default: "string").
 * - `maxItems`: Max number of items to show from the array (default: 100).
 * - `dataOptions`: Options passed to the widget created for each item.
 * - `callback`: Function called when the array changes.
 * @return {ArrayWidgetContainer} The container element of the widget
 */
export function AddArray(that: Inspector, name: string, value: InspectorArrayEditableValue[], options: AddArrayOptions = {})
{
	const type = options.dataType ?? "string";
	const maxItems = options.maxItems ?? 100;

	// Helper for default values
	const getDefaultValueForType = (t: InspectorWidgetTypes) =>
	{
		switch (t)
		{
		case "number":
		case "slide":
			return 0;
		case "string":
		case "text":
		case "textarea":
			return "";
		case "boolean":
		case "checkbox":
			return false;
		case "vec2":
		case "vector2":
			return [0, 0];
		case "vec3":
		case "vector3":
			return [0, 0, 0];
		case "vec4":
		case "vector 4":
			return [0, 0, 0, 0];
		case "color":
			return [1, 1, 1];
		default:
			return null;
		}
	};

	/*
	 * Create the main widget
	 * We use createWidget to get the standard wrapper, but we'll populate it manually
	 */
	const widget = that.createWidget(name, undefined, { ...options, width: "100%" }) as ArrayWidgetContainer;
	widget.className += " array-widget";

	// Create the header that holds the name and controls
	const header = document.createElement("div");
	header.className = "array-header";

	// Name (Label)
	const title = document.createElement("span");
	title.className = "wname";
	title.innerText = name;
	title.title = name;
	if (options.nameWidth)
	{
		title.style.width = SizeToCSS(options.nameWidth) as string;
	}
	header.appendChild(title);

	// Controls Container (Buttons + Input)
	const controls = document.createElement("div");
	controls.className = "array-controls";

	// +/- Buttons
	const btnPlus = document.createElement("button");
	btnPlus.className = "litebutton";
	btnPlus.innerText = "+";
	btnPlus.addEventListener("click", () =>
	{
		const def = getDefaultValueForType(type) ?? "";
		if (Array.isArray(def))
		{
			value.push([...def]);
		}
		else
		{
			value.push(def);
		}
		refresh();
		triggerChange(value.length - 1);
	});

	const btnMinus = document.createElement("button");
	btnMinus.className = "litebutton";
	btnMinus.innerText = "-";
	btnMinus.addEventListener("click", () =>
	{
		if (value.length > 0)
		{
			value.length = value.length - 1;
			refresh();
			triggerChange(value.length);
		}
	});

	// Length Input
	let lengthInput: HTMLInputElement | undefined;

	controls.appendChild(btnPlus);
	controls.appendChild(btnMinus);

	if (options.showLength)
	{
		lengthInput = document.createElement("input");
		lengthInput.type = "text";
		lengthInput.className = "array-length";
		lengthInput.value = value.length.toString();
		lengthInput.addEventListener("change", (e: Event) =>
		{
			const rv = parseInt((e.target as HTMLInputElement).value);
			if (!isNaN(rv))
			{
				if (rv > value.length)
				{
					for (let i = value.length; i < rv; ++i)
					{
						const def = getDefaultValueForType(type) ?? "";
						if (Array.isArray(def))
						{
							value.push([...def]);
						}
						else
						{
							value.push(def);
						}
					}
				}
				else
				{
					value.length = Math.max(0, rv);
				}
				refresh();
				triggerChange();
			}
		});

		controls.appendChild(lengthInput);
	}

	header.appendChild(controls);

	widget.innerHTML = ""; // Clear default structure
	widget.appendChild(header);

	// Container for items
	const container = document.createElement("div");
	container.className = "wcontainer array-items";
	widget.value = value;
	widget.appendChild(container);

	// Attach widget to inspector
	that.appendWidget(widget);

	// Implementation of Logic
	const assign = function (a: { value: InspectorArrayEditableValue[]; index: number }, v: unknown)
	{
		a.value[a.index] = v as InspectorArrayEditableValue;
		triggerChange(a.index);
	};

	const triggerChange = (index: number = -1) =>
	{
		if (lengthInput) { lengthInput.value = value.length.toString(); }
		if (options.callback)
		{
			options.callback(value, index);
		}
		that.onWidgetChange(widget, name, value, options as unknown as WidgetChangeOptions);
	};

	const refresh = function ()
	{
		const size = Math.min(value.length, maxItems);
		if (lengthInput) { lengthInput.value = value.length.toString(); }

		container.innerHTML = "";
		const oldWidgetsPerRow = that.widgetsPerRow;
		that.widgetsPerRow = 1;

		for (let i = 0; i < size; ++i)
		{
			if (value[i] === undefined)
			{
				const def = getDefaultValueForType(type) ?? "";
				if (Array.isArray(def))
				{
					value[i] = [...def];
				}
				else
				{
					value[i] = def;
				}
			}

			const v: InspectorArrayEditableValue = value[i];

			const row = document.createElement("div");
			row.className = "array-row";
			row.innerHTML = `<span class='row-index'>${i}</span><span class='row-cell'></span><button style='width: 30px;' class='litebutton single row-trash'></button>`;
			container.appendChild(row);

			const widgetRowContainer = row.querySelector('.row-cell') as HTMLDivElement;

			const itemOptions: PropertyOptions = {
				...options.dataOptions,
				widgetParent: widgetRowContainer,
				callback: assign.bind(undefined, { value: value, index: i })
			};

			that.add(type, undefined, v, itemOptions);

			const trashBtn = row.querySelector('.row-trash');
			if (trashBtn)
			{
				trashBtn.addEventListener("click", () =>
				{
					if (value && value.length > i)
					{
						value.splice(i, 1);
						refresh();
						triggerChange(-1);
					}
				});
			}
		}
		that.widgetsPerRow = oldWidgetsPerRow;
	};

	refresh();

	widget.setValue = function (v: InspectorValue)
	{
		if (v === undefined || !Array.isArray(v)) { return; }
		const val = v as InspectorArrayEditableValue[];
		this.value = val;
		value.length = 0;
		// Copy to keep reference
		for (let i = 0; i < val.length; ++i) {value[i] = val[i];}
		refresh();
	};

	widget.getValue = function ()
	{
		return this.value;
	};

	return widget;
}

declare module "./inspector" {
	interface Inspector
	{
		addArray(name: string, value: InspectorArrayEditableValue[], options?: AddArrayOptions): ArrayWidgetContainer;
	}
}

Inspector.prototype.addArray = function (name: string, value: InspectorArrayEditableValue[], options?: AddArrayOptions): ArrayWidgetContainer
{
	return AddArray(this, name, value, options);
};

Inspector.widgetConstructors.array = "addArray";