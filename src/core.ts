import { Area, Split } from "./area";
import { Dialog } from "./dialog";
import { Menubar } from "./menubar";
import { Panel } from "./panel";
import { Tabs } from "./tabs";
import
{
	Button, SearchBox, ContextMenu, Checkbox, ListBox, List, Slider,
	ComplexList, LineEditor
} from "./widgets";
import { Console } from "./console";
import { Tree } from "./widgets/tree";
import { Inspector } from "./inspector";
import { Dragger } from "./dragger";
import { Table } from "./table";
import
{
	LiteGUIObject
} from "./@types/globals";
import
{
	BlurElement, FocusElement, SizeToCSS, Trigger,
	Bind, Unbind, RemoveClass, GetById, IsCursorOverElement, GetRect, ToClipboard,
	AddCSS, RequireCSS, Request, RequestText, RequestJSON, RequestBinary,
	RequireScript, RequireScriptSerial, CreateElement, CreateListItem, CreateButton,
	GetParents, NewWindow, DownloadURL, DownloadFile, GetUrlVars, GetUrlVar,
	Draggable, CloneObject, SafeName, HTMLEncode, HTMLDecode, GetElementWindow,
	CreateDropArea, RemoveElement, ShowMessage, ChoiceDialog, PromptDialog, ConfirmDialog,
	AlertDialog, PopupDialog
} from "./utilities";

/**
 * Common HTML unicode symbols for UI icons.
 */
export enum SpecialCode
{
	/** Close icon (X) */
	close = "&#10005;",
	/** Hamburger menu icon */
	navicon = "&#9776;",
	/** Refresh arrow icon */
	refresh = "&#8634;",
	/** Gear/Settings icon */
	gear = "&#9881;",
	/** Open folder icon */
	openFolder = "&#128194;",
	/** Download icon */
	download = "&#11123;",
	/** Checkmark tick icon */
	tick = "&#10003;",
	/** Trash bin icon */
	trash = "&#128465;"
}

/**
 * Options to configure the LiteGUI Core initialization.
 */
export interface CoreOptions
{
	/** Width of the window/container */
	width?: number,
	/** Height of the window/container */
	height?: number,
	/** ID of the container element */
	container?: string,
	/** Whether to wrap the content in a root div */
	wrapped?: boolean,
	/** Whether to create a menubar automatically */
	menubar?: boolean,
	/** Callback function to be executed after initialization */
	callback?: () => void
}

/**
 * Core namespace of LiteGUI library, it holds some useful functions
 *
 * @class LiteGUI
 */
export class Core
{
	/** Root element of the LiteGUI instance */
	root?: HTMLElement;
	/** Main content container */
	content?: HTMLElement;
	/** Parent container element */
	container?: HTMLElement;
	/** Reference to the main menu element */
	mainMenu?: HTMLElement;
	/** Reference to the Menubar widget */
	menubar?: Menubar;
	/** Reference to the Tabs widget */
	tabs?: Tabs;
	/** Background element for modal dialogs (overlays the screen) */
	modalBackground?: HTMLElement;
	/** Registry of active panels */
	panels: Record<string, Panel> = {};
	/** Registry of open windows (popped out) */
	windows: Window[] = [];

	Area: typeof Area = Area;
	Split: typeof Split = Split;
	Menubar: typeof Menubar = Menubar;
	Dialog: typeof Dialog = Dialog;
	Panel: typeof Panel = Panel;
	Button: typeof Button = Button;
	SearchBox: typeof SearchBox = SearchBox;
	ContextMenu: typeof ContextMenu = ContextMenu;
	Checkbox: typeof Checkbox = Checkbox;
	ListBox: typeof ListBox = ListBox;
	List: typeof List = List;
	Slider: typeof Slider = Slider;
	LineEditor: typeof LineEditor = LineEditor;
	ComplexList: typeof ComplexList = ComplexList;
	Tabs: typeof Tabs = Tabs;
	Tree: typeof Tree = Tree;
	Console: typeof Console = Console;
	Inspector: typeof Inspector = Inspector;
	Dragger: typeof Dragger = Dragger;
	Table: typeof Table = Table;
	SpecialCode: typeof SpecialCode = SpecialCode;

