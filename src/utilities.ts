import { LiteGUIObject } from "./@types/globals";
import { Dialog, DialogOptions } from "./dialog";

/**
 * Removes event listeners (assigned as properties) and references from a DOM element and its children.
 * Used to help with garbage collection and memory leaks by breaking circular references.
 * @function PurgeElement
 * @param {HTMLElement} element The DOM element to purge.
 */
export function PurgeElement(element: HTMLElement)
{
	const a = element.attributes;
	let i, n;

	if (a)
	{
		for (i = a.length - 1; i >= 0; i -= 1)
		{
			n = a[i].name;
			if (typeof (element as unknown as Record<string, unknown>)[n] === 'function')
			{
				(element as unknown as Record<string, unknown | null>)[n] = null;
			}
		}
	}

	const b = element.childNodes;
	if (b)
	{
		const l = b.length;
		for (let i = 0; i < l; i += 1)
		{
			PurgeElement(b[i] as HTMLElement);
		}
	}
}

/**
 * Basic object cloner. Copies own enumerable properties from original to target.
 * @function CloneInsides
 * @param {{ [key: string]: unknown }} [original] The source object to clone from.
 * @param {{ [key: string]: unknown }} [target] The target object to copy to. If null, a new object is created.
 * @returns {{ [key: string]: unknown }} The target object with copied properties.
 */
export function CloneInsides(original?: Record<string, unknown>, target?: Record<string, unknown>): Record<string, unknown>
{
	target = target ?? {};
	for (const j in original)
	{
		target[j] = original[j];
	}
	return target;
}

/**
 * Focuses an element.
 * @function FocusElement
 * @param {HTMLElement | Window} element The element to focus.
 */
export function FocusElement(element: HTMLElement | Window)
{
	element.focus();
}

/**
 * Blurs an element.
 * @function BlurElement
 * @param {HTMLElement | Window} element The element to blur.
 */
export function BlurElement(element: HTMLElement | Window)
{
	element.blur();
}

/**
 * Interface to hold a reference to an object property and its options.
 */
export interface InstanceHolder
{
	/** The instance object containing the property. */
	instance: Record<string, unknown>;
	/** The name of the property. */
	name: string;
	/** Options associated with the property. */
	options?: Record<string, unknown>;
}

/**
 * Tries to assign a value to the instance stored in an instance holder
 * @function AssignValue
 * @param {InstanceHolder} holder The instance holder containing the instance and property name.
 * @param {string | null | unknown[] | unknown} value The value to assign.
 */
export function AssignValue(holder: InstanceHolder, value: string | null | unknown[] | unknown)
{
	const instance = holder.instance as Record<string, unknown>;
	const currentValue = instance[holder.name];

	if (currentValue == null || value == null || (holder.options as { type?: string })?.type == "enum")
	{
		instance[holder.name] = value;
	}
	else if (typeof (currentValue) == "number")
	{
		instance[holder.name] = parseFloat(value.toString());
	}
	else if (typeof (currentValue) == "string")
	{
		instance[holder.name] = value;
	}
	else if (value && (value as unknown[]).length && currentValue && (currentValue as unknown[]).length &&
		(!Object.getOwnPropertyDescriptor(instance, holder.name) ||
			!Object.getOwnPropertyDescriptor(instance, holder.name)?.set) &&
		(!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), holder.name) ||
			!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), holder.name)?.set))
	{
		for (let i = 0; i < (value as unknown[]).length; ++i)
		{
			(currentValue as unknown[])[i] = (value as unknown[])[i];
		}
	}
	else
	{
		instance[holder.name] = value;
	}
}

/**
 *  Extract all attributes from an instance (enumerable properties that are not function and a name starting with alphabetic character)
 *
 * @function CollectProperties
 * @param {unknown} instance extract enumerable and public (name do not start with '_' ) properties from an object
 * @returns {{[key:string]: unknown}} Object with "name" : value for every property
 *
 */
export function CollectProperties(instance: unknown): { [key: string]: unknown }
{
	const properties: { [key: string]: unknown } = {};
	const obj = instance as Record<string, unknown>;

	for (const i in obj)
	{
		// Skip vars with _ (they are private)
		if (i[0] == "_" || i[0] == "@" || i.substring(0, 6) == "jQuery")
		{
			continue;
		}

		const v = obj[i];
		const inst = instance as { constructor?: { [key: string]: unknown } };
		if (v && typeof v.constructor == "function" && !inst.constructor?.[`@${i}`])
		{
			continue;
		}
		properties[i] = v;
	}
	return properties;
}

// Useful functions

// From stackoverflow http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript

/**
 * Internal helper to escape HTML entities in a string.
 * Uses a mapping table for characters.
 */
