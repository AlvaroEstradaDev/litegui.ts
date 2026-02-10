import { LiteGUIObject } from "./@types/globals";
import { CoreDocument } from "./utilities";
import { LiteGUI, SpecialCode } from "./core";

/**
 * Options for a button in the dialog.
 */
export interface DialogButtonOptions
{
	/**
	 * Text to display on the button.
	 */
	name?: string;
	/**
	 * CSS class to add to the button.
	 */
	className?: string;
	/**
	 * Callback function to execute when the button is clicked.
	 */
	callback?: (button: HTMLButtonElement) => void;
	/**
	 * Whether clicking the button should close the dialog.
	 */
	close?: boolean;
}

/**
 * Configuration options for the Dialog.
 */
export interface DialogOptions
{
	/**
	 * Parent element to attach the dialog to.
	 */
	parent?: string | HTMLDivElement;
	/**
	 * Whether to attach the dialog to the DOM immediately.
	 */
	attach?: boolean;
	/**
	 * Whether the content should be scrollable.
	 */
	scroll?: boolean;
	/**
	 * Array of buttons to show in the footer.
	 */
	buttons?: DialogButtonOptions[];
	/**
	 * Whether the content should take the full height of the dialog.
	 */
	fullContent?: boolean;
	/**
	 * Whether the dialog can be closed.
	 */
	closable?: boolean;
	/**
	 * The type of animation to use when closing the dialog.
	 */
	close?: string;
	/**
	 * Whether the dialog can be detached to a new window.
	 */
	detachable?: boolean;
	/**
	 * Whether to show the hide button.
	 */
	hide?: boolean;
	/**
	 * Whether to show the minimize button.
	 */
	minimize?: boolean;
	/**
	 * Title of the dialog.
	 */
	title?: string;
	/**
	 * CSS class to add to the dialog.
	 */
	className?: string;
	/**
	 * HTML content of the dialog.
	 */
	content?: string;
	/**
	 * Minimum height of the dialog.
	 */
	minHeight?: number | number;
	/**
	 * Minimum width of the dialog.
	 */
	minWidth?: number | number;
	/**
	 * Height of the dialog.
	 */
	height?: string | number;
	/**
	 * Width of the dialog.
	 */
	width?: string | number;
	/**
	 * Unique identifier for the dialog element.
	 */
	id?: string;
	/**
	 * Whether the dialog is resizable.
	 */
	resizable?: boolean;
	/**
	 * Whether the dialog is draggable.
	 */
	draggable?: boolean;
	/**
	 * Callback function to execute when the dialog is closed.
	 */
	onClose?: () => void;
}

/**
 * Interface extending HTMLDivElement to include a reference to the Dialog instance.
 */
export interface DialogRoot extends HTMLDivElement
{
	/**
	 * Reference to the document.
	 */
	ownerDocument: CoreDocument;
	/**
	 * Reference to the Dialog instance associated with this element.
	 */
	dialog: Dialog;
	/**
	 * Unique identifier for the dialog element.
	 */
	id: string;
}

export type DockType = 'full' | 'left' | 'right' | 'bottom' | 'top';

/**
 * Class representing a Dialog window.
 *
 * @example
 * ```typescript
 * const dialog = new LiteGUI.Dialog({ title: "My Dialog", width: 400, height: 300 });
 * dialog.show();
 * ```
 */