	/**
	 * Initializes the LiteGUI library.
	 * @param {CoreOptions} [options] Configuration options.
	 */
	init(options?: CoreOptions): void
	{
		options = options ?? {};

		// Choose main container
		if (options.container)
		{
			this.container = document.getElementById(options.container) ?? undefined;
		}
		if (!this.container) { this.container = document.body; }

		if (options.wrapped)
		{
			// Create litegui root element
			const root: HTMLElement = document.createElement("div");
			root.style.position = "relative";
			root.style.overflow = "hidden";
			this.root = root;
			this.container.appendChild(root);

			// Content: the main container for everything
			const content: HTMLElement = document.createElement("div");
			this.content = content;
			this.root.appendChild(content);

			// Maximize
			if (this.root.classList.contains("fullscreen"))
			{
				window.addEventListener("resize", () =>
				{
					this.maximizeWindow();
				});
			}
		}
		else
		{
			this.root = this.content = this.container;
		}

		if (options.width && options.height)
		{
			this.setWindowSize(options.width, options.height);
		}

		this.root.className = "litegui-wrap fullscreen";
		this.content.className = "litegui-maincontent";

		// Create modal dialogs container
		const modalbg = this.modalBackground = document.createElement("div");
		this.modalBackground.className = "litemodalbg";
		this.root.appendChild(this.modalBackground);
		modalbg.style.display = "none";

		// Create menubar
		if (options.menubar)
		{
			this.createMenubar();
		}

		// Called before anything
		if (options.callback)
		{
			options.callback();
		}

		// External windows
		window.addEventListener("beforeunload", () =>
		{
			for (let i = 0; i < this.windows.length; ++i)
			{
				this.windows[i].close();
			}
			this.windows = [];
		});
	}

	/**
	 * Triggers a simple event in an object (similar to jQuery.trigger)
	 * @param {unknown} element could be an HTMLEntity or a regular object
	 * @param {string} eventName the type of the event
	 * @param {unknown} params it will be stored in e.detail
	 */
	trigger = Trigger;

	/**
	 * Binds an event in an object (similar to jQuery.bind)
	 * If the element is not an HTML entity a new one is created, attached to the object (as non-enumerable, called __events) and used
	 * @param {string | Object | Object[] | NodeListOf<HTMLElement>} element could be an HTMLEntity, a regular object, a query string or a regular Array of entities
	 * @param {String} event the string defining the event
	 * @param {EventListenerOrEventListenerObject} callback where to call
	 */
	bind = Bind;

	/**
	 * Unbinds an event in an object (similar to jQuery.unbind)
	 * @param {Object} element could be an HTMLEntity or a regular object
	 * @param {String} event the string defining the event
	 * @param {EventListenerOrEventListenerObject} callback where to call
	 */
	unbind = Unbind;

	/**
	 * Removes a class
	 * @param {HTMLElement} elem
	 * @param {String} selector
	 * @param {String} className
	 */
	removeClass = RemoveClass;

	/**
	 * Appends litegui widget to the global interface
	 * @param {LiteGUIObject | HTMLElement} element
	 */
	add(element: LiteGUIObject | HTMLElement): void
	{
		this.content?.appendChild("root" in element ? element.root : element);
	}

	/**
	 * Remove from the interface, it is is an HTML element it is removed from its parent, if it is a widget the same.
	 * @param {string | LiteGUIObject | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>} element it also supports HTMLentity, selector string or Array of elements
	 */
	remove = RemoveElement;

	/**
	 * Wrapper of document.getElementById
	 * @param {String} id
	 * return {HTMLEntity}
	 *
	 */
	getById = GetById;

	/**
	 * Creates and attaches the main application menubar.
	 */
	createMenubar(): void
	{
		this.menubar = new Menubar("mainmenubar");
		this.add(this.menubar);
	}

