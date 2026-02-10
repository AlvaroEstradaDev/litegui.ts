import { SpecialCode } from "./core";
import { LiteGUIObject } from "./@types/globals/index";
import { Trigger } from "./utilities";

/**
 * Interface extending HTMLDivElement to include a reference to the Tabs instance.
 */
export interface TabsRootDivElement extends HTMLDivElement
{
	/**
	 * Reference to the Tabs widget instance associated with this element.
	 */
	tabs?: Tabs;
}

/**
 * Interface extending HTMLLIElement to include tab-specific properties.
 */
export interface TabInfoLIElement extends HTMLLIElement
{
	/**
	 * Indicates if this tab is currently selected.
	 */
	selected?: boolean;
	/**
	 * Options associated with this specific tab.
	 */
	options?: TabsOptions;
	/**
	 * Reference to the parent Tabs instance.
	 */
	tabs?: Tabs;
	/**
	 * Reference to the TabInfo object associated with this element.
	 */
	info?: TabInfo;
}

/**
 * Represents a single tab within the Tabs widget.
 * Stores references to the DOM elements and state of the tab.
 * @class TabInfo
 */
export class TabInfo
{
	/**
	 * Unique identifier for the tab.
	 */
	id: string;
	/**
	 * The list item element representing the tab in the tab bar.
	 */
	tab: TabInfoLIElement;
	/**
	 * The container element for the tab's content.
	 */
	content: HTMLDivElement;
	/**
	 * The element containing the tab's title text.
	 */
	title: Element;
	/**
	 * Callback function triggered when the tab is closed.
	 */
	onClose?: (tab: TabInfo) => void;
	/**
	 * Indicates if the tab is currently selected.
	 */
	selected?: boolean;

	/**
	 * Creates a new TabInfo instance.
	 * @param {string} id Unique identifier for the tab.
	 * @param {TabInfoLIElement} tab The list item element.
	 * @param {HTMLDivElement} content The content container element.
	 * @param {Element} title The title element.
	 */
	constructor(id: string, tab: TabInfoLIElement, content: HTMLDivElement, title: Element)
	{
		this.id = id;
		this.tab = tab;
		this.content = content;
		this.title = title;
	}

	/**
	 * Appends an element to the tab's content area.
	 * @param {LiteGUIObject | HTMLElement} element The element to append.
	 */
	add(element: LiteGUIObject | HTMLElement)
	{
		if (!element) { return; }
		this.content.appendChild("root" in element ? element.root : element);
	}

	/**
	 * Sets the title of the tab.
	 * @param {string} title The new title text.
	 */
	setTitle(title: string)
	{
		this.title.innerHTML = title;
	}

	/**
	 * Simulates a click on the tab.
	 */
	click()
	{
		Trigger(this.tab, "click");
	}
}

/**
 * Configuration options for the Tabs widget or individual tabs.
 */
export interface TabsOptions
{
	/**
	 * If true, the tab will be initially selected.
	 */
	selected?: boolean;
	/**
	 * Callback triggered when a tab is closed.
	 */
	onClose?: (tab: TabInfo) => void;
	/**
	 * Callback triggered when a tab is selected/clicked.
	 */
	callback?: (tab: string, event: PointerEvent | boolean) => void;
	/**
	 * Callback triggered when leaving a tab.
	 */
	onLeave?: (tab: TabInfo) => void;
	/**
	 * Callback triggered on right-click (context menu).
	 */
	onContextCall?: (tab: TabInfo) => void;
	/**
	 * Function to check if a tab can be opened. If it returns false, the tab won't open.
	 */
	onCanOpen?: (tab: TabInfoLIElement) => boolean;
	/**
	 * Additional CSS class names for the tab content container.
	 */
	className?: string;
	/**
	 * Parent element to append the tabs widget to.
	 */
	parent?: string | HTMLDivElement;
	/**
	 * Height of the widget.
	 */
	height?: string | number;
	/**
	 * Width of the widget.
	 */
	width?: string | number;
	/**
	 * Index to insert the tab at.
	 */
	index?: number;
	/**
	 * HTML string for a large icon.
	 */
	bigicon?: string;
	/**
	 * Title text of the tab.
	 */
	title?: string;
	/**
	 * If true, events won't be triggered during setup.
	 */
	skipCallbacks?: boolean;
	/**
	 * Initial HTML content or element for the tab.
	 */
	content?: string | HTMLElement;
	/**
	 * If true, the tab will have a close button.
	 */
	closable?: boolean;
	/**
	 * Width of the tab element itself.
	 */
	tabWidth?: number | string;
	/**
	 * Additional CSS class names for the tab element.
	 */
	tabClassName?: string;
	/**
	 * ID for the widget or tab.
	 */
	id?: string;
	/**
	 * Size options (e.g., "full").
	 */
	size?: string | number;
	/**
	 * Layout mode: "horizontal" or "vertical".
	 */
	mode?: "horizontal" | "vertical";
	/**
	 * If true, acts as a button rather than a switchable tab.
	 */
	button?: boolean;
	/**
	 * If true, tabs switch automatically on hover/drag.
	 */
	autoswitch?: boolean;
	/**
	 * If true, adds a "+" tab for creating new tabs.
	 */
	addPlusTab?: boolean;
	/**
	 * If true, allows double-clicking the tab title to rename it.
	 */
	allowRename?: boolean;
}

