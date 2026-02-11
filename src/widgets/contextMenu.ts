import { IsCursorOverElement, Trigger } from "../utilities";
import { LiteGUIObject } from "../@types/globals";

/**
 * Data structure representing a menu item in the ContextMenu.
 */
export interface ContextMenuItemData
{
	/** Text content of the item */
	content?: string;
	/** Title (same as content usually) */
	title?: string;
	/** Submenu associated with this item */
	submenu?: ContextMenu;
	/** Whether it has a submenu */
	hasSubmenu?: boolean;
	/** Whether the item is disabled */
	disabled?: boolean;
	/** Options for the item (submenu options) */
	options?: ContextMenuOptions
	/** Callback function when clicked */
	callback?: (e: PointerEvent | MouseEvent, item: ContextMenuItemData, menu: ContextMenu, options?: ContextMenuOptions) => boolean;
}

/**
 * HTMLDivElement extending interface for a menu item element.
 */
export interface ContextMenuItem extends HTMLDivElement
{
	/** Data associated with the item */
	value?: ContextMenuItemData;
}

/**
 * Configuration options for the ContextMenu.
 */
export interface ContextMenuOptions
{
	/** Automatically open submenus on hover */
	autoOpen?: boolean;
	/** Ignore item callbacks and only use global callback */
	ignoreItemCallbacks?: boolean;
	/** Global callback function */
	callback?: (e: PointerEvent | MouseEvent, item: ContextMenuItemData, menu: ContextMenu, options?: ContextMenuOptions) => boolean;
	/** Top position */
	top?: number;
	/** Left position */
	left?: number;
	/** Title of the menu */
	title?: string;
	/** Event that triggered the menu (for positioning) */
	event?: PointerEvent | PointerEvent | MouseEvent | CustomEvent;
	/** Parent menu if this is a submenu */
	parentMenu?: ContextMenu;
}

/**
 * ContextMenu widget.
 * @class ContextMenu
 */
export class ContextMenu implements LiteGUIObject
{
	/** Root element */
	root: HTMLDivElement;
	/** Configuration options */
	options: ContextMenuOptions;
	/** Parent menu */
	parentMenu?: ContextMenu;
	/** Whether the menu is locked (open) */
	lock?: boolean;
	/** Currently open submenu */
	currentSubmenu?: ContextMenu;
	/** Timer for closing the menu */
	closingTimer?: NodeJS.Timeout;

