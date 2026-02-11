import { SafeName, Trigger } from "../utilities";
import { CreateWidgetOptions, InspectorActiveWidget, InspectorValue, WidgetChangeOptions } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "./inspector";

/**
 * Options for creating a List widget.
 */
export interface AddListOptions extends CreateWidgetOptions, Omit<WidgetChangeOptions, 'callback'>
{
	/**
	 * Height of the list in pixels.
	 */
	height?: number;
	/**
	 * Whether the list is disabled.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Allow multiple items to be selected.
	 * @default false
	 */
	multiSelection?: boolean;
	/**
	 * The initially selected item value.
	 */
	selected?: string;
	/**
	 * Callback function to execute when an item is double-clicked.
	 */
	onDoubleClick?: (value: string) => void;
}

/**
 * Represents an item in the list.
 */
export interface ListItemOptions
{
	/**
	 * Content to display for the item (can be HTML).
	 */
	content: string;
	/**
	 * Title tooltip for the item.
	 */
	title: string;
	/**
	 * Unique name/identifier for the item.
	 */
	name: string;
	/**
	 * Inline CSS styles for the item.
	 */
	style: string;
	/**
	 * URL of an icon to display with the item.
	 */
	icon: string;
	/**
	 * Whether the item is selected.
	 */
	selected: boolean;
}

/**
 * Interface representing the List widget.
 */
export interface InspectorListWidget extends InspectorActiveWidget
{
	/**
	 * Adds a new item to the list.
	 * @param {string} value The value/name of the item.
	 * @param {boolean} selected Whether the item should be selected.
	 */
	addItem: (value: string, selected: boolean) => void;
	/**
	 * Removes an item from the list by name.
	 * @param {string} value The value/name of the item to remove.
	 */
	removeItem: (value: string) => void;
	/**
	 * Updates the entire list of items.
	 * @param {string[]} new_values Array of new item values.
	 * @param {string} [item_selected] The value of the item to select.
	 */
	updateItems: (new_values: string[], item_selected?: string) => void;
	/**
	 * Retrieves the currently selected items.
	 * @returns {string[]} Array of selected item names.
	 */
	getSelected: () => string[];
	/**
	 * Gets the list item element by its index.
	 * @param {number} index The index of the item.
	 * @returns {HTMLElement} The list item element.
	 */
	getByIndex: (index: number) => HTMLElement;
	/**
	 * Selects an item by its index.
	 * @param {number} index The index of the item to select.
	 * @param {boolean} [add_to_selection] If true, adds to existing selection instead of replacing it.
	 * @returns {HTMLElement} The selected list item element.
	 */
	selectIndex: (index: number, add_to_selection?: boolean) => HTMLElement;
	/**
	 * Deselects an item by its index.
	 * @param {number} index The index of the item to deselect.
	 * @returns {HTMLElement} The deselected list item element.
	 */
	deselectIndex: (index: number) => HTMLElement;
	/**
	 * Scrolls the list to ensure the item at the specified index is visible.
	 * @param {number} index The index of the item to scroll to.
	 */
	scrollToIndex: (index: number) => void;
	/**
	 * Selects all items in the list.
	 */
	selectAll: () => void;
	/**
	 * Deselects all items in the list.
	 */
	deselectAll: () => void;
	/**
	 * Sets the values (items) of the list.
	 * @param {string[]} value Array of item values.
	 */
	setValue: (value: InspectorValue) => void;
	/**
	 * Returns the number of items in the list.
	 */
	getNumberOfItems: () => void;
	/**
	 * Filters the list items based on a callback or string match.
	 * @param {string | ((value: number, item: HTMLElement, selected: boolean) => boolean)} [callback] filter string or callback function.
	 * @param {boolean} [case_sensitive] Whether the string filter is case sensitive.
	 */
	filter: (callback?: string |
		((value: number, item: HTMLElement, selected: boolean) => boolean),
		case_sensitive?: boolean) => void;
	/**
	 * Selects items that match a filter callback.
	 * @param {(value: number, item: HTMLElement, selected: boolean) => boolean} callback Function to determine if an item should be selected.
	 */
	selectByFilter: (callback: ((value: number, item: HTMLElement, selected: boolean) => boolean)) => void;
}


/**
 * Widget to select from a list of items.
 * @function AddList
 * @param {Inspector} that The inspector instance.
 * @param {string} [name] The name of the widget.
 * @param {string[]} [values] Array of string values for the list items.
 * @param {AddListOptions} [options] Configuration options.
 * @returns {InspectorListWidget} The created list widget element.
 */