/**
 * Widget that manages multiple tabs and their associated content.
 * Supports horizontal and vertical modes, dynamic adding/removing of tabs, and various events.
 *
 * @class Tabs
 * @example
 * ```typescript
 * const tabs = new Tabs({ mode: "horizontal", size: "full" });
 * tabs.addTab("Home", { title: "Home", content: "Welcome!" });
 * parent.appendChild(tabs.root);
 * ```
 */
export class Tabs implements LiteGUIObject
{
	root: TabsRootDivElement;
	options: TabsOptions;
	mode: "horizontal" | "vertical";
	currentTab: number;
	previousTab: number;
	list: HTMLUListElement;
	tabsRoot: HTMLElement;
	tabs: { [key: string]: TabInfo } = {};
	tabsByIndex: TabInfo[];
	selected?: string;
	onchange?: CallableFunction;
	plusTab?: TabInfo;
	plusTabCallbacks: ((tab: string, event: PointerEvent | boolean) => void)[] = [];
	private _timeoutMouseOver?: NodeJS.Timeout;
	static TABS_WIDTH: number = 64;
	static TABS_HEIGHT: number = 26;

	/**
	 * Creates an instance of the Tabs widget.
	 * @param {TabsOptions} [options] Configuration options.
	 * @param {"horizontal" | "vertical"} [options.mode="horizontal"] Layout mode: "vertical" or "horizontal".
	 * @param {string|number} [options.size] Size of the widget (e.g., "full" for 100%).
	 * @param {string|number} [options.width] Explicit width.
	 * @param {string|number} [options.height] Explicit height.
	 * @param {boolean} [options.autoswitch] If true, switches tabs on hover/drag.
	 * @param {boolean} [options.addPlusTab] If true, adds a "+" tab for creating new tabs.
	 * @param {string|HTMLDivElement} [options.parent] Parent element to attach the widget to.
	 */
	constructor(options?: TabsOptions)
	{
		const op = options ?? {};
		this.options = op;

		const mode = this.mode = op.mode ?? "horizontal";

		const root = document.createElement("div") as TabsRootDivElement;
		if (op.id) { root.id = op.id; }
		root.className = "litetabs " + mode;
		root.tabs = this;
		this.root = root;

		// Initialize tab tracking variables, using -1 to indicate no tab selected.
		this.currentTab = -1;
		this.previousTab = -1;
		if (mode == "horizontal")
		{
			// Handle size options for horizontal mode
			if (op.size)
			{
				if (op.size == "full")
				{
					this.root.style.height = "100%";
				}
				else
				{
					this.root.style.height = op.size.toString();
				}
			}
		}
		else if (mode == "vertical")
		{
			// Handle size options for vertical mode
			if (op.size)
			{
				if (op.size == "full")
				{
					this.root.style.width = "100%";
				}
				else
				{
					this.root.style.width = op.size.toString();
				}
			}
		}

		if (op.width) { this.root.style.width = op.width.constructor === Number ? op.width.toFixed(0) + "px" : op.width.toString(); }
		if (op.height) { this.root.style.height = op.height.constructor === Number ? op.height.toFixed(0) + "px" : op.height.toString(); }

		/*
		 * Container of tab elements (the actual tabs you click on)
		 * This UL element holds the LI elements representing each tab
		 */
		const list = document.createElement("ul");
		list.className = "wtabcontainer";
		if (mode == "vertical") { list.style.width = Tabs.TABS_WIDTH + "px"; }
		else { list.style.height = Tabs.TABS_HEIGHT + "px"; }

		// Allows to use the wheel to see hidden tabs
		list.addEventListener("wheel", this.onMouseWheel);

		this.list = list;
		this.root.appendChild(this.list);
		this.tabsRoot = list;

		this.tabsByIndex = [];

		if (op.addPlusTab)
		{
			this.createPlusTab();
		}

		if (op.parent) { this.appendTo(op.parent as HTMLDivElement); }
	}

