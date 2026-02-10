import { AddCheckboxOptions, InspectorCheckboxWidget } from "./checkbox";
import { Inspector } from "./inspector";

export interface AddFlagsOptions
{
	/**
	 * Default options applied to all checkboxes unless overridden.
	 */
	default: AddCheckboxOptions,
	/**
	 * Specific options for individual flags, keyed by flag name.
	 */
	[key: string]: AddCheckboxOptions
}

/**
 * Creates a set of checkboxes to edit multiple boolean values (flags).
 * @function AddFlags
 * @param {Inspector} that - The Inspector instance.
 * @param {{ [key: string]: boolean }} flags - Object containing the boolean flags to edit.
 * @param {{ [key: string]: (boolean | undefined) }} [forceFlags] - Optional object with extra flags to include, even if not present in the main flags object.
 * @param {AddCheckboxOptions | AddFlagsOptions} [options] - Configuration options. Can be a single options object for all, or an AddFlagsOptions map.
 * @returns {InspectorCheckboxWidget[]} An array of the created checkbox widgets.
 */
export function AddFlags(that: Inspector, flags: { [key: string]: boolean }, forceFlags?: { [key: string]: (boolean | undefined) },
	options?: AddCheckboxOptions | AddFlagsOptions): InspectorCheckboxWidget[]
{
	options = options ?? {};

	// Create a local copy of flags to iterate over, ensuring we capture all keys
	const f: { [key: string]: boolean } = {};
	for (const i in flags)
	{
		f[i] = flags[i];
	}

	// Merge forced flags if provided
	if (forceFlags)
	{
		for (const i in forceFlags)
		{
			// Only add if not already present in the source flags
			if (typeof f[i] == "undefined")
			{
				f[i] = forceFlags[i] ?? false;
			}
		}
	}

	let defaultOpt: AddCheckboxOptions | undefined = undefined;
	// Check if options contains a 'default' configuration
	if ("default" in options)
	{
		defaultOpt = (options as AddFlagsOptions).default;
	}

	const result: InspectorCheckboxWidget[] = [];
	for (const i in f)
	{
		let opt: AddCheckboxOptions | undefined = undefined;

		// Determine options for this specific flag
		if (i in options)
		{
			opt = (options as AddFlagsOptions)[i];
		}
		else if (defaultOpt)
		{
			opt = defaultOpt;
		}
		else
		{
			opt = options as AddCheckboxOptions;
		}

		const flagOptions: AddCheckboxOptions = { ...opt };

		// Callback to update the original flags object
		flagOptions.callback = function (v: boolean)
		{
			flags[i] = v;
		};

		result.push(that.addCheckbox(i, f[i], flagOptions));
	}
	return result;
}

declare module "./inspector" {
	interface Inspector
	{
		addFlags(flags: { [key: string]: boolean }, forceFlags?: { [key: string]: (boolean | undefined) }, options?: AddCheckboxOptions | AddFlagsOptions): InspectorCheckboxWidget[];
	}
}

Inspector.prototype.addFlags = function (flags: { [key: string]: boolean }, forceFlags?: { [key: string]: (boolean | undefined) }, options?: AddCheckboxOptions | AddFlagsOptions): InspectorCheckboxWidget[]
{
	return AddFlags(this, flags, forceFlags, options);
};

Inspector.widgetConstructors.flags = "addFlags";