	/**
	 * Creates an instance of the ContextMenu widget.
	 * @param {ContextMenuItemData[] | Record<string,ContextMenu>} values - Items to display.
	 * @param {ContextMenuOptions} [options] - Configuration options.
	 */
	constructor(values: (ContextMenuItemData|string)[] | Record<string,ContextMenu>, options?: ContextMenuOptions)
	{
		options = options ?? {};
		this.options = options;

		// To link a menu with its parent
		if (options.parentMenu)
		{
			if (options.parentMenu.constructor !== this.constructor)
			{
				console.error("parentMenu must be of class ContextMenu, ignoring it");
				options.parentMenu = undefined;
			}
			else
			{
				this.parentMenu = options.parentMenu;
				this.parentMenu.lock = true;
				this.parentMenu.currentSubmenu = this;
			}
		}

		if (options.event &&
			!(options.event.constructor.name === "PointerEvent" ||
				options.event.constructor.name === "MouseEvent" ||
				options.event.constructor.name === "CustomEvent"))
		{
			console.error("Event passed to ContextMenu is not of type PointerEvent, MouseEvent or CustomEvent. Ignoring it.");
			options.event = undefined;
		}

		const root = document.createElement("div");
		root.className = "litecontextmenu litemenubar-panel";
		root.style.minWidth = "100px";
		root.style.minHeight = "100px";
		root.style.pointerEvents = "none";
		setTimeout(() => { root.style.pointerEvents = "auto"; }, 100); // Delay so the mouse up event is not caught by this element

		// This prevents the default context browser menu to open in case this menu was created when pressing right button
		root.addEventListener("mouseup", (e: MouseEvent) =>
		{
			e.preventDefault();
			return true;
		}, true);

		root.addEventListener("contextmenu", (e: PointerEvent) =>
		{
			// Right button
			if (e.button != 2) { return false; }
			e.preventDefault();
			return false;
		}, true);

		root.addEventListener("mousedown", (e: MouseEvent) =>
		{
			if (e.button == 2)
			{
				this.close.bind(this, e);
				e.preventDefault();
				return true;
			}
			return false;
		}, true);

		this.root = root;

		// Title
		if (options.title)
		{
			const element = document.createElement("div") as HTMLDivElement;
			element.className = "litemenu-title";
			element.innerHTML = options.title;
			root.appendChild(element);
		}

		// Entries
		if (values)
		{
			let keys: string[] = [];
			let limit: number;
			if (values && !Array.isArray(values))
			{
				keys = Object.keys(values);
				limit = keys.length;
			}
			else
			{
				limit = values.length;
			}

			for (let i = 0; i < limit; i++)
			{
				let name: string;
				let value: ContextMenuItemData | string;
				if (Array.isArray(values))
				{
					name = i.toString();
					value = values[i];
				}
				else
				{
					name = keys[i];
					value = values[name];
				}
				this.addItem(name, value, options);
			}
		}

		// Close on leave
		root.addEventListener("mouseleave", (e: MouseEvent) =>
		{
			if (this.lock || !this.root) { return; }
			if (this.closingTimer) { clearTimeout(this.closingTimer); }
			this.closingTimer = setTimeout(this.close.bind(this, e), 500);
		});

		root.addEventListener("mouseenter", () =>
		{
			if (this.closingTimer) { clearTimeout(this.closingTimer); }
		});

		function _onMouseWheel(e: WheelEvent)
		{
			const pos = parseInt(root.style.top);
			root.style.top = (pos + e.deltaY * 0.1).toFixed() + "px";
			e.preventDefault();
			return true;
		}

		root.addEventListener("wheel", _onMouseWheel, true);

		// Insert before checking position
		let doc = document;
		if (options.event && options.event.target && (options.event.target as HTMLInputElement).ownerDocument)
		{
			doc = (options.event.target as HTMLInputElement).ownerDocument;
		}
		doc.body.appendChild(root);

		// Compute best position
		let left = options.left ?? 0;
		let top = options.top ?? 0;
		if (options.event)
		{
			if (options.event.constructor.name !== "PointerEvent" && options.event.constructor.name !== "MouseEvent" && options.event.constructor.name !== "CustomEvent")
			{
				console.warn("Event passed to ContextMenu is not of type PointerEvent");
				options.event = undefined;
			}
			else
			{
				left = ((options.event as PointerEvent | PointerEvent).pageX - 10);
				top = ((options.event as PointerEvent | PointerEvent).pageY - 10);
				if (options.title) { top -= 20; }

				if (options.parentMenu)
				{
					const rect = options.parentMenu.root.getBoundingClientRect();
					left = rect.left + rect.width;
				}

				const body_rect = document.body.getBoundingClientRect();
				const root_rect = root.getBoundingClientRect();

				if (left > (body_rect.width - root_rect.width - 10)) { left = (body_rect.width - root_rect.width - 10); }
				if (top > (body_rect.height - root_rect.height - 10)) { top = (body_rect.height - root_rect.height - 10); }
			}
		}

		root.style.left = left + "px";
		root.style.top = top + "px";
	}

	/**
	 * Closes the context menu.
	 * @param {MouseEvent} [e] - Event that triggered the close (optional).
	 * @param {boolean} [ignoreParent] - If true, does not close the parent menu.
	 */
	close(e?: MouseEvent, ignoreParent?: boolean)
	{
		if (this.root.parentNode) { this.root.parentNode.removeChild(this.root); }

		if (this.parentMenu && !ignoreParent)
		{
			this.parentMenu.lock = false;
			this.parentMenu.currentSubmenu = undefined;
			if (e === undefined)
			{
				this.parentMenu.close(e);
			}
			else if (e && !IsCursorOverElement(e, this.parentMenu.root))
			{
				Trigger(this.parentMenu.root, "mouseleave", e);
			}
		}

		if (this.currentSubmenu) { this.currentSubmenu.close(e, true); }
		if (this.closingTimer) { clearTimeout(this.closingTimer); }
	}