	/**
	 * Handles mouse wheel events on the tab strings list to scroll hidden tabs.
	 * @param {WheelEvent} e The mouse wheel event.
	 */
	onMouseWheel(e: WheelEvent)
	{
		if (e.deltaY) { this.list.scrollLeft += e.deltaY; }
	}

	/**
	 * Shows the Tabs widget.
	 */
	show()
	{
		this.root.style.display = "block";
	}

	/**
	 * Hides the Tabs widget.
	 */
	hide()
	{
		this.root.style.display = "none";
	}


	/**
	 * Returns the currently selected tab object.
	 * @returns {TabInfoLIElement | undefined} The tab list item element, or undefined if none selected.
	 */
	getCurrentTab()
	{
		if (this.currentTab > -1 && this.tabsByIndex[this.currentTab])
		{
			return this.tabsByIndex[this.currentTab].tab;
		}
		return undefined;
	}

	/**
	 * Returns the ID of the currently selected tab.
	 * @returns {string | undefined} The ID of the current tab, or undefined if none selected.
	 */
	getCurrentTabId()
	{
		if (this.currentTab > -1 && this.tabsByIndex[this.currentTab])
		{
			return this.tabsByIndex[this.currentTab].id;
		}
		return undefined;
	}

	/**
	 * Returns the tab that was selected before the current one.
	 * @returns {TabInfoLIElement | undefined} The previous tab list item element.
	 */
	getPreviousTab()
	{
		if (this.previousTab > -1 && this.tabsByIndex[this.previousTab])
		{
			return this.tabsByIndex[this.previousTab].tab;
		}
		return undefined;
	}

	/**
	 * Appends the Tabs widget to a parent element.
	 * @param {HTMLElement | string} parent The parent element or a CSS selector string.
	 * @param {boolean} [atFront=false] If true, prepends the widget instead of appending.
	 */
	appendTo(parent: HTMLElement | string, atFront?: boolean)
	{
		if (typeof parent === "string")
		{
			const found = document.querySelector(parent);
			if (!found)
			{
				console.warn("Tabs.appendTo: element not found " + parent);
				return;
			}
			parent = found as HTMLElement;
		}

		if (atFront)
		{
			parent.prepend(this.root);
		}
		else
		{
			parent.appendChild(this.root);
		}
	}

	/**
	 * Retrieves a TabInfo object by its ID.
	 * @param {string} id The ID of the tab.
	 * @returns {TabInfo | undefined} The TabInfo object if found.
	 */
	getTab(id: string)
	{
		if (id in this.tabs)
		{
			return this.tabs[id];
		}
		return undefined;
	}

	/**
	 * Retrieves a TabInfo object by its numerical index.
	 * @param {number} index The index in the tabs array.
	 * @returns {TabInfo} The TabInfo object.
	 */
	getTabByIndex(index: number)
	{
		return this.tabsByIndex[index];
	}

	/**
	 * Returns the total number of tabs.
	 * @returns {number} The count of tabs.
	 */
	getNumOfTabs()
	{
		return this.tabsByIndex.length;
	}

	/**
	 * Retrieves the content element of a specific tab.
	 * @param {string} id The ID of the tab.
	 * @returns {HTMLDivElement | undefined} The content div element.
	 */
	getTabContent(id: string)
	{
		const tab = this.getTab(id);
		if (tab) { return tab.content; }
		return undefined;
	}

	/**
	 * Returns the internal index of a tab given its ID.
	 * @param {string} id The ID of the tab.
	 * @returns {number} The index of the tab, or -1 if not found.
	 */
	getIndexOfTab(id: string)
	{
		for (let i = 0; i < this.tabsByIndex.length; i++)
		{
			const tab = this.tabsByIndex[i];
			if (tab && tab.id == id)
			{
				return i;
			}
		}
		return -1;
	}

