import { LiteGUIObject } from "../@types/globals";

/**
 * HTMLSpanElement extending interface for ListBox element.
 */
export interface ListBoxSpanElement extends HTMLSpanElement
{
	/** Sets the open/closed state */
	setValue: (value: boolean) => void;
	/** Gets the current state */
	getValue: () => string;
	/** Sets if the listbox is empty */
	setEmpty: (value: boolean) => void;
	/** Expands the listbox */
	expand: () => void;
	/** Collapses the listbox */
	collapse: () => void;
	/** Reference to the ListBox instance */
	listBox: ListBox;
	/** Reference to the ListBox instance (alias) */
	parent: ListBox
}
/**
 * The tiny box to expand the children of a node.
 * @class ListBox
 */
export class ListBox implements LiteGUIObject
{
	/** Root element */
	root: ListBoxSpanElement;
	/** Whether to stop event propagation */
	stopPropagation: boolean = false;

	/**
	 * Creates an instance of the ListBox widget.
	 * @param {boolean} state - Initial state (true: open, false: closed).
	 * @param {Function} onChange - Callback when state changes.
	 */
	constructor(state: boolean, onChange: (value: string) => void)
	{
		const element = document.createElement("span") as ListBoxSpanElement;
		this.root = element;
		element.parent = this;
		element.listBox = this;
		element.className = "listbox " + (state ? "listopen" : "listclosed");
		element.innerHTML = state ? "&#9660;" : "&#9658;";
		element.dataset.value = state ? "open" : "closed";

		element.onclick = function (e: PointerEvent)
		{
			element.setValue(element.dataset.value == "open" ? false : true);
			if (element.parent.stopPropagation) { e.stopPropagation(); }
		};

		element.onchange = function ()
		{
			onChange(element.dataset.value ?? "closed");
		};

		element.setEmpty = function (value: boolean)
		{
			if (value)
			{
				this.classList.add("empty");
			}
			else
			{
				this.classList.remove("empty");
			}
		};

		element.setValue = function (value: boolean)
		{
			if (this.dataset.value == (value ? "open" : "closed"))
			{
				return;
			}

			if (!value)
			{
				this.dataset.value = "closed";
				this.innerHTML = "&#9658;";
				this.classList.remove("listopen");
				this.classList.add("listclosed");
			}
			else
			{
				this.dataset.value = "open";
				this.innerHTML = "&#9660;";
				this.classList.add("listopen");
				this.classList.remove("listclosed");
			}

			if (onChange)
			{
				onChange(this.dataset.value);
			}
		};

		element.expand = function ()
		{
			this.setValue(true);
		};

		element.collapse = function ()
		{
			this.setValue(false);
		};
	}

	/**
	 * Sets the value of the listbox (open/closed).
	 * @param {boolean} value - True to open, false to collapse.
	 */
	setValue(value: boolean)
	{
		this.root.setValue(value);
	}

	/**
	 * Gets the current value ("open" or "closed").
	 * @returns {string} The current state.
	 */
	getValue()
	{
		return this.root.dataset.value;
	}
}