export class Dialog implements LiteGUIObject
{
	/**
	 * Width of the dialog.
	 */
	width?: string | number;
	/**
	 * Height of the dialog.
	 */
	height?: string | number;
	/**
	 * Minimum width of the dialog.
	 */
	minWidth?: number;
	/**
	 * Minimum height of the dialog.
	 */
	minHeight?: number;
	/**
	 * The content element of the dialog.
	 */
	content!: HTMLDivElement;
	/**
	 * The root element of the dialog.
	 */
	root: DialogRoot;
	/**
	 * The footer element of the dialog.
	 */
	footer?: HTMLDivElement;
	/**
	 * The header element of the dialog.
	 */
	header?: HTMLDivElement;
	/**
	 * Whether the dialog is resizable.
	 */
	resizable: boolean = false;
	/**
	 * Whether the dialog is draggable.
	 */
	draggable: boolean = false;
	/**
	 * Callback triggered when the dialog is resized.
	 */
	onResize?: (evt?: MouseEvent, width?: number, height?: number) => void;
	/**
	 * Callback triggered when the dialog is closed.
	 */
	onClose?: () => void;
	/**
	 * Callback triggered when the dialog is attached to the DOM.
	 */
	onAttachedToDOM?: () => void;
	/**
	 * Callback triggered when the dialog is detached from the DOM.
	 */
	onDetachedFromDOM?: () => void;

	/**
	 * Reference to the detached window.
	 * @private
	 */
	private _dialogWindow?: Window;
	/**
	 * List of minimized dialogs.
	 * @private
	 */
	private _minimized: Dialog[] = [];
	/**
	 * Whether the window is detached.
	 * @private
	 */
	private _isWindowDetached?: boolean;
	/**
	 * Stores the old client rect before minimizing or maximizing.
	 * @private
	 */
	private _oldBox?: DOMRect;
	/**
	 * Stores the old height before detaching.
	 * @private
	 */
	private _oldHeight?: string;
	/**
	 * Default height of the dialog title.
	 */
	public static TITLE_HEIGHT: string = "20px";
	/**
	 * Width of the dialog when minimized.
	 */
	public static MINIMIZED_WIDTH = 200;

	/**
	 * Creates an instance of the Dialog.
	 * @param {DialogOptions | string} [options] Configuration options or the ID of the dialog.
	 */
	constructor(options?: DialogOptions | string)
	{
		if (typeof options == 'string')
		{
			const id = options;
			options = { id: id };
		}
		options = options ?? {};

		this.root = <DialogRoot>document.createElement("div");
		this.width = options.width;
		this.height = options.height;
		this.minWidth = options.minWidth ?? 150;
		this.minHeight = options.minHeight ?? 100;

		const root = <DialogRoot>document.createElement("div");
		if (options.id) { root.id = options.id; }

		root.className = `litedialog ${options.className ?? ""}`;
		root.dialog = this;

		let code = "";
		if (options.title)
		{
			code += `<div class='panel-header'>${options.title}</div><div class='buttons'>`;
			if (options.minimize)
			{
				code += "<button class='litebutton mini-button minimize-button'>-</button>";
				code += "<button class='litebutton mini-button maximize-button' style='display:none'></button>";
			}
			if (options.hide) { code += "<button class='litebutton mini-button hide-button'></button>"; }
			if (options.detachable) { code += "<button class='litebutton mini-button detach-button'></button>"; }

			if (options.close || options.closable)
			{
				code += `<button class='litebutton mini-button close-button'>${SpecialCode.close}</button>`;
			}
			code += "</div>";
		}
		code += `<div class='content'>${options.content ?? ""}</div>`;
		code += "<div class='panel-footer'></div>";
		root.innerHTML = code;

		this.root = root;
		this.header = root.querySelector(".panel-header") as HTMLDivElement;
		this.content = root.querySelector(".content") as HTMLDivElement;
		this.footer = root.querySelector(".panel-footer") as HTMLDivElement;

		if (options.fullContent)
		{
			this.content.style.width = "100%";
			this.content.style.height = options.title ? `calc( 100% - ${Dialog.TITLE_HEIGHT} )` : "100%";
		}

		if (options.buttons)
		{
			for (const button of options.buttons)
			{
				this.addButton(button.name, button);
			}
		}

		if (options.scroll == true) { this.content!.style.overflow = "auto"; }

		// Buttons *********************************
		const closeButton = root.querySelector(".close-button");
		if (closeButton)
		{
			closeButton.addEventListener("click", this.close.bind(this));
		}

		const maximizeButton = root.querySelector(".maximize-button");
		if (maximizeButton)
		{
			maximizeButton.addEventListener("click", this.maximize.bind(this));
		}

		const minimizeButton = root.querySelector(".minimize-button");
		minimizeButton?.addEventListener("click", this.minimize.bind(this));

		const hideButton = root.querySelector(".hide-button");
		hideButton?.addEventListener("click", this.hide.bind(this));

		const detachButton = root.querySelector(".detach-button");
		detachButton?.addEventListener("click", () => { this.detachWindow(undefined, undefined); });

		// Size, draggable, resizable, etc
		this.enableProperties(options);

		this.root.addEventListener("DOMNodeInsertedIntoDocument", () =>
		{
			if (this.onAttachedToDOM) { this.onAttachedToDOM(); }
			if (this.onResize) { this.onResize(); }
		});
		this.root.addEventListener("DOMNodeRemovedFromDocument", () =>
		{
			if (this.onDetachedFromDOM)
			{
				this.onDetachedFromDOM();
			}
		});


		// Attach
		if (options.attach || options.parent)
		{
			let parent = null;
			if (options.parent)
			{
				parent = typeof (options.parent) == "string" ?
					document.querySelector(options.parent) : options.parent;
			}
			if (!parent) { parent = LiteGUI.root; }
			parent?.appendChild(this.root);
			this.center();
		}
	}

