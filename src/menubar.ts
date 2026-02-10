import { LiteGUIObject } from "./@types/globals";
import { LiteGUI } from "./core";
import { Panel } from "./panel";

/**
 * Configuration options for the menubar.
 */
export interface MenubarOptions
{
	/**
	 * Whether the menu opens automatically on mouse over.
	 */
	autoOpen: boolean;
	/**
	 * Whether to sort entries alphabetically.
	 */
	sortEntries: boolean;
}

/**
 * Interface for the root HTML element of a menu bar.
 */
export interface MenuBarElement extends HTMLElement
{
	/**
	 * Name of the menu bar element.
	 */
	name?: string;
	/**
	 * Data associated with the menu bar element.
	 */
	data?: MenuBarElementData;
}

/**
 * Data associated with a menu item.
 */
export interface MenuBarElementData
{
	/**
	 * Type of the menu item (e.g., 'checkbox').
	 */
	type?: 'checkbox',
	/**
	 * The object instance if this menu item controls a property.
	 */
	instance?: { [property: string]: boolean },
	/**
	 * The property name of the instance to control.
	 */
	property?: string,
	/**
	 * Fixed value to set when clicked.
	 */
	value?: boolean,
	/**
	 * Boolean state for the checkbox.
	 */
	checkbox?: boolean,
	/**
	 * Whether the menu item is disabled.
	 */
	disabled?: boolean,
	/**
	 * Whether the menu should remain open after clicking.
	 */
	keepOpen?: boolean,
	/**
	 * Function to determine if the item is checked.
	 */
	isChecked?: (instance?: { [property: string]: boolean }, data?: MenuBarElementData) => void,
	/**
	 * Callback function executed when the item is clicked.
	 */
	callback?: (value: { checkbox?: boolean }) => void,
	/**
	 * Whether the submenu opens automatically on mouse over.
	 */
	autoOpen?: boolean;
}

/**
 * Interface for paragraph elements representing menu entries.
 */
export interface MenuBarParagraphElement extends HTMLParagraphElement
{
	/**
	 * SubMenu data associated with this element.
	 */
	data?: SubMenu;
}

/**
 * Options for adding a new menu item.
 */
export interface AddMenuOptions
{
	/**
	 * Whether the item acts as a checkbox.
	 */
	checkbox?: boolean;
	/**
	 * Whether the menu should keep open after interaction.
	 */
	keepOpen?: boolean;
	/**
	 * Whether the item is disabled.
	 */
	disabled?: boolean;
	/**
	 * Callback function to execute on click.
	 */
	callback?: (value: { checkbox?: boolean }) => void;
	/**
	 * Whether the submenu opens automatically on mouse over.
	 */
	autoOpen?: boolean;
}

/**
 * Interface representing a submenu structure.
 */
export interface SubMenu
{
	/**
	 * Display name of the submenu.
	 */
	name: string;
	/**
	 * Parent submenu, if any.
	 */
	parent?: SubMenu;
	/**
	 * Child submenus.
	 */
	children?: SubMenu[];
	/**
	 * Data associated with the submenu item.
	 */
	data?: MenuBarElementData;
	/**
	 * Function to disable this submenu item.
	 */
	disable?: () => void;
	/**
	 * Function to enable this submenu item.
	 */
	enable?: () => void;
	/**
	 * Flag to indicate if this item is a separator.
	 */
	separator?: boolean;
	/**
	 * Order index for sorting.
	 */
	order?: number;
	/**
	 * The HTML element associated with this submenu.
	 */
	element?: SubMenuElement;
}

/**
 * Interface for list items representing submenus.
 */
export interface SubMenuElement extends HTMLLIElement
{
	/**
	 * Data associated with this element.
	 */
	data?: SubMenu;
}

/** ************ MENUBAR ************************/
/**
 * Class representing a MenuBar widget.
 * @class Menubar
 * @example
 * ```typescript
 * const menubar = new Menubar("main-menubar");
 * menubar.add("File/Open", { callback: () => console.log("Open") });
 * menubar.attachToPanel(myPanel);
 * ```
 */