	/**
	 * Returns the DOM index of the tab element within its parent container.
	 * @param {string} id The ID of the tab.
	 * @returns {number} The child node index, or -1 if not found.
	 */
	getIndexOfNodeList(id: string)
	{
		const tab = this.getTab(id);
		if (!tab) { return -1; }
		for (let i = 0; i < this.list.childNodes.length; i++)
		{
			if (this.list.childNodes[i] == tab.tab)
			{
				return i;
			}
		}
		return -1;
	}


	/**
	 * Adds a new tab to the widget.
	 *
	 * @param {string} id Unique identifier for the tab. If null, a random ID is generated.
	 * @param {TabsOptions | Function} options Configuration options for the tab, or a callback function for selection.
	 *  - If options is a **function**, it is treated as the `callback` property.
	 *  - If options is an **object**, it configures the tab.
	 * @param {string} [options.title] Text to display on the tab.
	 * @param {string|HTMLElement} [options.content] HTML content to display when selected.
	 * @param {Function} [options.callback] Function called when the tab is clicked. `(tabID, event) => void`.
	 * @param {Function} [options.onClose] Function called when the tab is closed. `(tabInfo) => void`.
	 * @param {boolean} [options.selected] If true, this tab becomes the active one.
	 * @param {boolean} [options.closable] If true, shows a close button.
	 * @param {string} [options.bigicon] URL or HTML for a large icon.
	 * @param {boolean} [options.button] If true, acts as a button (no content switch).
	 * @returns {TabInfo} The created TabInfo object.
	 */
	addTab(id: string, options: TabsOptions | ((tab: string, event: PointerEvent | boolean) => void))
	{
		if (typeof (options) == "function") { options = { callback: options }; }
		const tabOptions = options ?? {};
		const op = tabOptions;
		id = id ?? `rand_${(Math.random() * 1000000) | 0}`;

		// Create the tab element (list item)
		const element = document.createElement("li") as TabInfoLIElement;
		const safeID = id.replace(/ /gi, "_");
		element.className = `wtab wtab-${safeID}`;
		// If(options.selected) element.className += " selected";
		element.dataset.id = id;
		element.innerHTML = `<span class='tabtitle'>${op.title ?? id}</span>`;

		if (op.button) { element.className += " button "; }
		if (op.tabClassName) { element.className += op.tabClassName; }
		if (op.bigicon) { element.innerHTML = `<img class='tabbigicon' src='${op.bigicon}'/>` + element.innerHTML; }
		if (op.closable)
		{
			element.innerHTML += `<span class='tabclose'>${SpecialCode.close}</span>`;
			element.querySelector("span.tabclose")?.addEventListener("click", (e) =>
			{
				this.removeTab(id);
				e.preventDefault();
				e.stopPropagation();
			}, true);
		}

		// Determine insertion position
		if (op.index !== undefined)
		{
			// Insert at specific index if provided
			const after = this.list.childNodes[op.index];
			if (after)
			{
				this.list.insertBefore(element, after);
			}
			else
			{
				this.list.appendChild(element);
			}
		}
		else if (this.plusTab)
		{
			// If 'plus' tab exists, insert before it (it should always be last)
			this.list.insertBefore(element, this.plusTab.tab);
		}
		else
		{
			this.list.appendChild(element);
		}

		if (op.tabWidth)
		{
			element.style.width = typeof op.tabWidth === "number" ? `${op.tabWidth.toFixed(0)}px` : op.tabWidth.toString();
			element.style.minWidth = "0";
		}

		// Autoswitch behavior: switch tabs when dragging an item over them
		if (this.options.autoswitch)
		{
			element.classList.add("autoswitch");
			const dragEnterCallback = (e: DragEvent) =>
			{
				const el = e.target;
				// Debounce the switch to avoid flickering
				if (this._timeoutMouseOver) { clearTimeout(this._timeoutMouseOver); }
				this._timeoutMouseOver = setTimeout((() =>
				{
					Trigger(el as EventTarget, "click");
					this._timeoutMouseOver = undefined;
				}), 500);
			};
			element.addEventListener("dragenter", dragEnterCallback);

			element.addEventListener("dragleave", () =>
			{
				if (this._timeoutMouseOver)
				{
					clearTimeout(this._timeoutMouseOver);
					this._timeoutMouseOver = undefined;
				}
			});
		}

		// The content container for this tab
		const content = document.createElement("div");
		if (op.id) { content.id = op.id; }

		content.className = `wtabcontent wtabcontent-${safeID} ${op.className ?? ""}`;
		content.dataset.id = id;
		content.style.display = "none";

		// Adapt content height based on mode and size options
		if (this.mode == "horizontal")
		{
			if (op.size)
			{
				content.style.overflow = "auto";
				if (op.size == "full")
				{
					// Subtract tab header height calculation
					content.style.width = "100%";
					content.style.height = `calc( 100% - ${Tabs.TABS_HEIGHT}px )`;
				}
				else { content.style.height = op.size.toString(); }
			}
		}
		else if (this.mode == "vertical")
		{
			if (op.size)
			{
				content.style.overflow = "auto";
				if (op.size == "full")
				{
					// Subtract tab width calculation
					content.style.height = "100%";
					content.style.width = `calc( 100% - ${Tabs.TABS_WIDTH}px )`;
				}
				else
				{
					content.style.width = op.size.toString();
				}
			}
		}

		// Overwrite dimensions if explicitly provided in options
		if (op.width !== undefined)
		{
			content.style.width = typeof (op.width) === "string" ? op.width : `${op.width}px`;
		}
		if (op.height !== undefined)
		{
			content.style.height = typeof (op.height) === "string" ? op.height : `${op.height}px`;
		}

		// Add content to the container
		if (op.content)
		{
			if (typeof (op.content) == "string")
			{
				content.innerHTML = op.content;
			}
			else
			{
				content.appendChild(op.content);
			}
		}

		this.root.appendChild(content);

		// Bind click events
		if (!op.button)
		{
			element.addEventListener("click", this._onTabClicked.bind(this, element));
		}
		else
		{
			const clickCallback = (e: PointerEvent) =>
			{
				if (!e.target) { return; }
				const tabID = element.dataset.id;
				if (typeof tabID === "string" && op.callback) { op.callback(tabID, e); }
			};
			element.addEventListener("click", clickCallback.bind(element));
		}

		element.options = options;
		element.tabs = this;

		const title = element.querySelector("span.tabtitle");

		const tabInfo: TabInfo = new TabInfo(id, element, content, title!);
		element.info = tabInfo;

		if (op.onClose) { tabInfo.onClose = op.onClose; }
		const tempo = this.tabsByIndex.length;
		this.tabsByIndex[tempo] = tabInfo;
		this.tabs[id] = tabInfo;

		// Recompute indices to keep arrays in sync with DOM order
		this.recomputeTabsByIndex();

		// Context menu handler (Right-click)
		element.addEventListener("contextmenu", ((e) =>
		{
			if (e.button != 2) { return false; }// Right button
			e.preventDefault();
			if (op.onContextCall) { op.onContextCall(tabInfo); }
			return false;
		}));

		// Rename functionality via double-click
		if (this.options.allowRename)
		{
			element.addEventListener("dblclick", () =>
			{
				const titleSpan = element.querySelector<HTMLSpanElement>(".tabtitle");
				if (!titleSpan) {return;}

				const originalTitle = titleSpan.innerText;
				titleSpan.style.display = "none"; // Hide title

				// Create temporary input for renaming
				const input = document.createElement("input");
				input.type = "text";
				input.value = originalTitle;
				input.className = "tab-rename-input";
				input.style.width = "80px";
				let isProcessed = false;
				const processRename = () =>
				{
					if (isProcessed) {return;}
					isProcessed = true;
					const newTitle = input.value.trim();
					if (newTitle)
					{
						titleSpan.innerText = newTitle;
					}
					input.remove();
					titleSpan.style.display = "";
				};

				input.addEventListener("keydown", (e) =>
				{
					if (e.key === "Enter")
					{
						processRename();
					}
					else if (e.key === "Escape")
					{
						if (isProcessed) {return;}
						isProcessed = true;
						input.remove();
						titleSpan.style.display = "";
					}
				});
				input.addEventListener("blur", () =>
				{
					processRename();
				});

				element.insertBefore(input, titleSpan);
				input.focus();
			});
		}

		if (op.selected == true || this.selected == null)
		{
			this.selectTab(id, op.skipCallbacks);
		}

		return tabInfo;
	}