	/**
	 * Get a dialog from the document by its ID.
	 * @param {string} id The unique identifier of the dialog.
	 * @returns {Dialog | undefined} The dialog instance if found, otherwise undefined.
	 */
	getDialog(id: string)
	{
		const element = <DialogRoot>document.getElementById(id);
		if (!element) { return; }
		return element.dialog;
	}

	/**
	 * Add widget or HTML element to the content of the dialog.
	 * @param {LiteGUIObject} item The item to add.
	 */
	add(item: LiteGUIObject)
	{
		if (item.root)
		{
			this.content?.appendChild(item.root);
		}
	}

	/**
	 * Enables the properties of the dialog (draggable, resizable, etc).
	 * @param {DialogOptions} [options] Configuration options to enable specific properties.
	 */
	enableProperties(options?: DialogOptions)
	{
		options = options ?? {};

		const panel = this.root;
		panel.style.position = "absolute";
		// Panel.style.display = "none";

		panel.style.minWidth = this.minWidth + "px";
		panel.style.minHeight = this.minHeight + "px";

		if (this.width) { panel.style.width = this.width + "px"; }

		if (this.height)
		{
			if (typeof (this.height) == "number")
			{
				panel.style.height = this.height + "px";
			}
			else if (this.height.indexOf("%") != -1)
			{
				panel.style.height = this.height;
			}

			this.content.style.height = "calc( " + this.height + "px - 24px )";
		}

		panel.style.boxShadow = "0 0 3px black";

		if (options.draggable)
		{
			this.draggable = true;
			const element = panel.querySelector(".panel-header") as HTMLElement | null;
			if (element)
			{
				LiteGUI.draggable(panel, element, () =>
				{
					this.bringToFront();
				}, () => { }, () =>
				{
					return !this._minimized.includes(this);
				});
			}
		}

		if (options.resizable)
		{ this.setResizable(); }
	}