const escapeHtmlEntityTable: Record<number, string> = {
	34: 'quot',
	38: 'amp',
	39: 'apos',
	60: 'lt',
	62: 'gt',
	160: 'nbsp',
	161: 'iexcl',
	162: 'cent',
	163: 'pound',
	164: 'curren',
	165: 'yen',
	166: 'brvbar',
	167: 'sect',
	168: 'uml',
	169: 'copy',
	170: 'ordf',
	171: 'laquo',
	172: 'not',
	173: 'shy',
	174: 'reg',
	175: 'macr',
	176: 'deg',
	177: 'plusmn',
	178: 'sup2',
	179: 'sup3',
	180: 'acute',
	181: 'micro',
	182: 'para',
	183: 'middot',
	184: 'cedil',
	185: 'sup1',
	186: 'ordm',
	187: 'raquo',
	188: 'frac14',
	189: 'frac12',
	190: 'frac34',
	191: 'iquest',
	192: 'Agrave',
	193: 'Aacute',
	194: 'Acirc',
	195: 'Atilde',
	196: 'Auml',
	197: 'Aring',
	198: 'AElig',
	199: 'Ccedil',
	200: 'Egrave',
	201: 'Eacute',
	202: 'Ecirc',
	203: 'Euml',
	204: 'Igrave',
	205: 'Iacute',
	206: 'Icirc',
	207: 'Iuml',
	208: 'ETH',
	209: 'Ntilde',
	210: 'Ograve',
	211: 'Oacute',
	212: 'Ocirc',
	213: 'Otilde',
	214: 'Ouml',
	215: 'times',
	216: 'Oslash',
	217: 'Ugrave',
	218: 'Uacute',
	219: 'Ucirc',
	220: 'Uuml',
	221: 'Yacute',
	222: 'THORN',
	223: 'szlig',
	224: 'agrave',
	225: 'aacute',
	226: 'acirc',
	227: 'atilde',
	228: 'auml',
	229: 'aring',
	230: 'aelig',
	231: 'ccedil',
	232: 'egrave',
	233: 'eacute',
	234: 'ecirc',
	235: 'euml',
	236: 'igrave',
	237: 'iacute',
	238: 'icirc',
	239: 'iuml',
	240: 'eth',
	241: 'ntilde',
	242: 'ograve',
	243: 'oacute',
	244: 'ocirc',
	245: 'otilde',
	246: 'ouml',
	247: 'divide',
	248: 'oslash',
	249: 'ugrave',
	250: 'uacute',
	251: 'ucirc',
	252: 'uuml',
	253: 'yacute',
	254: 'thorn',
	255: 'yuml',
	402: 'fnof',
	913: 'Alpha',
	914: 'Beta',
	915: 'Gamma',
	916: 'Delta',
	917: 'Epsilon',
	918: 'Zeta',
	919: 'Eta',
	920: 'Theta',
	921: 'Iota',
	922: 'Kappa',
	923: 'Lambda',
	924: 'Mu',
	925: 'Nu',
	926: 'Xi',
	927: 'Omicron',
	928: 'Pi',
	929: 'Rho',
	931: 'Sigma',
	932: 'Tau',
	933: 'Upsilon',
	934: 'Phi',
	935: 'Chi',
	936: 'Psi',
	937: 'Omega',
	945: 'alpha',
	946: 'beta',
	947: 'gamma',
	948: 'delta',
	949: 'epsilon',
	950: 'zeta',
	951: 'eta',
	952: 'theta',
	953: 'iota',
	954: 'kappa',
	955: 'lambda',
	956: 'mu',
	957: 'nu',
	958: 'xi',
	959: 'omicron',
	960: 'pi',
	961: 'rho',
	962: 'sigmaf',
	963: 'sigma',
	964: 'tau',
	965: 'upsilon',
	966: 'phi',
	967: 'chi',
	968: 'psi',
	969: 'omega',
	977: 'thetasym',
	978: 'upsih',
	982: 'piv',
	8226: 'bull',
	8230: 'hellip',
	8242: 'prime',
	8243: 'Prime',
	8254: 'oline',
	8260: 'frasl',
	8472: 'weierp',
	8465: 'image',
	8476: 'real',
	8482: 'trade',
	8501: 'alefsym',
	8592: 'larr',
	8593: 'uarr',
	8594: 'rarr',
	8595: 'darr',
	8596: 'harr',
	8629: 'crarr',
	8656: 'lArr',
	8657: 'uArr',
	8658: 'rArr',
	8659: 'dArr',
	8660: 'hArr',
	8704: 'forall',
	8706: 'part',
	8707: 'exist',
	8709: 'empty',
	8711: 'nabla',
	8712: 'isin',
	8713: 'notin',
	8715: 'ni',
	8719: 'prod',
	8721: 'sum',
	8722: 'minus',
	8727: 'lowast',
	8730: 'radic',
	8733: 'prop',
	8734: 'infin',
	8736: 'ang',
	8743: 'and',
	8744: 'or',
	8745: 'cap',
	8746: 'cup',
	8747: 'int',
	8756: 'there4',
	8764: 'sim',
	8773: 'cong',
	8776: 'asymp',
	8800: 'ne',
	8801: 'equiv',
	8804: 'le',
	8805: 'ge',
	8834: 'sub',
	8835: 'sup',
	8836: 'nsub',
	8838: 'sube',
	8839: 'supe',
	8853: 'oplus',
	8855: 'otimes',
	8869: 'perp',
	8901: 'sdot',
	8968: 'lceil',
	8969: 'rceil',
	8970: 'lfloor',
	8971: 'rfloor',
	9001: 'lang',
	9002: 'rang',
	9674: 'loz',
	9824: 'spades',
	9827: 'clubs',
	9829: 'hearts',
	9830: 'diams',
	338: 'OElig',
	339: 'oelig',
	352: 'Scaron',
	353: 'scaron',
	376: 'Yuml',
	710: 'circ',
	732: 'tilde',
	8194: 'ensp',
	8195: 'emsp',
	8201: 'thinsp',
	8204: 'zwnj',
	8205: 'zwj',
	8206: 'lrm',
	8207: 'rlm',
	8211: 'ndash',
	8212: 'mdash',
	8216: 'lsquo',
	8217: 'rsquo',
	8218: 'sbquo',
	8220: 'ldquo',
	8221: 'rdquo',
	8222: 'bdquo',
	8224: 'dagger',
	8225: 'Dagger',
	8240: 'permil',
	8249: 'lsaquo',
	8250: 'rsaquo',
	8364: 'euro'
};

export function EscapeHtmlEntities(text: string): string
{
	return text.replace(/[\u00A0-\u2666<>&]/g, (c) =>
	{
		return `&${escapeHtmlEntityTable[c.charCodeAt(0)] || `#${c.charCodeAt(0)}`};`;
	});
}

/**
 * Syntax highlights a string of code by wrapping parts in HTML spans with classes.
 * @function BeautifyCode
 * @param {string} code The source code string to beautify.
 * @param {string[]} reserved Array of reserved keywords to highlight.
 * @param {boolean} skipCSS If true, suppresses the generation of the <style> block.
 * @returns {string} The HTML string containing the beautified code.
 */
export function BeautifyCode(code: string, reserved: string[], skipCSS: boolean)
{
	reserved = reserved || ["abstract", "else", "instanceof", "super", "boolean", "enum", "int", "switch", "break", "export", "interface", "synchronized", "byte", "extends", "let", "this", "case", "false", "long", "throw", "catch", "final", "native", "throws", "char", "finally", "new", "transient", "class", "float", "null", "true", "const", "for", "package", "try", "continue", "function", "private", "typeof", "debugger", "goto", "protected", "var", "default", "if", "public", "void", "delete", "implements", "return", "volatile", "do", "import", "short", "while", "double", "in", "static", "with"];

	// Reserved words
	code = code.replace(/\b(\w+)\b/g, (v) =>
	{
		if (reserved.indexOf(v) != -1) { return `<span class='rsv'>${v}</span>`; }
		return v;
	});

	// Numbers
	code = code.replace(/\b([0-9]+)\b/g, (v) =>
	{
		return `<span class='num'>${v}</span>`;
	});

	// Obj.function
	code = code.replace(/(\w+\.\w+)/g, (v) =>
	{
		const t = v.split(".");
		return `<span class='obj'>${t[0]}</span>.<span class='prop'>${t[1]}</span>`;
	});

	// Function
	code = code.replace(/(\w+)\(/g, (v) =>
	{
		return `<span class='prop'>${v.substring(0, v.length - 1)}</span>(`;
	});

	// Strings
	code = code.replace(/("(\\.|[^"])*")/g, (v) =>
	{
		return `<span class='str'>${v}</span>`;
	});

	// Comments
	code = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, (v) =>
	{ // /(\/\/[a-zA-Z0-9\?\!\(\)_ ]*)/g
		return `<span class='cmnt'>${v.replace(/<[^>]*>/g, "")}</span>`;
	});


	if (!skipCSS)
	{
		code = `<style>.obj { color: #79B; } .prop { color: #B97; }	.str,.num { color: #A79; } .cmnt { color: #798; } .rsv { color: #9AB; } </style>${code}`;
	}

	return code;
}