export function AddList(that: Inspector, name?: string, values?: string[], options?: AddListOptions): InspectorListWidget
{
	values = values ?? [];
	options = options ?? {};
	const valueName = that.getValueName(name, options);

	let listHeight = "";
	if (options.height) { listHeight = "style='height: 100%; overflow: auto;'"; }

	const code = `<ul class='lite-list' ${listHeight} tabIndex='${that.tabIndex}'><ul>`;
	that.tabIndex++;

	const element = that.createWidget(name, `<span class='inputfield full ${options.disabled ?
		"disabled" : ""}' style='height: 100%;'>${code}</span>`, options) as InspectorListWidget;

	const infoContent = element.querySelector(".info_content") as HTMLElement;
	infoContent.style.height = "100%";

	element.querySelector(".lite-list");
	const inputField = element.querySelector(".inputfield") as HTMLInputElement;
	inputField.style.height = "100%";
	inputField.style.paddingBottom = "0.2em";

	const ul_elements = element.querySelectorAll("ul");

	const _onKey = function (e: KeyboardEvent)
	{
		const selected = element.querySelector("li.selected") as HTMLLIElement;
		if (!selected) { return; }

		if (e.code == 'Enter') // Intro
		{
			if (!selected) { return; }
			let pos: string | number | undefined = selected.dataset["pos"];
			if (pos == undefined) { return; }
			pos = typeof pos == "string" ? parseFloat(pos) : 0;
			const value = values![pos];
			if (options!.onDoubleClick) { options!.onDoubleClick.call(that, value); }
		}
		else if (e.code == 'ArrowDown') // Arrow down
		{
			const next = selected.nextSibling;
			if (next) { Trigger(next, "click"); }
			selected.scrollIntoView({ block: "end", behavior: "smooth" });
		}
		else if (e.code == 'ArrowUp') // Arrow up
		{
			const prev = selected.previousSibling;
			if (prev) { Trigger(prev, "click"); }
			selected.scrollIntoView({ block: "end", behavior: "smooth" });
		}
		else
		{
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		return true;
	};
	const _onItemClick = (e: MouseEvent): void =>
	{
		const el = e.target as HTMLLIElement;
		if (options!.multiSelection)
		{
			el.classList.toggle("selected");
		}
		else
		{
			const lis = element.querySelectorAll("li");
			for (let i = 0; i < lis.length; ++i)
			{
				lis[i].classList.remove("selected");
			}
			el.classList.add("selected");
		}

		let pos: string | number | undefined = el.dataset["pos"];
		if (pos == undefined) { return; }
		pos = typeof pos == "string" ? parseFloat(pos) : 0;
		const value = values![pos];
		that.onWidgetChange(element, valueName, value, options);
		Trigger(element, "wadded", value);
	};
	const _onItemDblClick = function (e: MouseEvent)
	{
		const el = e.target as HTMLLIElement;
		let pos: string | number | undefined = el.dataset["pos"];
		if (pos == undefined) { return; }
		pos = typeof pos == "string" ? parseFloat(pos) : 0;
		const value = values![pos];
		if (options!.onDoubleClick) { options!.onDoubleClick.call(that, value); }
	};
	const _focusCallback = function ()
	{
		document.addEventListener("keydown", _onKey, true);
	};
	const _blurCallback = function ()
	{
		document.removeEventListener("keydown", _onKey, true);
	};

	for (let i = 0; i < ul_elements.length; ++i)
	{
		const ul = ul_elements[i];
		ul.addEventListener("focus", _focusCallback);
		ul.addEventListener("blur", _blurCallback);
	}


	element.updateItems = function (newValues: string[], itemSelected?: string)
	{
		itemSelected = itemSelected ?? options!.selected;
		if (!itemSelected && newValues.length > 0)
		{
			itemSelected = newValues[0] ?? '';
		}
		values = newValues;
		const ul = this.querySelector("ul") as HTMLElement;
		ul.innerHTML = "";

		if (values)
		{
			for (const i in values)
			{
				const liElement = _insertItem(values[i], itemSelected == values[i] ? true : false, i);
				ul.appendChild(liElement);
			}
		}

		const li = ul.querySelectorAll("li");
		LiteGUI.bind(li, "click", { handleEvent: _onItemClick });
	};

	function _insertItem(value: string | number | ListItemOptions, selected: boolean, index?: string)
	{
		const itemIndex = index; // To reference it
		let itemTitle = ""; // To show in the list

		let itemStyle = null;
		let icon = "";

		if (typeof value === "string" || typeof value === "number")
		{
			itemTitle = value.toString();
		}
		else
		{
			itemTitle = value.content ?? value.title ?? value.name ?? index;
			itemStyle = value.style;
			if (value.icon) { icon = `<img src='${value.icon}' class='icon' /> `; }
			if (value.selected) { selected = true; }
		}


		let itemName = itemTitle;
		itemName = itemName.replace(/<(?:.|\n)*?>/gm, ''); // Remove html tags that could break the html

		const liItem = document.createElement("li");
		liItem.classList.add(`item-${SafeName(itemIndex ?? "")}`);
		if (selected) { liItem.classList.add('selected'); }
		liItem.dataset["name"] = itemName;
		liItem.dataset["pos"] = itemIndex;
		liItem.value = (value as number);
		if (itemStyle) { liItem.setAttribute("style", itemStyle); }
		liItem.innerHTML = icon + itemTitle;
		liItem.addEventListener("click", _onItemClick);
		if (options!.onDoubleClick)
		{
			liItem.addEventListener("dblclick", _onItemDblClick);
		}
		return liItem;
	}

	element.addItem = function (value: string, selected: boolean)
	{
		values!.push(value);
		const ul = this.querySelector("ul") as HTMLElement;
		const liElement = _insertItem(value, selected);
		ul.appendChild(liElement);
	};

	element.removeItem = function (name: string)
	{
		const items = element.querySelectorAll(".wcontent li") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < items.length; i++)
		{
			if (items[i].dataset["name"] == name)
			{
				LiteGUI.remove(items[i]);
			}
		}
	};

	element.updateItems(values, options.selected);
	that.appendWidget(element, options);

	element.getSelected = function ()
	{
		const r: string[] = [];
		const selected = this.querySelectorAll("ul li.selected") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < selected.length; ++i)
		{
			r.push(selected[i].dataset["name"] as string);
		}
		return r;
	};

	element.getByIndex = function (index: number)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		return items[index] as HTMLElement;
	};

	element.selectIndex = function (num: number, add_to_selection?: boolean)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (i == num)
			{
				item.classList.add("selected");
			}
			else if (!add_to_selection)
			{
				item.classList.remove("selected");
			}
		}
		return items[num];
	};

	element.deselectIndex = function (num: number)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		const item = items[num];
		if (item) { item.classList.remove("selected"); }
		return item;
	};

	element.scrollToIndex = function (num: number)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		const item = items[num];
		if (!item) { return; }
		this.scrollTop = item.offsetTop;
	};

	element.selectAll = function ()
	{
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (item.classList.contains("selected")) { continue; }
			Trigger(item, "click");
		}
	};

	element.deselectAll = function ()
	{
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (!item.classList.contains("selected")) { continue; }
			Trigger(item, "click");
		}
	};

	element.setValue = function (v: InspectorValue)
	{
		if (v === undefined || !Array.isArray(v)) { return; }
		this.updateItems(v as string[]);
	};

	element.getNumberOfItems = function ()
	{
		const items = this.querySelectorAll("ul li");
		return items.length;
	};

	element.filter = function (callback?: string |
		((value: number, item: HTMLElement, selected: boolean) => boolean),
	caseSensitive?: boolean)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		let useString = false;
		let onStringChange: ((value: string, item: HTMLElement, selected: boolean) => boolean) | undefined = undefined;

		if (typeof callback == 'string')
		{
			const needle = callback;
			if (caseSensitive) { needle.toLowerCase(); }
			useString = true;
			onStringChange = function (v: string) { return ((caseSensitive ? v : v.toLowerCase()).indexOf(needle) != -1); };
		}

		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (callback == undefined)
			{
				item.style.display = "";
				continue;
			}

			let value: number | string = item.value;
			if (useString && typeof value !== "string" && onStringChange)
			{
				value = item.innerHTML;
				if (!onStringChange(value, item, item.classList.contains("selected")))
				{
					item.style.display = "none";
				}
				else
				{
					item.style.display = "";
				}
			}
			else if (typeof callback != "string")
			{
				if (!callback(value, item, item.classList.contains("selected")))
				{
					item.style.display = "none";
				}
				else
				{
					item.style.display = "";
				}
			}
		}
	};

	element.selectByFilter = function (callback: ((value: number, item: HTMLElement, selected: boolean) => boolean))
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			const r = callback(item.value, item, item.classList.contains("selected"));
			if (r === true)
			{
				item.classList.add("selected");
			}
			else if (r === false)
			{
				item.classList.remove("selected");
			}
		}
	};

	// Ensure the initial selected value is stored in the inspector
	const initialSelection = element.getSelected();
	if (initialSelection.length > 0)
	{
		if (options.multiSelection)
		{
			that.values.set(valueName, initialSelection);
		}
		else
		{
			that.values.set(valueName, initialSelection[0]);
		}
	}

	if (options.height) { element.scrollTop = 0; }
	that.processElement(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addList(name?: string, values?: string[], options?: AddListOptions): InspectorListWidget;
	}
}

Inspector.prototype.addList = function (name?: string, values?: string[], options?: AddListOptions): InspectorListWidget
{
	return AddList(this, name, values, options);
};

Inspector.widgetConstructors.list = "addList";