	/**
	 * Sets the size of the main window.
	 * @param {number} [w] Width in pixels.
	 * @param {number} [h] Height in pixels.
	 */
	setWindowSize(w?: number, h?: number): void
	{
		const style = this.root?.style;

		if (w && h)
		{
			style!.width = w + "px";
			style!.height = h + "px";
			style!.boxShadow = "0 0 4px black";
			this.root?.classList.remove("fullscreen");
		}
		else
		{
			if (this.root?.classList.contains("fullscreen")) { return; }
			this.root?.classList.add("fullscreen");
			style!.width = "100%";
			style!.height = "100%";
			style!.boxShadow = "0 0 0";
		}
		if (this.root)
		{
			this.trigger(this.root, "resized", undefined);
		}
	}

	/**
	 * Maximizes the window to fill the container.
	 */
	maximizeWindow(): void
	{
		this.setWindowSize(undefined, undefined);
	}

	/**
	 * Change cursor style of the root element.
	 * @param {string} name CSS cursor property value.
	 */
	setCursor(name: string): void
	{
		if (this.root) { this.root.style.cursor = name; }
	}

	/**
	 * Test if the cursor is inside an element
	 * @param {MouseEvent} event
	 * @param {HTMLElement} element
	 *
	 */
	isCursorOverElement = IsCursorOverElement;

	/**
	 * Returns the bounding client rect of an element.
	 * @param {HTMLElement} element The element to measure.
	 * @returns {DOMRect} The bounding rectangle.
	 */
	getRect = GetRect;

	/**
	 * Copy a string to the clipboard (it needs to be invoqued from a click event)
	 * @param {String | Record<string, unknown>} data
	 */
	toClipboard = ToClipboard;

	/**
	 * Insert some CSS code to the website
	 * @param {String|CSSStyleDeclaration} code it could be a string with CSS rules, or an object with the style syntax.
	 *
	 */
	addCSS = AddCSS;

	/**
	 * Requires a new CSS
	 * @param {String} url string with url or an array with several urls
	 * @param {Function} onComplete
	 *
	 */
	requireCSS = RequireCSS;

	/**
	 * Request file from url (it could be a binary, text, etc.). If you want a simplied version use
	 * @param {RequestOptions} request object with all the parameters like data (for sending forms), dataType, success, error
	 */
	request = Request;

	/**
	 * Request file from url
	 * @param {String} url
	 * @param {(data: string, xhr: XMLHttpRequest) => void} onComplete
	 * @param {(err: string | ProgressEvent<EventTarget>) => void} onError
	 *
	 */
	requestText = RequestText;

	/**
	 * Request file from url
	 * @param {String} url
	 * @param {(data: object, xhr: XMLHttpRequest) => void} onComplete
	 * @param {(err: string | ProgressEvent<EventTarget>) => void} onError
	 *
	 */
	requestJSON = RequestJSON;

	/**
	 * Request binary file from url
	 * @param {String} url
	 * @param {(data: ArrayBuffer | unknown, xhr: XMLHttpRequest) => void} onComplete
	 * @param {(err: string | ProgressEvent<EventTarget>) => void} onError
	 *
	 */
	requestBinary = RequestBinary;


	/**
	 * Request script and inserts it in the DOM
	 * @param {String|Array} url the url of the script or an array containing several urls
	 * @param {(scripts: Array<CoreScriptElement>) => void} onComplete
	 * @param {(err: string | Event, src: string, num: number) => void} onError
	 * @param {(src: string, num: number) => void} onProgress (if several files are required, onProgress is called after every file is added to the DOM)
	 *
	 */
	requireScript = RequireScript;


	/**
	 * Loads scripts sequentially from a list of URLs.
	 * @param {string | string[]} url Single URL or array of URLs to load.
	 * @param {(loadedScripts: GlobalEventHandlers[]) => void} onComplete Callback when all scripts are loaded.
	 * @param {(url: string, remaining: number) => void} onProgress Callback for progress updates.
	 */
	requireScriptSerial = RequireScriptSerial;

