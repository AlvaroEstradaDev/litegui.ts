import { LiteGUIObject } from "../@types/globals";

/**
 * Standard checkbox class.
 * @class Checkbox
 */
export class Checkbox implements LiteGUIObject
{
	/** Root element of the widget */
	root: HTMLSpanElement;
	/** Current value of the checkbox */
	value: boolean;
	/** Element representing the checkbox state */
	element: HTMLSpanElement;
	/** Callback function executed when value changes */
	onChange: (value: boolean) => void;

	/**
	 * Creates an instance of the Checkbox widget.
	 * @param {boolean} value - Initial value.
	 * @param {Function} onChange - Callback function when value changes.
	 */
	constructor(value: boolean, onChange: (value: boolean) => void)
	{
		this.value = value;

		const root = this.root = document.createElement("span") as HTMLSpanElement;
		root.className = "litecheckbox inputfield";
		root.dataset["value"] = value.toString();

		const element = this.element = document.createElement("span") as HTMLSpanElement;
		element.className = `fixed flag checkbox ${value ? "on" : "off"}`;
		root.appendChild(element);
		root.addEventListener("click", this.onClick.bind(this));
		this.onChange = onChange;
	}

	/**
	 * Sets the value of the checkbox.
	 * @param {boolean} value - New value.
	 */
	setValue(value: boolean)
	{
		if (this.value === value || !this.root || !this.element) { return; }

		if (this.root.dataset["value"] == value.toString()) { return; }

		this.root.dataset["value"] = value.toString();

		if (value)
		{
			this.element.classList.remove("off");
			this.element.classList.add("on");
		}
		else
		{
			this.element.classList.remove("on");
			this.element.classList.add("off");
		}

		this.value = value;
		this.onChange(value);
	}

	/**
	 * Gets the current value of the checkbox.
	 * @returns {boolean} The current value.
	 */
	getValue()
	{
		return this.root.dataset["value"] == "true";
	}

	/**
	 * Handles click event to toggle value.
	 */
	onClick()
	{
		this.setValue(this.root.dataset["value"] != "true");
	}
}