/**
 * Syntax highlights a JSON string or object by wrapping parts in HTML spans.
 * @function BeautifyJSON
 * @param {string | object} code The JSON string or object to beautify.
 * @param {boolean} skipCSS If true, suppresses the generation of the <style> block.
 * @returns {string} The HTML string containing the beautified JSON.
 */
export function BeautifyJSON(code: string, skipCSS: boolean)
{
	if (typeof (code) == "object")
	{ code = JSON.stringify(code); }

	const reserved = ["false", "true", "null"];

	// Reserved words
	code = code.replace(/(\w+)/g, (v) =>
	{
		if (reserved.indexOf(v) != -1) { return `<span class='rsv'>${v}</span>`; }
		return v;
	});


	// Numbers
	code = code.replace(/([0-9]+)/g, (v) =>
	{
		return `<span class='num'>${v}</span>`;
	});

	// Obj.function
	code = code.replace(/(\w+\.\w+)/g, (v) =>
	{
		const t = v.split(".");
		return `<span class='obj'>${t[0]}</span>.<span class='prop'>${t[1]}</span>`;
	});

	// Strings
	code = code.replace(/("(\\.|[^"])*")/g, (v) =>
	{
		return `<span class='str'>${v}</span>`;
	});

	// Comments
	code = code.replace(/(\/\/[a-zA-Z0-9?!()_ ]*)/g, (v) =>
	{
		return `<span class='cmnt'>${v}</span>`;
	});

	if (!skipCSS)
	{
		code = `<style>.obj { color: #79B; } .prop { color: #B97; }	.str { color: #A79; } .num { color: #B97; } .cmnt { color: #798; } .rsv { color: #9AB; } </style>${code}`;
	}

	return code;
}

/**
 * Converts a Data URI string into a Blob object.
 * @function DataURItoBlob
 * @param {string} dataURI The data URI string (e.g., "data:image/png;base64,...").
 * @returns {Blob} The resulting Blob object.
 */
export function DataURItoBlob(dataURI: string)
{
	const pos = dataURI.indexOf(",");
	// Convert to binary
	const byteString = atob(dataURI.substring(pos + 1));
	// Copy from string to array
	const ab = new ArrayBuffer(byteString.length);
	const ia = new Uint8Array(ab);
	const l = byteString.length;
	for (let i = 0; i < l; i++)
	{
		ia[i] = byteString.charCodeAt(i);
	}

	let mime = dataURI.substring(5, pos - 5);
	mime = mime.substring(0, mime.length - 7); // Strip ";base64"
	return new Blob([ab], { type: mime });
}

/**
 * Converts an RGBA array to a HEXA color string.
 * @function RGBAToHEXA
 * @param {[number, number, number, number]} rgba Array containing r, g, b, a values.
 * @returns {string} The HEXA color string (e.g., "#RRGGBBAA").
 */
export function RGBAToHEXA(rgba: [number, number, number, number])
{
	// Extract R, G, B, and A values
	const r = rgba[0];
	const g = rgba[1];
	const b = rgba[2];
	const a = rgba[3]; // Alpha value

	// Convert RGB to HEX
	const toHex = (value: number) =>
	{
		const hex = value.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};

	// Convert alpha to HEX (multiply by 255 and convert to hex)
	const alphaHex = Math.round(a).toString(16);
	const paddedAlphaHex = alphaHex.length === 1 ? "0" + alphaHex : alphaHex;

	// Combine to form the HEX color with alpha
	return `#${toHex(r)}${toHex(g)}${toHex(b)}${paddedAlphaHex}`;
}

/**
 * Convert sizes in any format to a valid CSS format (number to string, negative number to calc( 100% - number px )
 * @function SizeToCSS
 * @param {string|Number} value
 * @return {string|undefined} valid css size string
 *
 */
export function SizeToCSS(value?: number | string): string | undefined
{
	if (value === undefined || value === null) { return undefined; }
	if (value.constructor === String) { return value as string; }
	if (typeof (value) == 'number' && value >= 0) { return (value as number | 0) + "px"; }
	return "calc( 100% - " + Math.abs(value as number | 0) + "px )";
}

/**
 * Triggers a simple event in an object (similar to jQuery.trigger)
 * @function Trigger
 * @param {unknown} element could be an HTMLEntity or a regular object
 * @param {string} eventName the type of the event
 * @param {unknown} params it will be stored in e.detail
 */
export function Trigger(element: unknown, eventName: string, params?: unknown): CustomEvent<unknown>
{
	const evt = new CustomEvent(eventName, { detail: params });

	if (!element || typeof (element) !== "object") { return evt; }

	if ("dispatchEvent" in element)
	{
		(element as DispatchableElement).dispatchEvent(evt);
	}
	else if ("__events" in element)
	{
		(element as TriggerableElement).__events.dispatchEvent(evt);
	}

	// Else nothing seems binded here so nothing to do
	return evt;
}

// -- Moved from core.ts --

/**
 * Interface for elements that can trigger events via a hidden __events property.
 */
export interface TriggerableElement
{
	/** Hidden event target for handling custom events. */
	__events: EventTarget;
}

/**
 * Interface for elements that can dispatch events.
 */
export interface DispatchableElement
{
	/** Dispatches a custom event. */
	dispatchEvent: (event: CustomEvent<unknown>) => boolean;
}

/**
 * Interface for objects that hold content within an HTMLDivElement.
 */
export interface ContentHolder
{
	/** The HTML container for the content. */
	content: HTMLDivElement;
}

/**
 * Interface mixing LiteGUIObject and HTMLElement, with an add function.
 */
export interface EmptyLiteGUIObject extends LiteGUIObject, HTMLElement
{
	/** Adds a child element or widget. */
	add: (v: HTMLDivElement | LiteGUIObject) => void;
}

/**
 * Interface mixing LiteGUIObject and HTMLButtonElement.
 */
export interface EmptyLiteGUIButton extends LiteGUIObject, HTMLButtonElement
{
}

/**
 * Interface for HTMLSpanElements that reference a widget.
 */
export interface TriggerableSpan extends HTMLSpanElement
{
	/** Reference to the widget associated with this span. */
	widget: object;
}

/**
 * Interface for script elements with additional metadata used by the core.
 */
export interface CoreScriptElement extends HTMLScriptElement
{
	/** The original source URL of the script. */
	originalSrc: string;
	/** The numeric index or identifier of the script. */
	num: number;
}

/**
 * Interface extending the standard Document to include parentWindow reference.
 */
export interface CoreDocument extends Document
{
	/** Reference to the parent window if applicable. */
	parentWindow?: Window;
}

/**
 * Remove from the interface, it is is an HTML element it is removed from its parent, if it is a widget the same.
 * @function RemoveElement
 * @param {string | LiteGUIObject | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>} element it also supports HTMLentity, selector string or Array of elements
 */