	/**
	 * Creates a new div element with specified ID and code.
	 * @param {string} id
	 * @param {string} code Inner HTML content.
	 * @returns {HTMLElement} The created div.
	 */
	newDiv(id: string, code: string)
	{
		return this.createElement("div", id, code, undefined, undefined);
	}

	/**
	 * Creates an HTML element
	 * @param {String} tag
	 * @param {String} classID string containing id and classes, example: "myid .someclass .anotherclass"
	 * @param {String} content
	 * @param {string | CSSStyleDeclaration} [style]
	 * @param {EventListenerOrEventListenerObject[]} [events]
	 */
	createElement = CreateElement;

	/**
	 * Useful to create elements from a text like '<div><span class="title"></span></div>' and an object like { ".title":"mytitle" }
	 * @param {String} code
	 * @param {Record<string, string>} values it will use innerText in the elements that matches that selector
	 * @param {CSSStyleDeclaration} style
	 * @return {HTMLElement}
	 *
	 */
	createListItem = CreateListItem;

	/**
	 * Creates a button element
	 * @param {String} classID ID or class
	 * @param {String} content
	 * @param {(ev: PointerEvent) => void} callback when the button is pressed
	 * @param {CSSStyleDeclaration|String} style
	 *
	 */
	createButton = CreateButton;

	/**
	 * Retrieves all parent elements of the given element up to the document root.
	 * @param {HTMLElement} element The starting element.
	 * @returns {HTMLElement[]} Array of parent elements.
	 */
	getParents = GetParents;

	/**
	 * Opens a new window with copied styles and optional scripts.
	 * @param {string} title syntax title for the new window.
	 * @param {number} width Width of the window.
	 * @param {number} height Height of the window.
	 * @param {{ scripts?: boolean, content?: string }} [options] Configuration object.
	 * @param {boolean} [options.scripts] Whether to copy scripts to the new window.
	 * @param {string} [options.content] HTML content to inject into the new window.
	 * @returns {Window} The newly created window object.
	 */
	newWindow = NewWindow;

	//* DIALOGS *******************

	/**
	 * Shows or hides the modal background overlay.
	 * @param {boolean} value True to show, false to hide.
	 */
	showModalBackground(value: boolean)
	{
		if (this.modalBackground)
		{
			this.modalBackground.style.display = value ? "block" : "none";
		}
	}

	/**
	 * Shows a generic message dialog.
	 * @param {string} content The message content.
	 * @param {DialogOptions} [options] Configuration options.
	 * @returns {Dialog} The created Dialog instance.
	 */
	showMessage = ShowMessage;

	/**
	 * Shows a dialog with a message
	 * @param {String} content
	 * @param {DialogOptions} [options]
	 * @returns {Dialog}
	 */
	popup = PopupDialog;

	/**
	 * Shows an alert dialog with a message
	 * @param {String} content
	 * @param {MessageOptions} [options]
	 * @returns {Dialog}
	 */
	alert = AlertDialog;

	/**
	 * Shows a confirm dialog with a message
	 * @param {String} content
	 * @param {(value: boolean) => void} callback
	 * @param {MessageOptions} [options]
	 * @returns {Dialog}
	 */
	confirm = ConfirmDialog;

	/**
	 * Shows a prompt dialog with a message
	 * @param {String} content
	 * @param {(value?: string) => void} callback
	 * @param {MessageOptions} [options]
	 * @returns {Dialog}
	 */
	prompt = PromptDialog;

	/**
	 * Shows a choice dialog with a message
	 * @param {String} content
	 * @param {Array<string|ContentHolder>} choices
	 * @param {(value: string | ContentHolder) => void} callback
	 * @param {MessageOptions} [options]
	 * @returns {Dialog}
	 */
	choice = ChoiceDialog;