export class Menubar implements LiteGUIObject
{
	/**
	 * Time in milliseconds before the menu closes automatically.
	 */
	closingTime: number;
	/**
	 * Configuration options for the menubar.
	 */
	options: MenubarOptions;
	/**
	 * The root HTML element of the menubar.
	 */
	root: MenuBarElement;
	/**
	 * Array of submenu structures.
	 */
	menu: SubMenu[];
	/**
	 * Array of panel elements used for dropdowns.
	 */
	panels: HTMLDivElement[];
	/**
	 * The unordered list element containing the main menu items.
	 */
	content: HTMLUListElement;
	/**
	 * Whether the menu is currently open.
	 */
	isOpen: boolean;
	/**
	 * Whether the menu opens automatically on hover.
	 */
	autoOpen: boolean;
	/**
	 * Whether to sort entries alphabetically.
	 */
	sortEntries: boolean;
	/**
	 * Default options used when adding menus.
	 */
	data?: AddMenuOptions;
	/**
	 * Timer identifier for closing the menu.
	 */
	closingByLeave?: NodeJS.Timeout | null;

	/**
	 * Creates an instance of the Menubar widget.
	 * @param {string} id Unique identifier for the menubar.
	 * @param {MenubarOptions} [options] Configuration options.
	 */
	constructor(id: string, options?: MenubarOptions)
	{
		this.options = options ?? { autoOpen: false, sortEntries: false };

		this.menu = [];
		this.panels = [];

		this.root = document.createElement("div");
		this.root.id = id;
		this.root.className = "litemenubar";

		this.content = document.createElement("ul");
		this.root.appendChild(this.content);

		this.isOpen = false;
		this.autoOpen = this.options.autoOpen;
		this.sortEntries = this.options.sortEntries;
		this.closingTime = 500;
	}

	/**
	 * Clears all menu items and panels.
	 */
	clear()
	{
		this.content.innerHTML = "";
		this.menu = [];
		this.panels = [];
	}

	/**
	 * Attaches the menubar to a specific panel.
	 * @param {Panel} panel The panel to attach the menubar to.
	 */
	attachToPanel(panel: Panel)
	{
		panel.content.insertBefore(this.root, panel.content.firstChild);
	}

	/**
	 * Adds a menu item to the menubar.
	 * @param {string} path The path of the menu item (e.g., "File/Open").
	 * @param {((value?: { checkbox?: boolean }) => void) | AddMenuOptions} [data={}] Callback function or options object.
	 */
	add(path: string, data: ((value?: { checkbox?: boolean }) => void) | AddMenuOptions = {})
	{
		if (typeof (data) == "function")
		{
			this.data = { callback: data };
		}
		else
		{
			this.data = data;
		}

		const prevLength = this.menu.length;

		const tokens = path.split("/");
		let currentToken = 0;
		let currentPos = 0;
		let menu = this.menu;
		let lastItem: SubMenu | undefined = undefined;

		while (menu)
		{
			if (currentToken > 5) { throw ("Error: Menubar too deep"); }
			// Token not found in this menu, create it
			if (menu.length == currentPos)
			{
				const subMenu: SubMenu = {
					name: "", parent: lastItem, children: [], data: undefined,
					disable: function ()
					{
						if (this.data) { this.data.disabled = true; }
					},
					enable: function ()
					{
						if (this.data) { this.data.disabled = undefined; }
					}
				};
				lastItem = subMenu;

				if (currentToken == tokens.length - 1) { subMenu.data = this.data; }

				subMenu.name = tokens[currentToken];
				menu.push(subMenu);
				currentToken++;

				if (currentToken == tokens.length) { break; }

				subMenu.children = [];
				menu = subMenu.children;
				currentPos = 0;
				continue;
			}

			// Token found in this menu, get inside for next token
			if (menu[currentPos] && tokens[currentToken] == menu[currentPos].name)
			{
				if (currentToken < tokens.length - 1)
				{
					lastItem = menu[currentPos];
					if (menu[currentPos].children != undefined)
					{
						menu = menu[currentPos].children!;
					}
					currentPos = 0;
					currentToken++;
					continue;
				}
				else // Last token
				{
					console.warn(`Warning: Adding menu that already exists: ${path}`);
					break;
				}
			}
			currentPos++;
		}

		if (prevLength != this.menu.length) { this.updateMenu(); }
	}

	/**
	 * Removes a menu item by its path.
	 * @param {string} path The path of the menu item to remove.
	 */
	remove(path: string)
	{
		const menu = this.findMenu(path);
		if (!menu) { return; }

		if (Array.isArray(menu))
		{
			// This means that it's intended to delete a list and this is not allowed
			return console.warn("Can't remove an entire list");
		}
		// We are going to remove a single menu
		if (menu.parent && menu.parent.children)
		{
			const index = menu.parent.children.indexOf(menu);
			if (index != -1)
			{
				menu.parent.children.splice(index, 1);
				if (this.isOpen)
				{
					this.hidePanels();
					const evt = new PointerEvent("click", {
						view: window,
						bubbles: true,
						cancelable: true,
						clientX: 0,
						clientY: 0
					});
					if (menu.parent.element)
					{
						this.showMenu(menu.parent, evt, menu.parent.element);
					}
				}

			}
		}
		else
		{
			const index = this.menu.indexOf(menu);
			if (index != -1)
			{
				this.menu.splice(index, 1);
				if (this.isOpen)
				{
					this.hidePanels();
				}

			}
		}
	}

