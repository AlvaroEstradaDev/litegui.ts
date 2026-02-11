import { CreateElement, CreateListItem, RemoveClass, SizeToCSS } from "../utilities";
import { LiteGUIObject } from "../@types/globals";
import { SpecialCode } from "../core";

/**
 * Options for the ComplexList widget.
 */
export interface ComplexListOptions
{
	/** Height of the list */
	height?: string | number;
	/** Custom HTML code for items */
	itemCode?: string;
	/** Callback when an item is selected */
	onItemSelected?: (node: ComplexListDivElement | number, data: ComplexListSpanElement) => void;
	/** Callback when an item is toggled (tick) */
	onItemToggled?: (node: ComplexListDivElement | number, data: ComplexListSpanElement, isEnabled: boolean) => void;
	/** Callback when an item is removed (trash) */
	onItemRemoved?: (node: ComplexListDivElement | number, data: ComplexListSpanElement) => void;
}

/**
 * Interface for the list item element (span).
 */
export interface ComplexListSpanElement extends HTMLSpanElement
{
	hide: () => void;
	show: () => void;
	setSelected: (v: boolean) => void;
	setContent: (v: string, isHTML: boolean) => void;
	toggleEnabled: () => void;
	item?: ComplexListDivElement | number;
}

/**
 * Interface for the data object of a list item.
 */
export interface ComplexListDivElement extends HTMLDivElement
{
	content?: string;
	name?: string;
}

/**
 * ComplexList widget for advanced lists with icons and buttons.
 * @class ComplexList
 */
export class ComplexList implements LiteGUIObject
{
	/** Root element */
	root: HTMLDivElement;
	/** Configuration options */
	options: ComplexListOptions;
	/** HTML template code for items */
	itemCode: string;
	/** Currently selected item */
	selected?: HTMLDivElement | number;

	onItemSelected?: (node: ComplexListDivElement | number, data: ComplexListSpanElement) => void;
	onItemToggled?: (node: ComplexListDivElement | number, data: ComplexListSpanElement, isEnabled: boolean) => void;
	onItemRemoved?: (node: ComplexListDivElement | number, data: ComplexListSpanElement) => void;

	/**
	 * Creates an instance of the ComplexList widget.
	 * @param {ComplexListOptions} [options] - Configuration options.
	 */
	constructor(options: ComplexListOptions = {})
	{
		this.options = options;

		this.root = document.createElement("div");
		this.root.className = "litecomplexlist";

		this.itemCode = this.options.itemCode || "<div class='listitem'><span class='tick'><span>" + SpecialCode.tick + "</span></span><span class='title'></span><button class='trash'>" + SpecialCode.close + "</button></div>";

		if (this.options.height)
		{
			this.root.style.height = SizeToCSS(this.options.height) ?? '';
		}

		this.onItemSelected = options.onItemSelected;
		this.onItemToggled = options.onItemToggled;
		this.onItemRemoved = options.onItemRemoved;
	}

	/**
	 * Adds a title/header to the list.
	 * @param {string} text - Title text.
	 * @returns {HTMLElement} The title element.
	 */
	addTitle(text: string)
	{
		const elem = CreateElement("div", ".listtitle", text);
		this.root.appendChild(elem);
		return elem;
	}

	/**
	 * Adds a custom HTML element to the list.
	 * @param {string} html - HTML content.
	 * @param {Function} [onClick] - Click handler.
	 * @returns {HTMLElement} The created element.
	 */
	addHTML(html: string, onClick?: () => void)
	{
		const elem = CreateElement("div", ".listtext", html);
		if (onClick) { elem.addEventListener("mousedown", onClick); }
		this.root.appendChild(elem);
		return elem;
	}

	/**
	 * Clears the list content.
	 */
	clear()
	{
		this.root.innerHTML = "";
	}

	/**
	 * Adds an item to the list.
	 * @param {ComplexListDivElement | number} item - Data object or ID.
	 * @param {string} text - Display text.
	 * @param {boolean} isEnabled - Whether it is enabled (checked).
	 * @param {boolean} canBeRemoved - Whether it can be removed (trash icon).
	 * @returns {ComplexListSpanElement} The created list item element.
	 */
	addItem(item: ComplexListDivElement | number, text: string, isEnabled: boolean, canBeRemoved: boolean)
	{
		const title = text ?? ((typeof item === 'object') ? (item.content || item.name) ?? "" : "");
		const elem = CreateListItem(this.itemCode, { ".title": title }) as ComplexListSpanElement;
		elem.item = item;

		if (isEnabled) { elem.classList.add("enabled"); }

		if (!canBeRemoved)
		{
			const trash = elem.querySelector<HTMLElement>(".trash");
			if (trash) { trash.style.display = "none"; }
		}

		elem.addEventListener("mousedown", (e: MouseEvent) =>
		{
			e.preventDefault();
			elem.setSelected(true);
			if (this.onItemSelected)
			{
				this.onItemSelected(item, elem);
			}
		});

		const tick: HTMLElement | null = elem.querySelector(".tick");
		if (tick)
		{
			tick.addEventListener("mousedown", (e: MouseEvent) =>
			{
				e.preventDefault();
				elem.classList.toggle("enabled");
				if (this.onItemToggled)
				{
					this.onItemToggled(item, elem, elem.classList.contains("enabled"));
				}
			});
		}

		const trash: HTMLElement | null = elem.querySelector(".trash");
		if (trash)
		{
			trash.addEventListener("mousedown", (e: MouseEvent) =>
			{
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				elem.remove();
				if (this.onItemRemoved)
				{
					this.onItemRemoved(item, elem);
				}
			});
		}

		elem.setContent = function (value: string, isHTML: boolean)
		{
			const title: HTMLElement | null = elem.querySelector(".title");
			if (title)
			{
				if (isHTML)
				{
					title.innerHTML = value;
				}
				else
				{
					title.innerText = value;
				}
			}
		};

		elem.toggleEnabled = function ()
		{
			elem.classList.toggle("enabled");
		};

		elem.setSelected = (selected: boolean) =>
		{
			RemoveClass(this.root, "selected");
			if (selected)
			{
				elem.classList.add("selected");
			}
			else
			{
				elem.classList.remove("selected");
			}
			this.selected = elem.item;
		};

		elem.show = function () { this.style.display = ""; };
		elem.hide = function () { this.style.display = "none"; };

		this.root.appendChild(elem);
		return elem;
	}
}