	/**
	 * Sets the dialog as resizable.
	 */
	setResizable()
	{
		if (this.resizable) { return; }

		const root = this.root;
		this.resizable = true;
		const footer = this.footer;
		if (footer)
		{
			footer.style.minHeight = "4px";
			footer.classList.add("resizable");
		}

		const corner = document.createElement("div");
		corner.className = "resizable-corner";
		this.root?.appendChild(corner);

		const mouse = [0, 0];
		let isCorner = false;

		const _onMouse = (e: MouseEvent) =>
		{
			const el = e.target;
			if (e.type == "mousedown")
			{
				document.body.addEventListener("mousemove", _onMouse);
				document.body.addEventListener("mouseup", _onMouse);
				isCorner = el == corner;
				mouse[0] = e.pageX;
				mouse[1] = e.pageY;
			}
			else if (e.type == "mousemove")
			{
				const rect = LiteGUI.getRect(root);
				const w = rect.width;
				const newW = w - (mouse[0] - e.pageX);

				const h = rect.height;
				const newH = h - (mouse[1] - e.pageY);

				if (isCorner) { root.style.width = newW + "px"; }
				root.style.height = newH + "px";

				mouse[0] = e.pageX;
				mouse[1] = e.pageY;
				this.content.style.height = "calc( 100% - 24px )";

				if (this.onResize && (w != newW || h != newH))
				{
					this.onResize(e, newW, newH);
				}
			}
			else if (e.type == "mouseup")
			{
				document.body.removeEventListener("mousemove", _onMouse);
				document.body.removeEventListener("mouseup", _onMouse);
				isCorner = false;
			}
			e.preventDefault();
			e.stopPropagation();
			return false;
		};

		footer?.addEventListener("mousedown", _onMouse);
		corner.addEventListener("mousedown", _onMouse, true);
	}

	/**
	 * Docks the dialog to the parent.
	 * @param {LiteGUIObject | HTMLElement | string} parent The parent element to dock to.
	 * @param {DockType} [dockType] The docking type (full, left, right, bottom, top).
	 * @param {string | number} [titleHeight] The height of the title bar to adjust content height.
	 */
	dockTo(parent?: LiteGUIObject | HTMLElement | string, dockType?: DockType, titleHeight?: string | number)
	{
		if (parent == undefined) { return; }

		dockType = dockType ?? "full";

		const panel = this.root;
		panel.style.top = "0";
		panel.style.left = "0";

		panel.style.boxShadow = "0 0 0";

		if (dockType == "full")
		{
			panel.style.position = "relative";
			panel.style.width = "100%";
			panel.style.height = "100%";
			this.content.style.width = "100%";
			this.content.style.height = "calc(100% - " + (titleHeight ?? LiteGUI.Panel.TITLE_HEIGHT) + ")"; // Title offset: 20px
			this.content.style.overflow = "auto";
		}
		else if (dockType == 'left' || dockType == 'right')
		{
			panel.style.position = "absolute";
			panel.style.top = "0";
			panel.style[dockType] = "0";

			panel.style.width = this.width + "px";
			panel.style.height = "100%";
			this.content.style.height = "calc(100% - " + (titleHeight ?? LiteGUI.Panel.TITLE_HEIGHT) + ")";
			this.content.style.overflow = "auto";

			if (dockType == 'right')
			{
				panel.style.left = "auto";
				panel.style.right = "0";
			}
		}
		else if (dockType == 'bottom' || dockType == 'top')
		{
			panel.style.width = "100%";
			panel.style.height = this.height + "px";
			if (dockType == 'bottom')
			{
				panel.style.bottom = "0";
				panel.style.top = "auto";
			}
		}

		if (this.draggable)
		{
			LiteGUI.draggable(panel);
		}

		if (typeof (parent) == "string")
		{
			const parentElem = document.querySelector<HTMLElement>(parent);
			if (parentElem)
			{
				parentElem.appendChild(panel);
			}
		}
		else if (parent && "content" in parent)
		{
			(parent as { content: HTMLElement }).content.appendChild(panel);
		}
		else if (parent && "root" in parent)
		{
			(parent as { root: HTMLElement }).root.appendChild(panel);
		}
		else if (parent && "appendChild" in parent)
		{
			(parent as HTMLElement).appendChild(panel);
		}
	}