	/**
	 * Adds a separator to a menu.
	 * @param {string} path The path where the separator should be added.
	 * @param {number} [order] Optional order index.
	 */
	separator(path: string, order?: number)
	{
		const menu = this.findMenu(path);
		if (!menu) { return; }
		if (Array.isArray(menu))
		{
			// This means that it's intended to delete a list and this is not allowed
			return console.warn("Can't separate an entire list");
		}
		if (menu.children)
		{
			menu.children.push({
				name: "",
				children: undefined,
				data: undefined,
				separator: true,
				order: order ?? 10
			});
		}
	}

	/**
	 * Returns the menu entry that matches this path.
	 * @param {string} path The path to search for.
	 * @returns {SubMenu | SubMenu[] | undefined} The found submenu or undefined.
	 */
	findMenu(path: string): SubMenu | SubMenu[] | undefined
	{
		const tokens = path.split("/");
		let currentToken = 0;
		let currentPos = 0;
		let menu = this.menu;

		while (currentToken <= 5)
		{
			// No more tokens, return last found menu
			if (currentToken == tokens.length) { return menu; }

			// This menu doesn't have more entries
			if (menu.length <= currentPos) { return undefined; }

			if (tokens[currentToken] == "*") { return menu[currentPos].children; }

			// Token found in this menu, get inside for next token
			if (tokens[currentToken] == menu[currentPos].name)
			{
				if (currentToken == tokens.length - 1) // Last token
				{
					return menu[currentPos];
				}
				if (menu[currentPos].children)
				{menu = menu[currentPos].children!;}
				currentPos = 0;
				currentToken++;
				continue;
			}

			// Check next entry in this menu
			currentPos++;
		}
		return undefined;
	}

	/**
	 * Updates the top main menu display based on the internal structure.
	 */
	updateMenu()
	{
		this.content.innerHTML = "";
		const clickCallback = (element: SubMenuElement, e: PointerEvent) =>
		{
			const el = element;
			const item = el.data;

			if (item && item.data && item.data.callback && typeof (item.data.callback) == "function")
			{
				item.data.callback(item.data);
			}

			if (!this.isOpen && item)
			{
				this.isOpen = true;
				this.showMenu(item, e, el);
			}
			else
			{
				this.isOpen = false;
				this.hidePanels();
			}
		};
		const mouseOverCallback = (element: SubMenuElement, e: MouseEvent) =>
		{
			this.hidePanels();
			if (this.isOpen || this.autoOpen)
			{
				const el = element;
				if (el.data)
				{
					this.showMenu(el.data, e, el);
				}
			}
		};
		for (const i in this.menu)
		{
			const element = document.createElement("li") as SubMenuElement;
			element.innerHTML = "<span class='icon'></span><span class='name'>" + this.menu[i].name + "</span>";
			this.content.appendChild(element);
			element.data = this.menu[i];
			this.menu[i].element = element;

			/* ON CLICK TOP MAIN MENU ITEM */
			element.addEventListener("click", clickCallback.bind(undefined, element));
			element.addEventListener("mouseover", mouseOverCallback.bind(undefined, element));
		}
	}

	/**
	 * Hides all open dropdown panels.
	 */
	hidePanels()
	{
		if (!this.panels.length) { return; }

		this.isOpen = false;
		for (const i in this.panels)
		{
			LiteGUI.remove(this.panels[i]);
		}
		this.panels = [];
	}