	/**
	 * Triggers a download of the resource at the specified URL.
	 * @param {string} url The URL of the resource to download.
	 * @param {string} filename The name to save the file as.
	 */
	downloadURL = DownloadURL;

	/**
	 * Triggers a download of a File or Blob object.
	 * @param {string} filename The name to save the file as.
	 * @param {File | Blob} data The file data.
	 * @param {string} dataType MIME type of the data if not specified in the Blob.
	 */
	downloadFile = DownloadFile;

	/**
	 * Returns the URL vars ( ?foo=faa&foo2=etc )
	 *
	 */
	getUrlVars = GetUrlVars;

	/**
	 * Retrieves a specific query parameter from the URL.
	 * @param {string} name The name of the parameter.
	 * @returns {string} The value of the parameter.
	 */
	getUrlVar = GetUrlVar;

	/**
	 * Focuses an element.
	 * @param {HTMLElement | Window} element The element to focus.
	 */
	focus = FocusElement;

	/**
	 * Blurs an element.
	 * @param {HTMLElement | Window} element The element to blur.
	 */
	blur = BlurElement;

	/**
	 * Makes one element draggable
	 * @param {HTMLElement} container the element that will be dragged
	 * @param {HTMLElement} dragger the area to start the dragging
	 * @param {(container: HTMLElement, e: MouseEvent) => void} onStart Callback when the dragging starts.
	 * @param {(container: HTMLElement, e: MouseEvent) => void} onFinish Callback when the dragging finishes.
	 * @param {(container: HTMLElement, e: MouseEvent) => boolean} onIsDraggable Callback to determine if the element is currently draggable.
	 */
	draggable = Draggable;

	/**
	 * Clones object content
	 * @param {Object} source
	 * @param {Object} target
	 *
	 */
	cloneObject = CloneObject;

	/**
	 * Removing spaces and dots from a string.
	 * @param {string} str The input string.
	 * @returns {string} The sanitized string.
	 */
	safeName = SafeName;

	/**
	 * Encodes an HTML string by replacing special characters with unicode.
	 * @param {string} htmlCode The HTML string to encode.
	 * @returns {string} The encoded string (text content).
	 */
	htmlEncode = HTMLEncode;

	/**
	 * Decodes a unicode string back to HTML.
	 * @param {string} unicodeCharacter The string to decode.
	 * @returns {string} The decoded HTML string.
	 */
	htmlDecode = HTMLDecode;

	/**
	 * Convert sizes in any format to a valid CSS format (number to string, negative number to calc( 100% - number px )
	 * @param {string|Number} value
	 * @return {string|undefined} valid css size string
	 *
	 */
	sizeToCSS = SizeToCSS;

	/**
	 * Returns the window where this element is attached (used in multi window applications)
	 * @param {HTMLElement} element
	 * @return {Window} the window element
	 *
	 */
	getElementWindow = GetElementWindow;

	/**
	 * Helper, makes drag and drop easier by enabling drag and drop in a given element
	 * @param {HTMLElement} element the element where users could drop items
	 * @param {(evt: DragEvent) => boolean} onDrop function to call when the user drops the item
	 * @param {(evt: DragEvent, element: HTMLElement) => void} onEnter [optional] function to call when the user drags something inside
	 * @param {(evt: DragEvent, element: HTMLElement) => void} onExit [optional] function to call when the user drags something outside
	 *
	 */
	createDropArea = CreateDropArea;
}

// Low quality templating system
Object.defineProperty(String.prototype, "template", {
	value: function (data: object, evalCode: string)
	{
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let tpl = this;
		const re = /{{([^}}]+)?}}/g;
		let match;
		while (match)
		{
			const str = evalCode ? (new Function(`with(this) { try { return ${match[1]} } catch(e) { return 'error';} }`)).call(data) : data[match[1] as keyof object];
			tpl = tpl.replace(match[0], str);
			match = re.exec(tpl);
		}
		return tpl;
	},
	enumerable: false
});

export const LiteGUI = new Core();