	/**
	 * Adds a button to the dialog.
	 * @param {string} [name] The text to display on the button.
	 * @param {DialogButtonOptions | Function} [options] Options for the button or a callback function.
	 * @returns {HTMLButtonElement} The created button element.
	 */
	addButton(name?: string, options?: DialogButtonOptions |
		((button: HTMLButtonElement) => void))
	{
		if (options == undefined)
		{
			options = {} as DialogButtonOptions;
		}

		if (options.constructor === Function)
		{
			options = { callback: options } as DialogButtonOptions;
		}

		const buttonOptions = options as DialogButtonOptions;
		const button = document.createElement("button");
		button.className = "litebutton";

		if (name != undefined) { button.innerHTML = name; }
		if (typeof buttonOptions.className == 'string')
		{
			button.className += " " + buttonOptions.className;
		}

		this.root?.querySelector(".panel-footer")!.appendChild(button);

		const buttonCallback = () =>
		{
			if (buttonOptions.callback)
			{
				buttonOptions.callback(button);
			}

			if (buttonOptions.close)
			{
				this.close();
			}
		};
		button.addEventListener("click", buttonCallback.bind(button));

		return button;
	}

	/**
	 * Destroys the dialog.
	 */
	close()
	{
		LiteGUI.remove(this.root);
		LiteGUI.trigger(this.root, "closed", this);
		if (this.onClose) { this.onClose(); }
		if (this._dialogWindow)
		{
			this._dialogWindow.close();
			this._dialogWindow = undefined;
		}
	}

	/**
	 * Highlights the dialog.
	 * @param {number} [delay] The duration of the highlight in milliseconds.
	 */
	highlight(delay: number = 100)
	{
		this.root.style.outline = "1px solid white";
		const doc = this.root.ownerDocument;
		const w = doc.defaultView ?? doc.parentWindow;
		w?.focus();
		setTimeout((() =>
		{
			this.root.style.outline = null!;
		}), delay);
	}

	/**
	 * Minimizes the dialog.
	 */
	minimize()
	{
		if (this._minimized.length) { return; }

		/* This.minimized = true; */
		this._oldBox = this.root?.getBoundingClientRect();

		if (!(this.root.querySelector(".content") as HTMLElement)) { return; }
		(this.root.querySelector(".content") as HTMLElement).style.display = "none";

		const minimizeButton = this.root.querySelector(".minimize-button") as HTMLElement;
		if (minimizeButton) { minimizeButton.style.display = "none"; }

		const maximizeButton = this.root.querySelector(".maximize-button") as HTMLElement;
		if (maximizeButton) { maximizeButton.style.display = ""; }

		this.root.style.width = LiteGUI.Dialog.MINIMIZED_WIDTH + "px";

		const closeCallback = (_e: Event): void =>
		{
			const el = _e.target as unknown as Dialog;
			this._minimized.splice(this._minimized.indexOf(el), 1);
			this.arrangeMinimized();
		};
		LiteGUI.bind(this.root, "closed", closeCallback);

		this._minimized.push(this);
		this.arrangeMinimized();


		LiteGUI.trigger(this.root, "minimizing");
	}

	/**
	 * Arranges the minimized dialogs.
	 */
	arrangeMinimized()
	{
		for (const i in this._minimized)
		{
			const dialog = this._minimized[i];
			const parent = dialog.root.parentNode as Element;
			const pos = (parent?.getBoundingClientRect().height ?? 20) - 20;
			dialog.root.style.left = (LiteGUI.Dialog.MINIMIZED_WIDTH * parseInt(i)).toString();
			dialog.root.style.top = pos + "px";
		}
	}

	/**
	 * Maximizes the dialog.
	 */
	maximize()
	{
		if (this._minimized.length == 0) { return; }
		this._minimized = [];

		this.content.style.display = "";
		LiteGUI.draggable(this.root);
		if (this._oldBox)
		{
			this.root.style.left = this._oldBox.left + "px";
			this.root.style.top = this._oldBox.top + "px";
			this.root.style.width = this._oldBox.width + "px";
			this.root.style.height = this._oldBox.height + "px";
		}

		const minimizeButton = this.root.querySelector(".minimize-button") as HTMLElement;
		if (minimizeButton) { minimizeButton.style.display = ""; }

		const maximizeButton = this.root.querySelector(".maximize-button") as HTMLElement;
		if (maximizeButton) { maximizeButton.style.display = "none"; }

		this._minimized.splice(this._minimized.indexOf(this), 1);
		this.arrangeMinimized();
		LiteGUI.trigger(this.root, "maximizing");
	}

