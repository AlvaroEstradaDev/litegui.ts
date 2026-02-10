import { CreateWidgetOptions, WidgetChangeOptions } from "../@types/Inspector";
import { Inspector } from "./inspector";

/**
 * Interface representing the response data when a file is added.
 * Extends the standard File interface.
 */
export interface FileAddedResponse extends File
{
	/**
	 * The list of files selected.
	 */
	files: FileList,
	/**
	 * The generated object URL for the file, if requested.
	 */
	url?: string,
	/**
	 * The file content, read as binary, data URL, or text.
	 */
	data?: string | ArrayBuffer | null
}

/**
 * Configuration options for the file input widget.
 */
export interface AddFileOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	/**
	 * The types of files that the server accepts (e.g., ".jpg, .png" or ["image/*"]).
	 */
	accept?: string | string[];
	/**
	 * If true, creates an object URL for the selected file.
	 */
	generateURL?: boolean;
	/**
	 * Format to read the file content in.
	 */
	readFile?: "binary" | "data_url" | string;
	/**
	 * Callback function to execute when a file is added/changed.
	 */
	callbacks?: (data: FileAddedResponse) => void;
}

/**
 * Adds a file input widget to the inspector.
 * @function AddFile
 * @param {Inspector} that The inspector instance.
 * @param {string} name The name of the widget.
 * @param {string} [value] The initial value (filename).
 * @param {((data: FileAddedResponse) => void) | AddFileOptions} [options] The options for the widget or a callback.
 * @returns {HTMLElement} The created widget element.
 */
export function AddFile(that: Inspector, name: string, value?: string, options?: ((data: FileAddedResponse) => void) | AddFileOptions)
{
	that.values.set(name, { name: value ?? "" });
	const processedOptions: AddFileOptions = that.processOptions(options);

	// Create the widget HTML structure
	const element = that.createWidget(name, "<span class='inputfield full whidden' style='width: calc(100% - 26px)'><span class='filename'></span></span><button class='litebutton' style='width:20px; margin-left: 2px;'>...</button><input type='file' size='100' class='file' value='" + value + "'/>", processedOptions);
	const content = element.querySelector(".wcontent") as HTMLElement;
	content.style.position = "relative";
	const input = element.querySelector(".wcontent input") as HTMLInputElement;

	// Set accept attribute if provided
	if (processedOptions.accept)
	{
		input.accept = typeof (processedOptions.accept) === "string" ? processedOptions.accept : processedOptions.accept.toString();
	}
	const filenameEl = element.querySelector(".wcontent .filename") as HTMLElement;
	if (value) { filenameEl.innerText = value; }

	// Handle file selection change
	input.addEventListener("change", (e: Event) =>
	{
		if (!e || !e.target) { return; }
		const target = e.target as HTMLInputElement;
		if (!target.files) { return; }
		if (!target.files.length)
		{
			// Clear filename if no file selected
			filenameEl.innerText = "";
			that.onWidgetChange(element, name, undefined, processedOptions);
			return;
		}

		const result = target.files[0] as FileAddedResponse;
		result.files = target.files;
		if (processedOptions.generateURL) { result.url = URL.createObjectURL(target.files[0]); }
		filenameEl.innerText = result.name;

		// Read file content if requested
		if (processedOptions.readFile)
		{
			const reader = new FileReader();
			reader.onload = (e2: ProgressEvent<FileReader>) =>
			{
				result.data = e2.target?.result;
				that.onWidgetChange(element, name, result, processedOptions);
			};
			if (processedOptions.readFile == "binary")
			{
				reader.readAsArrayBuffer(result);
			}
			else if (processedOptions.readFile == "data_url")
			{
				reader.readAsDataURL(result);
			}
			else
			{
				reader.readAsText(result);
			}
		}
		else
		{
			that.onWidgetChange(element, name, result, processedOptions);
		}
	});

	that.appendWidget(element, processedOptions);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addFile(name: string, value?: string, options?: ((data: FileAddedResponse) => void) | AddFileOptions): HTMLElement;
	}
}

Inspector.prototype.addFile = function (name: string, value?: string, options?: ((data: FileAddedResponse) => void) | AddFileOptions): HTMLElement
{
	return AddFile(this, name, value, options);
};

Inspector.widgetConstructors.file = "addFile";