export function RemoveElement(element: string | LiteGUIObject | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>): void
{
	if (!element) { return; }

	if (typeof element === 'string') // Selector
	{
		const elements = document.querySelectorAll(element);
		for (let i = 0; i < elements.length; ++i)
		{
			const element = elements[i];
			if (element && element.parentNode)
			{
				element.parentNode.removeChild(element);
			}
		}
	}
	else if (Array.isArray(element) || element instanceof NodeList)
	{
		for (const i in element)
		{
			RemoveElement(element[i]);
		}
	}
	else if ("root" in element) // LiteGUI widget
	{
		element.root?.parentNode?.removeChild(element.root);
	}
	else if ("parentNode" in element) // Regular HTML entity
	{
		element.parentNode?.removeChild(element);
	}
}

/**
 * Binds an event in an object (similar to jQuery.bind)
 * If the element is not an HTML entity a new one is created, attached to the object (as non-enumerable, called __events) and used
 * @function Bind
 * @param {string | Object | Object[] | NodeListOf<HTMLElement>} element could be an HTMLEntity, a regular object, a query string or a regular Array of entities
 * @param {String} event the string defining the event
 * @param {EventListenerOrEventListenerObject} callback where to call
 */
export function Bind(element: string | object | object[] | NodeListOf<HTMLElement>, event: string, callback: EventListenerOrEventListenerObject): void
{
	if (!element)
	{
		throw ("Cannot bind to null");
	}
	if (!event)
	{
		throw ("Event bind missing");
	}
	if (!callback)
	{
		throw ("Bind callback missing");
	}

	if (typeof element === "string")
	{
		element = document.querySelectorAll(element);
	}

	function inner(element: HTMLElement | TriggerableElement)
	{
		if (!element) { return; }

		if ("addEventListener" in element)
		{
			element.addEventListener(event, callback);
		}
		else if ("__events" in element)
		{
			element.__events.addEventListener(event, callback);
		}
		else
		{
			const triggerable = element as TriggerableElement;
			// Create a dummy HTMLentity so we can use it to bind HTML events
			const dummy = document.createElement("span") as TriggerableSpan;
			dummy.widget = element; // Double link
			Object.defineProperty(triggerable, "__events", {
				enumerable: false,
				configurable: false,
				writable: false,
				value: dummy
			});
			triggerable.__events.addEventListener(event, callback);
		}
	}

	if (Array.isArray(element) || element.constructor === NodeList)
	{
		for (let i = 0; i < element.length; ++i)
		{
			inner(element[i]);
		}
	}
	else
	{
		inner(element as TriggerableElement);
	}
}

/**
 * Unbinds an event in an object (similar to jQuery.unbind)
 * @function Unbind
 * @param {Object} element could be an HTMLEntity or a regular object
 * @param {String} event the string defining the event
 * @param {EventListenerOrEventListenerObject} callback where to call
 */
export function Unbind(element: HTMLElement | TriggerableElement, event: string, callback: EventListenerOrEventListenerObject): void
{
	if ("removeEventListener" in element)
	{
		element.removeEventListener(event, callback);
	}
	else if ("__events" in element)
	{
		element.__events.removeEventListener(event, callback);
	}
}

/**
 * Removes a class
 * @function RemoveClass
 * @param {HTMLElement} elem
 * @param {String} selector
 * @param {String} className
 */
export function RemoveClass(elem: HTMLElement, selector: string, className?: string): void
{
	if (!className)
	{
		className = selector;
		selector = "." + selector;
	}
	const list = (elem || document).querySelectorAll(selector);
	for (let i = 0; i < list.length; ++i)
	{ list[i].classList.remove(className); }
}

/**
 * Wrapper of document.getElementById
 * @function GetById
 * @param {String} id
 * return {HTMLEntity}
 *
 */
export function GetById(id: string): HTMLElement | null
{
	return document.getElementById(id);
}

/**
 * Test if the cursor is inside an element
 * @function IsCursorOverElement
 * @param {MouseEvent} event
 * @param {HTMLElement} element
 *
 */
export function IsCursorOverElement(event: MouseEvent, element: HTMLElement): boolean
{
	const left = event.pageX;
	const top = event.pageY;
	const rect = element.getBoundingClientRect();
	if (!rect) { return false; }
	if (top > rect.top && top < (rect.top + rect.height) &&
		left > rect.left && left < (rect.left + rect.width))
	{
		return true;
	}
	return false;
}

/**
 * Returns the bounding client rect of an element.
 * @function getRect
 * @param {HTMLElement} element The element to measure.
 * @returns {DOMRect} The bounding rectangle.
 */
export function GetRect(element: HTMLElement): DOMRect
{
	return element.getBoundingClientRect();
}

/**
 * Copy a string to the clipboard (it needs to be invoqued from a click event)
 * @function ToClipboard
 * @param {String | Record<string, unknown>} data
 */
export function ToClipboard(data: string | Record<string, unknown>): void
{
	if (typeof data !== "string")
	{
		data = JSON.stringify(data);
	}

	try
	{
		const copyPromise = navigator.clipboard.writeText(data);
		copyPromise.then(() =>
		{
			console.log("Saved to clipboard");
		}).catch((err) =>
		{
			console.warn("Problem saving to clipboard", err);
		});
	}
	catch (err)
	{
		console.warn('Oops, unable to copy using the true clipboard', err);
	}
}

/**
 * Insert some CSS code to the website
 * @function AddCSS
 * @param {String|CSSStyleDeclaration} code it could be a string with CSS rules, or an object with the style syntax.
 *
 */
export function AddCSS(code: string | CSSStyleDeclaration)
{
	if (!code) { return; }

	if (typeof code === "string")
	{
		const style = document.createElement('style') as HTMLStyleElement;
		style.innerHTML = code;
		document.getElementsByTagName('head')[0].appendChild(style);
		return;
	}

	for (const i in code)
	{
		document.body.style[i] = code[i];
	}

}

/**
 * Requires a new CSS
 * @function RequireCSS
 * @param {String} url string with url or an array with several urls
 * @param {Function} onComplete
 *
 */
export function RequireCSS(url: string | Array<string>, onComplete: (ev: Event) => void)
{
	if (typeof (url) == "string")
	{ url = [url]; }

	while (url.length)
	{
		const link = document.createElement('link') as HTMLLinkElement;
		// Link.id   = cssId;
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = url.shift(/* 1 */) as string;
		link.media = 'all';
		const head = document.getElementsByTagName('head')[0];
		head.appendChild(link);
		if (url.length == 0)
		{
			link.onload = onComplete;
		}
	}
}

export interface RequestOptions
{
	url: string,
	dataType: string,
	mimeType?: string,
	data?: Array<string>,
	nocache?: boolean,
	error?: (err: string | ProgressEvent<EventTarget>) => void,
	success?: (data: unknown, xhr: XMLHttpRequest) => void
}

/**
 * Request file from url (it could be a binary, text, etc.). If you want a simplied version use
 * @function Request
 * @param {RequestOptions} request object with all the parameters like data (for sending forms), dataType, success, error
 */