	/**
	 * Returns the 'Plus' tab if it exists.
	 * @returns {TabInfo | undefined} The plus tab info.
	 */
	getPlusTab()
	{
		return this.plusTab;
	}

	/**
	 * Adds a callback function to be executed when the 'Plus' tab is clicked.
	 * @param {Function} callback Function receiving tab ID and event: `(tab: string, event: PointerEvent | boolean) => void`.
	 */
	addPlusTab(callback: (tab: string, event: PointerEvent | boolean) => void)
	{
		this.addPlusTabCallback(callback);
	}

	/**
	 * Creates the 'Plus' tab internally if it doesn't exist.
	 */
	createPlusTab()
	{
		if (this.plusTab) {return;}
		this.plusTab = this.addTab("plus_tab", {
			title: "+",
			tabWidth: 20,
			button: true,
			tabClassName: "wtabplus",
			callback: this.onPlusTabClick.bind(this),
			skipCallbacks: true
		});
		// Ensure it is at the end
		this.list.appendChild(this.plusTab.tab);
	}

	/**
	 * Registers a callback for the 'Plus' tab click event.
	 * @param {Function} callback The callback function: `(tab: string, event: PointerEvent | boolean) => void`.
	 */
	addPlusTabCallback(callback: (tab: string, event: PointerEvent | boolean) => void)
	{
		if (!this.plusTab)
		{
			this.createPlusTab();
		}
		this.plusTabCallbacks.push(callback);
	}

