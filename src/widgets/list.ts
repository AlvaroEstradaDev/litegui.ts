import { LiteGUIObject } from "../@types/globals";
import { Trigger } from "../utilities";

/**
 * Structure of a list item.
 */
export interface ListItem
{
	name: string, title: string, id: string
}

/**
 * Options for the List widget.
 */
export interface ListOptions
{
	/** Parent element to append to */
	parent?: LiteGUIObject | HTMLElement;
	/** Callback function when selection changes */
	callback?: (value: string | ListItem) => void;
}

/**
 * Event target interface for List events.
 */
export interface ListEventTarget extends EventTarget
{
	data: string | ListItem;
	classList: DOMTokenList;
}

/**
 * HTMLLIElement extending interface for list items.
 */
export interface ListLIElement extends HTMLLIElement
{
	data: string | ListItem;
}

/**
 * List widget.
 * @class List
 */
export class List implements LiteGUIObject
{
	/** Root element */
	root: HTMLUListElement;
	/** Callback function */
	callback?: (value: string | ListItem) => void;

	/**
	 * Creates an instance of the List widget.
	 * @param {string} id - Identifier for the list.
	 * @param {Array<string | ListItem>} items - Items to display.
	 * @param {ListOptions} [options] - Configuration options.
	 */
	constructor(id: string, items: Array<string | ListItem>, options?: ListOptions)
	{
		options = options! || {};

		const root = this.root = document.createElement("ul") as HTMLUListElement;
		root.id = id;
		root.className = "litelist";

		this.callback = options.callback;

		const onClickCallback = (e: PointerEvent) =>
		{
			const el = e.target as ListEventTarget;
			if (!el) { return; }

			const list = root.querySelectorAll(".list-item.selected");
			for (let j = 0; j < list.length; ++j)
			{
				list[j].classList.remove("selected");
			}
			el.classList.add("selected");
			Trigger(this.root, "wchanged", el);

			if (this.callback) { this.callback(el.data); }
		};
		for (const i in items)
		{
			const liItem = document.createElement("li") as ListLIElement;
			liItem.className = "list-item";
			liItem.data = items[i];
			liItem.dataset["value"] = items[i].toString();

			let content = "";
			const item = items[i];
			if (typeof item == "string")
			{
				content = item + "<span class='arrow'></span>";
			}
			else
			{
				content = (item.name || item.title || "") + "<span class='arrow'></span>";
				if (item.id)
				{
					liItem.id = item.id;
				}
			}
			liItem.innerHTML = content;

			liItem.addEventListener("click", onClickCallback.bind(liItem));

			root.appendChild(liItem);
		}

		if (options.parent)
		{
			if ('root' in options.parent)
			{
				options.parent.root.appendChild(root);
			}
			else if ('appendChild' in options.parent)
			{
				options.parent.appendChild(root);
			}
		}
	}

	/**
	 * Gets the selected item.
	 * @returns {Element | null} The selected element.
	 */
	getSelectedItem()
	{
		return this.root.querySelector(".list-item.selected");
	}

	/**
	 * Sets the selected item by name/id.
	 * @param {string} name - Name or ID of the item to select.
	 */
	setSelectedItem(name: string)
	{
		const items = this.root.querySelectorAll(".list-item");
		for (let i = 0; i < items.length; i++)
		{
			const item: ListLIElement = items[i] as ListLIElement;
			if (item.data == name || (typeof item.data !== "string" && item.data.id == name))
			{
				Trigger(item, "click");
				break;
			}
		}
	}
}