export function Request(request: RequestOptions)
{
	let dataType = request.dataType ?? "text";
	if (dataType == "json") // Parse it locally
	{
		dataType = "text";
	}
	else if (dataType == "xml") // Parse it locally
	{
		dataType = "text";
	}
	else if (dataType == "binary")
	{
		// Request.mimeType = "text/plain; charset=x-user-defined";
		dataType = "arraybuffer";
		request.mimeType = "application/octet-stream";
	}

	// Regular case, use AJAX call
	const xhr = new XMLHttpRequest();
	xhr.open(request.data ? 'POST' : 'GET', request.url, true);
	if (dataType)
	{
		xhr.responseType = dataType as XMLHttpRequestResponseType;
	}
	if (request.mimeType)
	{
		xhr.overrideMimeType(request.mimeType);
	}
	if (request.nocache)
	{
		xhr.setRequestHeader('Cache-Control', 'no-cache');
	}

	xhr.onload = function ()
	{
		let response = this.response;
		if (this.status != 200)
		{
			const err = "Error " + this.status;
			if (request.error)
			{
				request.error(err);
			}
			Trigger(xhr, "fail", this.status);
			return;
		}

		if (request.dataType == "json") // Chrome doesnt support json format
		{
			try
			{
				response = JSON.parse(response);
			}
			catch (err)
			{
				if (request.error)
				{
					request.error(err as string);
				}
				else
				{
					throw err;
				}
			}
		}
		else if (request.dataType == "xml")
		{
			try
			{
				const xmlparser = new DOMParser();
				response = xmlparser.parseFromString(response, "text/xml");
			}
			catch (err)
			{
				if (request.error)
				{
					request.error(err as string);
				}
				else
				{
					throw err;
				}
			}
		}

		if (request.success)
		{
			request.success.call(this, response, this);
		}
	};
	xhr.onerror = function (err)
	{
		if (request.error) { request.error(err); }
	};

	const data = new FormData();
	if (request.data)
	{
		for (const i in request.data)
		{
			data.append(i, request.data[i]);
		}
	}

	xhr.send(data);
	return xhr;
}

/**
 * Request file from url
 * @function RequestText
 * @param {String} url
 * @param {(data: string, xhr: XMLHttpRequest) => void} onComplete
 * @param {(err: string | ProgressEvent<EventTarget>) => void} onError
 *
 */
export function RequestText(url: string,
	onComplete: (data: unknown | string, xhr: XMLHttpRequest) => void,
	onError: (err: string | ProgressEvent<EventTarget>) => void)
{
	return Request({ url: url, dataType: "text", success: onComplete, error: onError });
}

/**
 * Request file from url
 * @function RequestJSON
 * @param {String} url
 * @param {(data: object, xhr: XMLHttpRequest) => void} onComplete
 * @param {(err: string | ProgressEvent<EventTarget>) => void} onError
 *
 */
export function RequestJSON(url: string,
	onComplete: (data: object | unknown, xhr: XMLHttpRequest) => void,
	onError: (err: string | ProgressEvent<EventTarget>) => void)
{
	return Request({ url: url, dataType: "json", success: onComplete, error: onError });
}

/**
 * Request binary file from url
 * @function RequestBinary
 * @param {String} url
 * @param {(data: ArrayBuffer | unknown, xhr: XMLHttpRequest) => void} onComplete
 * @param {(err: string | ProgressEvent<EventTarget>) => void} onError
 *
 */
export function RequestBinary(url: string,
	onComplete: (data: ArrayBuffer | unknown, xhr: XMLHttpRequest) => void,
	onError: (err: string | ProgressEvent<EventTarget>) => void)
{
	return Request({ url: url, dataType: "binary", success: onComplete, error: onError });
}


/**
 * Request script and inserts it in the DOM
 * @function RequireScript
 * @param {String|Array} url the url of the script or an array containing several urls
 * @param {(scripts: Array<CoreScriptElement>) => void} onComplete
 * @param {(err: string | Event, src: string, num: number) => void} onError
 * @param {(src: string, num: number) => void} onProgress (if several files are required, onProgress is called after every file is added to the DOM)
 *
 */
export function RequireScript(url: string | Array<string>,
	onComplete: (scripts: Array<CoreScriptElement>) => void,
	onError: (err: string | Event, src: string, num: number) => void,
	onProgress: (src: string, num: number) => void,
	version: number)
{
	if (!url) { throw ("invalid URL"); }

	if (typeof url === "string") { url = [url]; }

	let total = url.length;
	const loadedScripts: Array<CoreScriptElement> = [];
	const onload = function (script: CoreScriptElement)
	{
		total--;
		loadedScripts.push(script);
		if (total)
		{
			if (onProgress) { onProgress(script.originalSrc, script.num); }
		}
		else if (onComplete)
		{
			onComplete(loadedScripts);
		}
	};

	for (const i in url)
	{
		const script = document.createElement('script') as CoreScriptElement;
		script.num = parseInt(i);
		script.type = 'text/javascript';
		script.src = url[script.num] + (version ? "?version=" + version : "");
		script.originalSrc = url[script.num];
		script.async = false;
		script.onload = onload.bind(undefined, script);
		if (onError)
		{
			script.onerror = function (err: string | Event)
			{
				onError(err, this.originalSrc, this.num);
			};
		}
		document.getElementsByTagName('head')[0].appendChild(script);
	}
}

/**
 * Shows a generic message dialog.
 * @function ShowMessage
 * @param {string} content The message content.
 * @param {DialogOptions} [options] Configuration options.
 * @returns {Dialog} The created Dialog instance.
 */
export function ShowMessage(content: string, options?: DialogOptions)
{
	options = options ?? {};

	options.title = options.title ?? "Attention";
	options.content = content;
	options.close = 'fade';
	const dialog = new Dialog(options);
	if (options.closable) { dialog.addButton("Close", { close: true }); }

	dialog.makeModal();
	return dialog;
}

/**
 * Shows a dialog with a message
 * @function PopupDialog
 * @param {String} content
 * @param {DialogOptions} [options]
 * @returns {Dialog}
 */
export function PopupDialog(content: string, options?: DialogOptions): Dialog
{
	options = options ?? {};

	options.minHeight = 140;
	if (typeof content == "string") { content = `<p>${content}</p>`; }

	options.content = content;
	options.close = 'fade';

	const dialog = new Dialog(options);
	if (options.closable) { dialog.addButton("Close", { close: true }); }
	dialog.show();
	return dialog;
}


/**
 * Options for configuring message dialogs (alert, confirm, prompt).
 */
export interface MessageOptions
{
	/** Whether to show a textarea for input. */
	textarea?: boolean;
	/** Initial value for input fields. */
	value?: string;
	/** Custom CSS class name for the dialog. */
	className?: string;
	/** Title of the dialog. */
	title?: string;
	/** Width of the dialog in pixels. */
	width?: number;
	/** Height of the dialog in pixels. */
	height?: number;
	/** HTML content to display in the dialog. */
	content?: string;
	/** If true, the dialog cannot be closed by the user. */
	noclose?: boolean;
}

/**
 * Shows an alert dialog with a message
 * @function AlertDialog
 * @param {String} content
 * @param {MessageOptions} [options]
 * @returns {Dialog}
 */
