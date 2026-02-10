import { LiteGUIObject } from "./@types/globals";

export interface ConsoleOptions
{
	prompt: string;
}

export interface ConsoleElement extends HTMLElement
{
	update?: (v: string) => void;
}

export class Console implements LiteGUIObject
{
	options: ConsoleOptions;
	root: HTMLDivElement;
	logElement: Element;
	input: HTMLInputElement;
	history: string[];
	private _prompt: string;
	private _historyOffset: number;
	private _inputBlocked?: boolean;

	constructor(options: ConsoleOptions)
	{
		options = options ?? { prompt: ">" };
		options.prompt = options.prompt ?? ">";
		this.options = options;

		this.root = document.createElement("div");
		this.root.className = "liteconsole";
		this.root.innerHTML = "<div class='log'></div><div class='foot'><input type='text'/></div>";

		this.logElement = this.root.querySelector('.log')!;
		this.input = this.root.querySelector('input')!;

		this.input?.addEventListener("keydown", this.processKeyDown.bind(this));
		this._prompt = this.options.prompt;

		this.history = [];
		this._historyOffset = 0;
	}

	processKeyDown(e: KeyboardEvent)
	{
		if (this._inputBlocked || !this.input) { return; }

		switch (e.key)
		{
		case "Enter":
		{
			const value = this.input.value;
			const cmd = value.trim();
			this.addMessage(this._prompt + cmd, "me", true);
			this.input.value = "";
			this.history.push(cmd);
			if (this.history.length > 10) { this.history.shift(); }
			this.onProcessCommand(cmd);
			this._historyOffset = 0;
			break;
		}
		// Up & down history
		case "ArrowUp":
		case "ArrowDown":
		{
			this._historyOffset += (e.key == "ArrowUp" ? -1 : 1);
			if (this._historyOffset > 0)
			{
				this._historyOffset = 0;
			}
			else if (this._historyOffset < -this.history.length)
			{
				this._historyOffset = -this.history.length;
			}
			const pos = this.history.length + this._historyOffset;
			if (pos < 0) { return; }
			if (pos >= this.history.length)
			{
				this.input.value = "";
			}
			else
			{
				this.input.value = this.history[pos];
			}
			break;
		}
		// Tab autocompletion
		case "Tab":
		{
			this.input.value = this.onAutocomplete(this.input.value);
			break;
		}
		/* Falls through */
		default:
		{
			return;
		}
		}
		e.preventDefault();
		e.stopPropagation();
	}

	addMessage(text: string | string[], className: string, asText: boolean = true)
	{
		const content = this.logElement;
		// Contains the last message sent
		let element: ConsoleElement | null = null;

		function add(txt: string)
		{
			element = document.createElement("pre") as ConsoleElement;
			if (asText)
			{
				element.innerText = txt;
			}
			else
			{
				element.innerHTML = txt;
			}
			element.className = "msg";
			if (className)
			{
				element.className += " " + className;
			}
			content.appendChild(element);
			if (content.children.length > 1000)
			{
				content.removeChild(content.children[0]);
			}
		}

		if (Array.isArray(text))
		{
			for (let i = 0; i < text.length; ++i)
			{
				add(text[i]);
			}
		}
		else if (typeof text !== "string")
		{
			add(JSON.stringify(text, null, ""));
		}
		else
		{
			add(text);
		}

		this.logElement.scrollTop = 1000000;

		if (!element) { return; }

		(element as ConsoleElement).update = (function (this: ConsoleElement, v: string)
		{
			this.innerHTML = v;
		}).bind(element);

		return element;
	}

	log(...args: unknown[])
	{
		const d = args.join(",");
		return this.addMessage(d, "msglog");
	}

	warn(...args: unknown[])
	{
		const d = args.join(",");
		return this.addMessage(d, "msgwarn");
	}

	error(...args: unknown[])
	{
		const d = args.join(",");
		return this.addMessage(d, "msgerror");
	}

	clear()
	{
		if (this.logElement)
		{
			this.logElement.innerHTML = "";
		}
	}

	// TODO: Implement autocomplete
	onAutocomplete(value: string)
	{
		// This wasn't declared, just used so...

		// The function is supposed to return something so I will return the same parameter
		return value;
	}

	// TODO: Implement command processing
	onProcessCommand(cmd: string): void
	{
		// This wasn't declared, just used so...
		console.log(cmd);
	}
}