	/**
	 * Removes a previously registered 'Plus' tab callback.
	 * @param {Function} callback The callback function to remove.
	 */
	removePlusTabCallback(callback: (tab: string, event: PointerEvent | boolean) => void)
	{
		const index = this.plusTabCallbacks.indexOf(callback);
		if (index > -1)
		{
			this.plusTabCallbacks.splice(index, 1);
		}
	}

	/**
	 * Handles the click event on the 'Plus' tab.
	 * Creates a ghost tab for user input and triggers callbacks.
	 * @param {string} tab The tab ID.
	 * @param {PointerEvent | boolean} event The event object.
	 */
	onPlusTabClick(tab: string, event: PointerEvent | boolean)
	{
		// Internal behavior: Create Ghost Tab for user input
		this.createGhostTab();

		// Execute any registered external callbacks
		for (const callback of this.plusTabCallbacks)
		{
			callback(tab, event);
		}
	}

	/**
	 * Creates a temporary "ghost" tab that allows the user to input a name for a new tab.
	 */
	createGhostTab()
	{
		const element = document.createElement("li") as TabInfoLIElement;
		element.className = "wtab wtabghost";

		// Input field for the new tab name
		const input = document.createElement("input");
		input.type = "text";
		input.placeholder = "New Tab";
		input.className = "wtabghostinput";

		element.appendChild(input);

		// Insert before plus tab so it appears 'inside' the list
		if (this.plusTab)
		{
			this.list.insertBefore(element, this.plusTab.tab);
		}
		else
		{
			this.list.appendChild(element);
		}

		let isProcessed = false;

		const confirm = () =>
		{
			if (isProcessed) {return;}
			isProcessed = true;
			const name = input.value.trim();
			if (name)
			{
				this.addTab(null!, { title: name, selected: true });
			}
			element.remove();
		};

		const cancel = () =>
		{
			if (isProcessed) {return;}
			isProcessed = true;
			element.remove();
		};

		input.addEventListener("keydown", (e) =>
		{
			if (e.key === "Enter")
			{
				confirm();
			}
			else if (e.key === "Escape")
			{
				cancel();
			}
		});

		input.addEventListener("blur", () =>
		{
			// If empty, cancel. If text, confirm
			const name = input.value.trim();
			if (!name)
			{
				cancel();
			}
			else
			{
				confirm();
			}
		});

		input.focus();
	}

	/**
	 * Adds a tab acting as a button (not user-selectable context switch).
	 * @param {string} id Unique identifier.
	 * @param {string} title Text to display.
	 * @param {Function} callback Function triggered on click.
	 * @returns {TabInfo} The created TabInfo object.
	 */
	addButtonTab(id: string, title: string, callback: (tab: string, event: PointerEvent | boolean) => void)
	{
		return this.addTab(id, { title: title, button: true, callback: callback, skipCallbacks: true });
	}