	/**
	 * Makes the dialog modal.
	 */
	makeModal()
	{
		LiteGUI.showModalBackground(true);
		LiteGUI.modalBackground?.appendChild(this.root); // Add panel
		this.show();
		this.center();

		LiteGUI.bind(this.root, "closed", _onClosed);

		function _onClosed()
		{
			LiteGUI.showModalBackground(false);
		}
	}

	/**
	 * Brings the dialog to the front.
	 */
	bringToFront()
	{
		const parent = this.root.parentNode;
		if (parent)
		{
			parent.removeChild(this.root);
			parent.appendChild(this.root);
		}
	}

	/**
	 * Shows a hidden dialog.
	 * @param {CoreDocument} [ownerDocument] The document where the dialog should be shown.
	 */
	show(ownerDocument?: CoreDocument)
	{
		if (!this.root.parentNode)
		{
			if (!ownerDocument)
			{
				LiteGUI.add(this);
			}
			else
			{
				const doc = ownerDocument;
				const parent = doc.querySelector(".litegui-wrap") ?? doc.body;
				parent.appendChild(this.root);
				const w = doc.defaultView ?? doc.parentWindow;
				w!.focus();
			}
			this.center();
		}

		if (!this._isWindowDetached)
		{
			this.root.style.display = "";
			LiteGUI.trigger(this.root, "shown");
		}
	}

	/**
	 * Hides the dialog.
	 */
	hide()
	{
		this.root.style.display = "none";
		LiteGUI.trigger(this.root, "hidden");
	}

	/**
	 * Fades in the dialog.
	 * @param {number} [time=1000] Duration of the fade-in animation in milliseconds.
	 * @param {number} [delay=100] Delay before starting the animation in milliseconds.
	 */
	fadeIn(time: number = 1000, delay: number = 100)
	{
		this.root.style.display = "";
		this.root.style.opacity = "0";
		setTimeout(() =>
		{
			this.root.style.transition = `opacity ${time}ms`;
			this.root.style.opacity = "1";
		}, delay);
	}

	/**
	 * Sets the position of the dialog.
	 * @param {number} x The x coordinate.
	 * @param {number} y The y coordinate.
	 */
	setPosition(x: number, y: number)
	{
		if (!this.root.parentNode)
		{
			console.warn("LiteGUI.Dialog: Cannot set position of dialog if it is not in the DOM");
		}

		this.root.style.position = "absolute";
		this.root.style.left = x + "px";
		this.root.style.top = y + "px";
	}

	/**
	 * Sets the size of the dialog.
	 * @param {number} w The width.
	 * @param {number} h The height.
	 */
	setSize(w: number, h: number)
	{
		this.root.style.width = typeof (w) == "number" ? w + "px" : w;
		this.root.style.height = typeof (h) == "number" ? h + "px" : h;
	}

	/**
	 * Sets the title of the dialog.
	 * @param {string} text The new title.
	 */
	setTitle(text: string)
	{
		if (!this.header) { return; }
		this.header.innerHTML = text;
	}

	/**
	 * Centers the dialog on the web page.
	 */
	center()
	{
		if (!this.root.parentNode) { return; }

		this.root.style.position = "absolute";
		const width = this.root.offsetWidth;
		const height = this.root.offsetHeight;
		const parentNode = this.root.parentNode as HTMLElement;
		const parentWidth = parentNode.offsetWidth;
		const parentHeight = parentNode.offsetHeight;
		this.root.style.left = Math.floor((parentWidth - width) * 0.5) + "px";
		this.root.style.top = Math.floor((parentHeight - height) * 0.5) + "px";
	}