export function AlertDialog(content: string, options?: MessageOptions): Dialog
{
	options = options ?? {};

	options.className = "alert";
	options.title = options.title ?? "Alert";
	options.width = options.width ?? 280;
	options.height = options.height ?? 140;
	if (typeof content == "string") { content = `<p>${content}</p>`; }

	RemoveElement(".litepanel.alert"); // Kill other panels
	return ShowMessage(content, options);
}

/**
 * Shows a confirm dialog with a message
 * @function ConfirmDialog
 * @param {String} content
 * @param {(value: boolean) => void} callback
 * @param {MessageOptions} [options]
 * @returns {Dialog}
 */
export function ConfirmDialog(content: string,
	callback: (value: boolean) => void,
	options?: MessageOptions): Dialog
{
	options = options ?? {};
	options.className = "alert";
	options.title = options.title ?? "Confirm";
	options.width = options.width ?? 280;
	if (typeof (content) == "string")
	{
		content = `<p>${content}</p>`;
	}

	content += "<button class='litebutton' data-value='yes' style='width:45%; margin-left: 10px'>Yes</button><button class='litebutton' data-value='no' style='width:45%'>No</button>";
	options.noclose = true;

	const dialog = ShowMessage(content, options);
	dialog.content.style.paddingBottom = "10px";
	const buttons = dialog.content.querySelectorAll("button");

	const _onClick = (v: PointerEvent) =>
	{
		const button = v.target as HTMLButtonElement;
		const value = button.dataset.value == "yes";
		dialog.close(); // Close before callback
		if (callback)
		{
			callback(value);
		}
	};
	for (let i = 0; i < buttons.length; i++)
	{
		const button = buttons[i];
		button.addEventListener("click", _onClick);
	}
	buttons[0].focus();

	return dialog;
}

/**
 * Shows a prompt dialog with a message
 * @function PromptDialog
 * @param {String} content
 * @param {(value?: string) => void} callback
 * @param {MessageOptions} [options]
 * @returns {Dialog}
 */
export function PromptDialog(content: string,
	callback: (value?: string) => void,
	options?: MessageOptions): Dialog
{
	options = options ?? {};
	options.className = "alert";
	options.title = options.title ?? "Prompt";
	options.width = options.width ?? 280;

	if (typeof (content) == "string")
	{
		content = `<p>${content}</p>`;
	}

	const value = options.value ?? "";
	let textinput = `<input type='text' value='${value}'/>`;
	if (options.textarea)
	{
		textinput = `<textarea class='textfield' style='width:95%'>${value}</textarea>`;
	}

	content += `<p>${textinput}</p><button class='litebutton' data-value='accept' style='width:45%; margin-left: 10px; margin-bottom: 10px'>Accept</button><button class='litebutton' data-value='cancel' style='width:45%'>Cancel</button>`;
	options.noclose = true;
	const dialog = ShowMessage(content, options);

	const buttons = dialog.content.querySelectorAll("button");
	const input = dialog.content.querySelector("input,textarea") as HTMLInputElement;

	const _onEvent = function (e: Event)
	{
		const button = e.target as HTMLButtonElement;
		let value: string | undefined = input.value;
		if (button && button.dataset && button.dataset.value == "cancel")
		{
			value = undefined;
		}
		dialog.close(); // Close before callback
		if (callback) { callback(value); }
	};

	for (let i = 0; i < buttons.length; i++)
	{
		buttons[i].addEventListener("click", _onEvent);
	}

	const _onKeyDown = function (e: KeyboardEvent)
	{
		if (e.key == "Enter")
		{
			_onEvent(e);
			return false;
		}
		if (e.key == "Escape") { dialog.close(); }
		return;
	};

	input?.addEventListener("keydown", _onKeyDown, true);

	input?.focus();
	return dialog;
}


/**
 * Shows a choice dialog with a message
 * @function ChoiceDialog
 * @param {String} content
 * @param {Array<string|ContentHolder>} choices
 * @param {(value: string | ContentHolder) => void} callback
 * @param {MessageOptions} [options]
 * @returns {Dialog}
 */
export function ChoiceDialog(content: string, choices: Array<string | ContentHolder>, callback: (value: string | ContentHolder) => void, options?: MessageOptions): Dialog
{
	options = options ?? {};
	options.className = "alert";
	options.title = options.title ?? "Select one option";
	options.width = options.width ?? 280;
	// Options.height = 100;
	if (typeof (content) == "string")
	{
		content = `<p>${content}</p>`;
	}

	for (const i in choices)
	{
		const choice = typeof choices[i] === "string" ? choices[i] : choices[i].content;
		content += `<button class='litebutton' data-value='${i}' style='width:45%; margin-left: 10px'>${choice}</button>`;
	}
	options.noclose = true;

	const dialog = ShowMessage(content, options);
	dialog.content.style.paddingBottom = "10px";
	const buttons = dialog.content.querySelectorAll("button");

	const inner = (v: PointerEvent) =>
	{
		const button = v.target as HTMLButtonElement;
		const value = choices[button.dataset.value as keyof object];
		dialog.close(); // Close before callback
		if (callback) { callback(value); }
	};
	for (let i = 0; i < buttons.length; i++)
	{
		buttons[i].onclick = inner;
	}

	return dialog;
}


// Old version, it loads one by one, so it is slower
/**
 * Loads scripts sequentially from a list of URLs.
 * @function RequireScriptSerial
 * @param {string | string[]} url Single URL or array of URLs to load.
 * @param {(loadedScripts: GlobalEventHandlers[]) => void} onComplete Callback when all scripts are loaded.
 * @param {(url: string, remaining: number) => void} onProgress Callback for progress updates.
 */