	/**
	 * Internal handler for tab click events.
	 * @private
	 * @param {TabInfoLIElement} element The tab element clicked.
	 * @param {PointerEvent | boolean} [event] The event triggering the click.
	 */
	private _onTabClicked(element: TabInfoLIElement, event?: PointerEvent | boolean)
	{
		// Skip if already selected
		if (element.selected) { return; }

		if (!element.parentNode) { return; } // Safety check: element might have been removed

		const options = this.options;
		if (!this) { throw ("tabs not found"); }

		// Check if this tab is allowed to be opened
		if (options.onCanOpen && options.onCanOpen(element) == false) { return; }

		const tabId = element.dataset.id;
		// Trigger 'onLeave' event for the tab being exited
		if (this.currentTab != -1 &&
			this.tabsByIndex[this.currentTab].id != tabId &&
			this.tabsByIndex[this.currentTab].content &&
			element.options?.onLeave)
		{
			const curTab = this.tabsByIndex[this.currentTab];
			element.options.onLeave(curTab);
		}

		let tabContent = null;

		// Iterate over all tabs to update visibility and selection state
		for (const name in this.tabs)
		{
			const tabInfo = this.tabs[name];

			if (tabInfo.id == tabId)
			{
				// Show the selected tab content
				tabInfo.selected = true;
				tabInfo.content.style.display = "";
				tabContent = tabInfo.content;
			}
			else
			{
				// Hide other tabs
				tabInfo.selected = false;
				tabInfo.content.style.display = "none";
			}
		}

		const list = this.list.querySelectorAll<TabInfoLIElement>("li.wtab");
		for (const tabInfo of list)
		{
			tabInfo.classList.remove("selected");
			tabInfo.selected = false;
		}
		element.selected = true;
		element.classList.add("selected");

		// Change current tab index
		this.previousTab = this.currentTab;
		this.currentTab = this.getIndexOfTab(tabId!);

		if (event) // User clicked
		{
			// Trigger callback function
			if (typeof tabId === "string")
			{
				if (options.callback) { options.callback(tabId, event); }
				if (element.options && element.options.callback) { element.options.callback(tabId, event); }
			}

			// Trigger global change events
			Trigger(this.root, "wchange", [tabId, tabContent]);
			if (this.onchange) { this.onchange(tabId, tabContent); }
		}

		// Update selected ID property
		this.selected = tabId;
	}

	/**
	 * Selects a tab by its ID.
	 * @param {string} id The ID of the tab to select.
	 * @param {boolean} [skipEvents=false] If true, prevents triggering callbacks.
	 */
	selectTab(id: string, skipEvents: boolean = false)
	{
		if (!id) { return; }

		const tabs = this.list.querySelectorAll<TabInfoLIElement>("li.wtab");
		for (const tabInfo of tabs)
		{
			if (id == tabInfo.dataset["id"])
			{
				this._onTabClicked(tabInfo, !skipEvents);
				break;
			}
		}
	}

	/**
	 * Sets the visibility of a tab and its content.
	 * @param {string} id The ID of the tab.
	 * @param {boolean} visible True to show, false to hide.
	 */
	setTabVisibility(id: string, visible: boolean)
	{
		const tab = this.getTab(id);
		if (!tab) { return; }

		tab.tab.style.display = visible ? "" : "none";
		tab.content.style.display = visible ? "" : "none";
	}

	/**
	 * Re-indexes the `tabsByIndex` array based on the current DOM order.
	 */
	recomputeTabsByIndex()
	{
		this.tabsByIndex = [];

		for (const i in this.tabs)
		{
			const tab = this.tabs[i];

			// Derive index from DOM position
			let index = 0;
			let child = tab.tab.previousSibling;
			while (child)
			{
				index++;
				child = child.previousSibling as TabInfoLIElement;
			}

			this.tabsByIndex[index] = tab;
		}
	}

	/**
	 * Removes a tab by its ID.
	 * @param {string} id The ID of the tab to remove.
	 */
	removeTab(id: string)
	{
		const tab = this.getTab(id);
		if (!tab)
		{
			console.warn(`tab not found: ${id}`);
			return;
		}

		if (tab.onClose) { tab.onClose(tab); }
		if (tab.tab.parentNode) { tab.tab.parentNode.removeChild(tab.tab); }
		if (tab.content.parentNode) { tab.content.parentNode.removeChild(tab.content); }

		const index = this.getIndexOfTab(id);
		this.tabsByIndex.splice(index, 1);
		delete this.tabs[id];

		this.recomputeTabsByIndex();
	}