	/**
	 * Creates the panel with the drop menu and shows it.
	 * @param {SubMenu} menu The submenu structure to display.
	 * @param {MouseEvent} e The mouse event that triggered the show.
	 * @param {HTMLElement} root The element relative to which the menu is shown.
	 * @param {boolean} [isSubmenu=false] Whether this is a nested submenu.
	 */
	showMenu(menu: SubMenu, e: MouseEvent, root: HTMLElement, isSubmenu: boolean = false)
	{
		this.isOpen = true;
		if (!isSubmenu) { this.hidePanels(); }

		if (!menu.children || !menu.children.length) { return; }

		if (this.closingByLeave) { clearInterval(this.closingByLeave); }

		const element = document.createElement("div");
		element.className = "litemenubar-panel";

		const sortedEntries = [];
		for (const i in menu.children)
		{
			sortedEntries.push(menu.children[i]);
		}

		if (this.sortEntries)
		{
			sortedEntries.sort((a, b) =>
			{
				let aOrder = 10;
				let bOrder = 10;
				const aa = a;
				const bb = b;
				if (aa && aa.order != null) { aOrder = aa.order; }
				if (aa && aa.separator && aa.order != null) { aOrder = aa.order; }
				if (bb && bb.order != null) { bOrder = bb.order; }
				if (bb && bb.separator && bb.order != null) { bOrder = bb.order; }
				return aOrder - bOrder;
			});
		}

		/* ON CLICK SUBMENU ITEM */
		const clickCallback = (element: MenuBarParagraphElement, e: PointerEvent) =>
		{
			const el = element;
			const item = el.data;
			if (item && item.data)
			{
				if (item.data.disabled) { return; }

				// To change variables directly
				if (item.data.instance && item.data.property)
				{
					if (item.data.type == "checkbox")
					{
						item.data.instance[item.data.property] = !item.data.instance[item.data.property];
						if (item.data.instance[item.data.property])
						{
							el.classList.add("checked");
						}
						else
						{
							el.classList.remove("checked");
						}
					}
					else if ("value" in item.data)
					{
						const prop = item.data.property;
						if (prop)
						{
							(item.data.instance)[prop] = item.data.value ?? false;
						}
					}
				}

				// To have a checkbox behavior
				if (item.data.checkbox != null)
				{
					item.data.checkbox = !item.data.checkbox;
					if (item.data.checkbox)
					{
						el.classList.add("checked");
					}
					else
					{
						el.classList.remove("checked");
					}
				}

				// Execute a function
				if (item.data && typeof (item.data.callback) == "function")
				{
					item.data.callback(item.data);
				}
			}

			// More menus
			if (item && item.children && item.children.length)
			{
				this.showMenu(item, e, el, true);
			}
			else if (item && !item.data?.keepOpen)
			{
				this.isOpen = false;
				this.hidePanels();
			}
			else
			{
				this.isOpen = false;
				this.hidePanels();
				this.isOpen = true;
				this.showMenu(menu, e, root, isSubmenu);
			}
		};
		for (const i in sortedEntries)
		{
			const item = document.createElement("p") as MenuBarParagraphElement;
			const menuItem = sortedEntries[i];

			item.className = 'litemenu-entry ' + (item.children ? " submenu" : "");
			const hasSubmenu = menuItem.children && menuItem.children.length;

			if (hasSubmenu) { item.classList.add("has_submenu"); }

			if (menuItem && menuItem.name)
			{
				item.innerHTML = "<span class='icon'></span><span class='name'>" + menuItem.name + (hasSubmenu ? "<span class='more'>+</span>" : "") + "</span>";
			}
			else
			{
				item.classList.add("separator");
				// Item.innerHTML = "<span class='separator'></span>";
			}

			item.data = menuItem;

			// Check if it has to show the item being 'checked'
			if (item.data.data)
			{
				const data = item.data.data;

				const checked = (data.type == "checkbox" && data.instance && data.property &&
					data.instance[data.property] == true) || data.checkbox == true ||
					(data.instance && data.property && "value" in data && data.instance[data.property] == data.value) ||
					(typeof (data.isChecked) == "function" && data.isChecked(data.instance, data));

				if (checked) { item.className += " checked"; }

				if (data.disabled) { item.className += " disabled"; }
			}

			item.addEventListener("click", clickCallback.bind(undefined, item));

			item.addEventListener("mouseenter", () =>
			{
				if ((this.autoOpen || (item.data && item.data.data && item.data.data.autoOpen)) && item.classList.contains("has_submenu"))
				{
					item.click();
				}
			});

			element.appendChild(item);
		}

		element.addEventListener("mouseleave", () =>
		{
			if (this.closingByLeave)
			{
				clearInterval(this.closingByLeave);
			}

			this.closingByLeave = setTimeout(() =>
			{
				this.isOpen = false;
				this.hidePanels();
			}, this.closingTime);
		});

		element.addEventListener("mouseenter", () =>
		{
			if (this.closingByLeave)
			{
				clearInterval(this.closingByLeave);
			}
			this.closingByLeave = null;
		});

		// Compute X and Y for menu
		const box = root.getBoundingClientRect();
		if (isSubmenu)
		{
			element.style.left = `${box.right - 5}px`;
			element.style.top = `${box.top - 4}px`;
		}
		else
		{
			element.style.left = `${box.left}px`;
			element.style.top = `${box.bottom}px`;
		}

		this.panels.push(element);
		document.body.appendChild(element);
	}
}