	/**
	 * Returns the top most menu.
	 * @returns {ContextMenu} The top most menu.
	 */
	getTopMenu(): ContextMenu
	{
		if (this.options.parentMenu) { return this.options.parentMenu.getTopMenu(); }
		return this;
	}

	/**
	 * Returns the first event that triggered the menu.
	 * @returns {MouseEvent | PointerEvent | CustomEvent | undefined} The event.
	 */
	getFirstEvent(): MouseEvent | PointerEvent | CustomEvent | undefined
	{
		if (this.options.parentMenu) { return this.options.parentMenu.getFirstEvent(); }
		return this.options.event;
	}

	/**
	 * Adds an item to the menu.
	 * @param {string} name - Name/ID of the item.
	 * @param {ContextMenuItemData | () => void} [value] - Data or callback.
	 * @param {ContextMenuOptions} [options] - Options.
	 * @returns {ContextMenuItem} The created element.
	 */
	addItem(name: string, value?: string | ContextMenuItemData | (() => void), options?: ContextMenuOptions)
	{
		options = options ?? {};

		const element = document.createElement("div") as ContextMenuItem;
		element.className = "litemenu-entry submenu";

		let disabled = false;

		if (!value)
		{
			element.classList.add("separator");
		}
		else
		{
			if (typeof value == "function")
			{
				element.innerHTML = name;
				element.dataset["value"] = name;
				element.onclick = value;
			}
			else if (typeof value == "string")
			{
				element.innerHTML = value;
				element.dataset["value"] = value;
				element.classList.add("disabled");
			}
			else if (value)
			{
				element.innerHTML = value.title ?? "";
				if (value.disabled)
				{
					disabled = true;
					element.classList.add("disabled");
				}
				if (value.submenu || value.hasSubmenu)
				{
					element.classList.add("has_submenu");
				}
				element.value = value;
			}
		}

		this.root.appendChild(element);

		// Menu option clicked
		const _OnMouseClick = (e: MouseEvent) =>
		{
			const value = element.value;
			let closeParent = true;

			if (this.currentSubmenu)
			{
				this.currentSubmenu.close(e);
			}

			// global callback
			if (options && options.callback)
			{
				const r = options.callback.call(this, e, value ?? {}, this, options);
				if (r) { closeParent = false; }
			}

			// Special cases
			if (value)
			{
				if (value.callback && !options?.ignoreItemCallbacks && value.disabled !== true)  // Item callback
				{
					const r = value.callback.call(this, e, value, this, options);
					if (r === true) { closeParent = false; }
				}
				if (value.submenu)
				{
					if (!value.submenu.options)
					{
						throw ("ContextMenu submenu needs options");
					}
					new ContextMenu([value.submenu.options], {
						callback: value.submenu.options.callback,
						ignoreItemCallbacks: value.submenu.options.ignoreItemCallbacks,
						title: value.submenu.options.title,
						event: e,
						parentMenu: this,
						autoOpen: options?.autoOpen
					});
					closeParent = false;
				}
			}

			if (closeParent && !this.lock) { this.close(e, true); }
		};

		const _onMouseOver = (e: MouseEvent) =>
		{
			const value = element.value;
			if (!value || !value.hasSubmenu) { return; }
			_OnMouseClick.call(element, e);
		};

		if (!disabled)
		{
			element.addEventListener("click", _OnMouseClick.bind(element));
		}
		if (options && options.autoOpen)
		{
			element.addEventListener("mouseenter", _onMouseOver.bind(element));
		}

		return element;
	}
}