	/**
	 * Removes all tabs.
	 * @param {boolean} [keepPlus=false] If true, preserves the 'Plus' tab.
	 */
	removeAllTabs(keepPlus: boolean = false)
	{
		const tabs = [];
		for (const i in this.tabs)
		{
			tabs.push(this.tabs[i]);
		}

		for (const i in tabs)
		{
			const tab = tabs[i];
			if (tab == this.plusTab && keepPlus) { continue; }
			if (tab.tab.parentNode) { tab.tab.parentNode.removeChild(tab.tab); }
			if (tab.content.parentNode) { tab.content.parentNode.removeChild(tab.content); }
			const index = this.getIndexOfTab(tab.id);
			this.tabsByIndex.splice(index, 1);
			delete this.tabs[tab.id];
		}

		this.recomputeTabsByIndex();
	}

	/**
	 * Alias for removing all tabs.
	 */
	clear()
	{
		this.removeAllTabs();
	}

	/**
	 * Hides a specific tab.
	 * @param {string} id The ID of the tab to hide.
	 */
	hideTab(id: string)
	{
		this.setTabVisibility(id, false);
	}

	/**
	 * Shows a previously hidden tab.
	 * @param {string} id The ID of the tab to show.
	 */
	showTab(id: string)
	{
		this.setTabVisibility(id, true);
	}

	/**
	 * Transfers a tab from this widget to another Tabs widget.
	 * @param {string} id The ID of the tab to transfer.
	 * @param {Tabs} targetTabs The destination Tabs widget.
	 * @param {number} [index=0] The index to insert the tab at in the target widget.
	 */
	transferTab(id: string, targetTabs: Tabs, index: number = 0)
	{
		const tab = this.getTab(id);
		if (!tab) { return; }

		targetTabs.tabs[id] = tab;

		// Insert tab into the new position in the list
		if (index !== 0)
		{
			targetTabs.list.insertBefore(tab.tab, targetTabs.list.childNodes[index]);
		}
		else
		{
			targetTabs.list.appendChild(tab.tab);
		}

		// Move content element to target's root
		targetTabs.root.appendChild(tab.content);

		// Remove from current tabs
		delete this.tabs[id];
		this.tabsByIndex.splice(this.getIndexOfTab(id), 1);

		// Auto-select another tab if the current one was moved
		let newtab = "";
		for (const i in this.tabs)
		{
			newtab = i;
			if (newtab) { break; }
		}

		if (newtab) { this.selectTab(newtab); }


		// Remove selection style from transferred tab
		tab.tab.selected = false;

		// Update state in target
		targetTabs.recomputeTabsByIndex();
		targetTabs.selectTab(id);
	}

	/**
	 * Detaches a tab into a new window.
	 * @param {string} id The ID of the tab to detach.
	 * @param {Function} [onComplete] Callback triggering when detachment is complete.
	 * @param {Function} [onClose] Callback triggering when the new window is closed.
	 * @returns {Window | undefined} The new window object.
	 */
	detachTab(id: string, onComplete?: () => void, onClose?: () => void)
	{
		const index = this.getIndexOfNodeList(id);
		const tab = this.tabs[id];
		if (!tab) { return; }

		// Create new window
		const w = 800;
		const h = 600;
		const tabWindow = window.open("", "", `width=${w}, height=${h}, location=no, status=no, menubar=no, titlebar=no, fullscreen=yes`);
		if (!tabWindow) { return; }
		tabWindow.document.writeln(`<head><title>${id}</title>`);

		// Transfer stylesheets to the new window to maintain look and feel
		const styles = document.querySelectorAll("link[rel='stylesheet'],style");
		for (let i = 0; i < styles.length; i++) { tabWindow.document.writeln(styles[i].outerHTML); }
		tabWindow.document.writeln("</head><body></body>");
		tabWindow.document.close();

		// Transfer content after a while so the window is properly created
		const newTabs = new Tabs(this.options);
		tabWindow.tabs = newTabs;

		// Handle window closing event to re-attach tab
		tabWindow.onbeforeunload = () =>
		{
			newTabs.transferTab(id, this, index);
			if (onClose) { onClose(); }
		};

		// Move the content to the new window
		newTabs.list.style.height = "20px";
		tabWindow.document.body.appendChild(newTabs.root);
		this.transferTab(id, newTabs, index);

		// Ensure the transferred tab is selected in the new window
		newTabs.tabs[id].tab.selected = true;
		this.recomputeTabsByIndex();

		if (onComplete) { onComplete(); }

		return tabWindow;
	}
}