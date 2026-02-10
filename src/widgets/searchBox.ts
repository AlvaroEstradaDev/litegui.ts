import { LiteGUIObject } from "../@types/globals";

/**
 * Options for the SearchBox widget.
 */
export interface SearchBoxOptions
{
	/** Placeholder text */
	placeholder?: string;
	/** Callback function executed when value changes */
	callback?: (value: string) => void;
}

/**
 * SearchBox widget.
 * @class SearchBox
 */
export class SearchBox implements LiteGUIObject
{
	/** Root element of the widget */
	root: HTMLDivElement;
	/** Configuration options */
	options: SearchBoxOptions;
	/** Current value */
	value: string;
	/** Input element */
	input: HTMLInputElement;
	/** Callback function executed when value changes */
	callback?: (value: string) => void;

	/**
	 * Creates an instance of the SearchBox widget.
	 * @param {string} [value=''] - Initial value.
	 * @param {SearchBoxOptions} [options] - Configuration options.
	 */
	constructor(value: string = '', options: SearchBoxOptions = {})
	{
		this.options = options;
		this.value = value;
		const element = document.createElement("div") as HTMLDivElement;
		element.className = "litegui searchbox";
		const placeholder = options.placeholder ?? "Search";
		element.innerHTML = `<input value='${value}' placeholder='${placeholder}'/>`;
		this.input = element.querySelector("input")!;
		this.root = element;

		this.input.onchange = () =>
		{
			const value = this.input.value;
			if (options.callback) { options.callback(value); }
		};
	}

	/**
	 * Sets the value of the search box.
	 * @param {string} value - New value.
	 */
	setValue(value: string)
	{
		this.input.value = value;
		if (this.input.onchange) { this.input.onchange(new Event("change")); }
	}

	/**
	 * Gets the current value of the search box.
	 * @returns {string} The current value.
	 */
	getValue()
	{
		return this.input.value;
	}
}