	/**
	 * Adjust the size of the dialog to the size of the content.
	 * @param {number} [margin=0] Additional margin to add.
	 * @param {boolean} [skipTimeout] Whether to skip the timeout wait.
	 */
	adjustSize(margin: number = 0, skipTimeout?: boolean)
	{
		this.content.style.height = "auto";

		if (this.content.offsetHeight == 0 && !skipTimeout) // Happens sometimes if the dialog is not yet visible
		{
			setTimeout(() => { this.adjustSize(margin, true); }, 1);
			return;
		}

		let extra = 0;
		const footer = this.root.querySelector(".panel-footer") as HTMLElement;
		if (footer) { extra += footer.offsetHeight; }

		const width = this.content.offsetWidth;
		const height = this.content.offsetHeight + 20 + margin + extra;

		this.setSize(width, height);
	}

	/**
	 * Clears the content of the dialog.
	 */
	clear()
	{
		this.content.innerHTML = "";
	}

	/**
	 * Detaches the window from the DOM.
	 * @param {() => void} [onComplete] Callback executed when detachment is complete.
	 * @param {() => void} [onClose] Callback executed when the new window is closed.
	 * @returns {Window | undefined} The created window object or undefined if failed.
	 */
	detachWindow(onComplete?: () => void, onClose?: () => void): Window | undefined
	{
		if (this._minimized.length > 0)
		{
			this.maximize();
		}
		if (this._dialogWindow)
		{
			return;
		}

		// Create window
		const rect = this.root!.getClientRects()[0];
		const w = rect.width;
		const h = rect.height;
		let title = "Window";
		if (this.header)
		{
			title = this.header.textContent ?? '';
		}

		const dialogWindow = window.open("", "", "width=" + w + ", height=" + h + ", location=no, status=no, menubar=no, titlebar=no, fullscreen=yes") as Window;
		dialogWindow.document.writeln("<head><title>" + title + "</title>");
		this._dialogWindow = dialogWindow;

		// Transfer style
		const styles = document.querySelectorAll("link[rel='stylesheet'],style");
		for (let i = 0; i < styles.length; i++)
		{ dialogWindow.document.writeln(styles[i].outerHTML); }
		dialogWindow.document.writeln("</head><body></body>");
		dialogWindow.document.close();

		// Closing event
		dialogWindow.onbeforeunload = function ()
		{
			const index = LiteGUI.windows.indexOf(dialogWindow);
			if (index != -1) { LiteGUI.windows.splice(index, 1); }
			if (onClose) { onClose(); }
		};

		// Move the content there
		dialogWindow.document.body.appendChild(this.content);
		this.root!.style.display = "none"; // Hide
		this._oldHeight = this.content.style.height;
		this.content.style.height = "100%";

		LiteGUI.windows.push(dialogWindow);

		if (onComplete) { onComplete(); }

		return dialogWindow;
	}

	/**
	 * Reattaches the window to the DOM.
	 * @param {() => void} [onComplete] Callback executed when reattachment is complete.
	 */
	reattachWindow(onComplete?: () => void)
	{
		if (!this._dialogWindow) { return; }

		this.root.appendChild(this.content);
		this.root.style.display = ""; // Show
		if (this._oldHeight)
		{
			this.content.style.height = this._oldHeight;
			this._oldHeight = undefined;
		}

		this._dialogWindow.close();
		const index = LiteGUI.windows.indexOf(this._dialogWindow);
		if (index != -1) { LiteGUI.windows.splice(index, 1); }
		this._dialogWindow = undefined;

		if (onComplete) { onComplete(); }
	}

	/**
	 * Shows all the dialogs.
	 */
	showAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as DialogRoot;
			dialog.dialog?.show();
		}
	}

	/**
	 * Hides all the dialogs.
	 */
	hideAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as DialogRoot;
			dialog.dialog?.hide();
		}
	}

	/**
	 * Closes all the dialogs.
	 */
	closeAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as DialogRoot;
			dialog.dialog?.close();
		}
	}
}