export function RequireScriptSerial(url: string | string[],
	onComplete: (loadedScripts: GlobalEventHandlers[]) => void,
	onProgress: (url: string, remaining: number) => void)
{
	if (typeof (url) == "string")
	{
		url = [url];
	}

	const loadedScripts: GlobalEventHandlers[] = [];
	function addScript()
	{
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = (url as string[]).shift() as string;
		script.onload = function ()
		{
			if (url.length)
			{
				if (onProgress)
				{
					onProgress(url[0], url.length);
				}

				addScript();
				return;
			}

			loadedScripts.push(this);

			if (onComplete)
			{
				onComplete(loadedScripts);
			}
		};
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	addScript();
}

/**
 * Creates an HTML element
 * @function CreateElement
 * @param {String} tag
 * @param {String} classID string containing id and classes, example: "myid .someclass .anotherclass"
 * @param {String} content
 * @param {string | CSSStyleDeclaration} [style]
 * @param {EventListenerOrEventListenerObject[]} [events]
 */
export function CreateElement(tag: string,
	classID: string,
	content: string,
	style?: string | CSSStyleDeclaration,
	events?: EventListenerOrEventListenerObject[])
{
	const elem = document.createElement(tag) as EmptyLiteGUIObject;
	if (classID)
	{
		const t = classID.split(" ");
		for (let i = 0; i < t.length; i++)
		{
			if (t[i][0] == ".")
			{
				elem.classList.add(t[i].substring(1));
			}
			else if (t[i][0] == "#")
			{
				elem.id = t[i].substring(1);
			}
			else
			{
				elem.id = t[i];
			}
		}
	}
	elem.root = elem;

	if (content)
	{
		elem.innerHTML = content;
	}
	elem.add = function (v: HTMLDivElement | LiteGUIObject)
	{
		this.appendChild("root" in v ? v.root : v);
	};

	if (style)
	{
		if (typeof style === "string")
		{
			elem.setAttribute("style", style);
		}
		else
		{
			for (const i in style)
			{
				elem.style[i] = style[i];
			}
		}
	}

	if (events)
	{
		for (const i in events)
		{
			elem.addEventListener(i, events[i]);
		}
	}
	return elem;
}

/**
 * Useful to create elements from a text like '<div><span class="title"></span></div>' and an object like { ".title":"mytitle" }
 * @function CreateListItem
 * @param {String} code
 * @param {Record<string, string>} values it will use innerText in the elements that matches that selector
 * @param {CSSStyleDeclaration} style
 * @return {HTMLElement}
 *
 */
export function CreateListItem(code: string,
	values: Record<string, string>,
	style?: Partial<CSSStyleDeclaration> | Record<string, string>)
{
	let elem: HTMLSpanElement = document.createElement("span");
	elem.innerHTML = code;
	const first = elem.childNodes[0];

	if (!first) { throw ("Error creating list item"); }

	elem = first as HTMLElement;

	if (values)
	{
		for (const i in values)
		{
			const subelem = elem.querySelector(i) as HTMLElement;
			if (subelem) { subelem.innerText = values[i]; }
		}
	}

	if (style)
	{
		for (const i in style)
		{
			const value = (style as Record<string, unknown>)[i];
			if (typeof value === "string")
			{
				(elem.style as unknown as Record<string, string>)[i] = value;
			}
		}
	}
	return elem;
}

/**
 * Creates a button element
 * @function CreateButton
 * @param {String} classID ID or class
 * @param {String} content
 * @param {(ev: PointerEvent) => void} callback when the button is pressed
 * @param {CSSStyleDeclaration|String} style
 *
 */
export function CreateButton(classID: string, content: string,
	callback: (ev: PointerEvent) => void,
	style: CSSStyleDeclaration | string)
{
	const elem = document.createElement("button") as EmptyLiteGUIButton;
	elem.className = "litegui litebutton button";
	if (classID)
	{
		const t = classID.split(" ");
		for (let i = 0; i < t.length; i++)
		{
			if (t[i][0] == ".")
			{
				elem.classList.add(t[i].substring(1));
			}
			else if (t[i][0] == "#")
			{
				elem.id = t[i].substring(1);
			}
			else
			{
				elem.id = t[i];
			}
		}
	}

	elem.root = elem;
	if (content !== undefined)
	{
		elem.innerHTML = content;
	}

	if (callback)
	{
		elem.onclick = callback;
	}

	if (style)
	{
		if (typeof style === "string")
		{
			elem.setAttribute("style", style);
		}
		else
		{
			for (const i in style)
			{
				elem.style[i] = style[i];
			}
		}
	}
	return elem;
}

/**
 * Retrieves all parent elements of the given element up to the document root.
 * @function GetParents
 * @param {HTMLElement} element The starting element.
 * @returns {HTMLElement[]} Array of parent elements.
 */
export function GetParents(element: HTMLElement): Array<HTMLElement>
{
	const elements = [];
	let curElement = element.parentElement;
	while (curElement !== null)
	{
		if (element.nodeType !== Node.ELEMENT_NODE)
		{
			continue;
		}
		elements.push(element);
		curElement = curElement.parentElement;
	}
	return elements;
}

/**
 * Opens a new window with copied styles and optional scripts.
 * @function NewWindow
 * @param {string} title syntax title for the new window.
 * @param {number} width Width of the window.
 * @param {number} height Height of the window.
 * @param {{ scripts?: boolean, content?: string }} [options] Configuration object.
 * @param {boolean} [options.scripts] Whether to copy scripts to the new window.
 * @param {string} [options.content] HTML content to inject into the new window.
 * @returns {Window} The newly created window object.
 */
export function NewWindow(title: string, width: number, height: number,
	options?: { scripts?: boolean, content?: string }): Window
{
	options = options ?? {};
	const newWindow = window.open("", "", `width=${width}, height=${height}, location=no, status=no, menubar=no, titlebar=no, fullscreen=yes`) as Window;
	newWindow.document.writeln(`<html><head><title>${title}</title>`);

	// Transfer style
	const styles = document.querySelectorAll("link[rel='stylesheet'],style");
	for (let i = 0; i < styles.length; i++)
	{
		newWindow.document.writeln(styles[i].outerHTML);
	}

	// Transfer scripts (optional because it can produce some errors)
	if (options.scripts)
	{
		const scripts = document.querySelectorAll("script");
		for (let i = 0; i < scripts.length; i++)
		{
			if (scripts[i].src) // Avoid inline scripts, otherwise a cloned website would be created
			{
				newWindow.document.writeln(scripts[i].outerHTML);
			}
		}
	}

	const content = options.content ?? "";
	newWindow.document.writeln(`</head><body>${content}</body></html>`);
	newWindow.document.close();
	return newWindow;
}

/**
 * Triggers a download of the resource at the specified URL.
 * @function DownloadURL
 * @param {string} url The URL of the resource to download.
 * @param {string} filename The name to save the file as.
 */
export function DownloadURL(url: string, filename: string)
{
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/**
 * Triggers a download of a File or Blob object.
 * @function DownloadFile
 * @param {string} filename The name to save the file as.
 * @param {File | Blob} data The file data.
 * @param {string} dataType MIME type of the data if not specified in the Blob.
 */
export function DownloadFile(filename: string, data: File | Blob, dataType: string)
{
	if (!data)
	{
		console.warn("No file provided to download");
		return;
	}

	if (!dataType)
	{
		if (data.constructor === String)
		{ dataType = 'text/plain'; }
		else
		{ dataType = 'application/octet-stream'; }
	}

	let file = null;
	if (!(data instanceof File) && !(data instanceof Blob))
	{
		file = new Blob([data], { type: dataType });
	}
	else
	{
		file = data;
	}

	const url = URL.createObjectURL(file);
	const element = document.createElement("a");
	element.setAttribute('href', url);
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	setTimeout(() => { URL.revokeObjectURL(url); }, 1000 * 60); // Wait one minute to revoke url
}

/**
 * Returns the URL vars ( ?foo=faa&foo2=etc )
 * @function GetUrlVars
 *
 */
export function GetUrlVars(): Array<string>
{
	const vars = [];
	let hash;
	const hashes: string | Array<string> = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (let i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0] as keyof object] = hash[1];
	}
	return vars;
}

/**
 * Retrieves a specific query parameter from the URL.
 * @function GetUrlVar
 * @param {string} name The name of the parameter.
 * @returns {string} The value of the parameter.
 */
export function GetUrlVar(name: string): string
{
	return GetUrlVars()[name as keyof object];
}

/**
 * Makes one element draggable
 * @function Draggable
 * @param {HTMLElement} container the element that will be dragged
 * @param {HTMLElement} dragger the area to start the dragging
 * @param {(container: HTMLElement, e: MouseEvent) => void} onStart Callback when the dragging starts.
 * @param {(container: HTMLElement, e: MouseEvent) => void} onFinish Callback when the dragging finishes.
 * @param {(container: HTMLElement, e: MouseEvent) => boolean} onIsDraggable Callback to determine if the element is currently draggable.
 */
export function Draggable(container: HTMLElement,
	dragger?: HTMLElement,
	onStart?: (container: HTMLElement, e: MouseEvent) => void,
	onFinish?: (container: HTMLElement, e: MouseEvent) => void,
	onIsDraggable?: (container: HTMLElement, e: MouseEvent) => boolean)
{
	dragger = dragger ?? container;
	dragger.addEventListener("mousedown", _onMouseEvent);
	dragger.style.cursor = "move";
	let prevX = 0;
	let prevY = 0;

	let rect = container.getClientRects()[0];
	let x = rect ? rect.left : 0;
	let y = rect ? rect.top : 0;

	container.style.position = "absolute";
	container.style.left = x + "px";
	container.style.top = y + "px";

	function _onMouseEvent(e: MouseEvent)
	{
		if (e.type == "mousedown")
		{
			if (!rect)
			{
				rect = container.getClientRects()[0];
				x = rect ? rect.left : 0;
				y = rect ? rect.top : 0;
			}

			if (onIsDraggable && onIsDraggable(container, e) == false)
			{
				e.stopPropagation();
				return false;
			}

			prevX = e.clientX;
			prevY = e.clientY;
			document.addEventListener("mousemove", _onMouseEvent);
			document.addEventListener("mouseup", _onMouseEvent);
			if (onStart) { onStart(container, e); }
			e.stopPropagation();
			return false;
		}

		if (e.type == "mouseup")
		{
			document.removeEventListener("mousemove", _onMouseEvent);
			document.removeEventListener("mouseup", _onMouseEvent);

			if (onFinish) { onFinish(container, e); }
			return;
		}

		if (e.type == "mousemove")
		{
			const deltax = e.clientX - prevX;
			const deltay = e.clientY - prevY;
			prevX = e.clientX;
			prevY = e.clientY;
			x += deltax;
			y += deltay;
			container.style.left = x + "px";
			container.style.top = y + "px";
		}
		return;
	}
}

/**
 * Clones object content
 * @function CloneObject
 * @param {Object} source
 * @param {Object} target
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CloneObject(source: any, target: any)
{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const o: any = typeof target !== "object" ? {} : target;
	for (const i in source)
	{
		if (i[0] == "_" || i.substring(0, 5) == "jQuery") // Skip vars with _ (they are private)
		{
			continue;
		}

		const v = source[i];
		if (v == null)
		{
			o[i] = null;
		}
		else if (typeof v === 'function')
		{
			continue;
		}
		else if (typeof v == "number" || typeof v == "string")
		{
			o[i] = v;
		}
		else if (typeof v == "object" && "constructor" in v && v.constructor == Float32Array) // Typed arrays are ugly when serialized
		{
			o[i] = Array.from(v); // Clone
		}
		else if (Array.isArray(v))
		{
			if (o[i] && o[i].constructor == Float32Array) // Reuse old container
			{
				o[i].set(v);
			}
			else // Not safe using slice because it doesn't clone content, only container
			{
				o[i] = JSON.parse(JSON.stringify(v));
			}
		}
		else // Slow but safe
		{
			try
			{
				// Prevent circular recursions
				o[i] = JSON.parse(JSON.stringify(v));
			}
			catch (err)
			{
				console.error(err);
			}
		}
	}
	return o;
}

/**
 * Removing spaces and dots from a string.
 * @function SafeName
 * @param {string} str The input string.
 * @returns {string} The sanitized string.
 */
export function SafeName(str: string): string
{
	return String(str).replace(/[\s.]/g, '');
}

/**
 * Encodes an HTML string by replacing special characters with unicode.
 * @function HTMLEncode
 * @param {string} htmlCode The HTML string to encode.
 * @returns {string} The encoded string (text content).
 */
export function HTMLEncode(htmlCode: string): string
{
	const e = document.createElement("div");
	e.innerHTML = htmlCode;
	return e.innerText;
}

/**
 * Decodes a unicode string back to HTML.
 * @function HTMLDecode
 * @param {string} unicodeCharacter The string to decode.
 * @returns {string} The decoded HTML string.
 */
export function HTMLDecode(unicodeCharacter: string): string
{
	const e = document.createElement("div");
	e.innerText = unicodeCharacter;
	return e.innerHTML;
}

/**
 * Returns the window where this element is attached (used in multi window applications)
 * @function GetElementWindow
 * @param {HTMLElement} element
 * @return {Window} the window element
 *
 */
export function GetElementWindow(element: HTMLElement): Window | undefined
{
	const doc = element.ownerDocument as CoreDocument;
	return doc.defaultView || doc.parentWindow;
}

/**
 * Helper, makes drag and drop easier by enabling drag and drop in a given element
 * @function CreateDropArea
 * @param {HTMLElement} element the element where users could drop items
 * @param {(evt: DragEvent) => boolean} onDrop function to call when the user drops the item
 * @param {(evt: DragEvent, element: HTMLElement) => void} onEnter [optional] function to call when the user drags something inside
 * @param {(evt: DragEvent, element: HTMLElement) => void} onExit [optional] function to call when the user drags something outside
 *
 */
export function CreateDropArea(element: HTMLElement,
	onDrop: (evt: DragEvent) => boolean,
	onEnter?: (evt: DragEvent, element: HTMLElement) => void,
	onExit?: (evt: DragEvent, element: HTMLElement) => void)
{
	element.addEventListener("dragenter", onDragEvent);

	function onDragEvent(evt: DragEvent)
	{
		element.addEventListener("dragexit", onDragEvent as EventListenerOrEventListenerObject);
		element.addEventListener("dragover", onDragEvent);
		element.addEventListener("drop", _onDrop);
		evt.stopPropagation();
		evt.preventDefault();
		if (evt.type == "dragenter" && onEnter)
		{
			onEnter(evt, element);
		}
		if (evt.type == "dragexit" && onExit)
		{
			onExit(evt, element);
		}
	}

	function _onDrop(evt: DragEvent)
	{
		evt.stopPropagation();
		evt.preventDefault();

		element.removeEventListener("dragexit", onDragEvent as EventListenerOrEventListenerObject);
		element.removeEventListener("dragover", onDragEvent);
		element.removeEventListener("drop", _onDrop);

		let r = undefined;
		if (onDrop)
		{
			r = onDrop(evt);
		}
		if (r)
		{
			evt.stopPropagation();
			evt.stopImmediatePropagation();
			return true;
		}
		return false;
	}
}