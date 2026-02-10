import { LiteGUI } from "../core";
import { Inspector } from "./inspector";
import { LineEditor, LineEditorElement, LineEditorOptions } from "../widgets";
import { InspectorWidget, WidgetChangeOptions } from "../@types/Inspector";

/**
 * Adds a line editor widget to the inspector with the specified name, value, and options.
 * @function AddLine
 *
 * @param {Inspector} that - The reference to the inspector
 * @param {string} name - The name of the line widget.
 * @param {number[][]} value - The initial value of the file input widget.
 * @param {LineEditorOptions} [options] - The options for the file input widget.
 * @returns The created file input widget element.
 */
export function AddLineEditor(that: Inspector, name: string, value: number[][], options: LineEditorOptions)
{
	that.values.set(name, value);

	const element = that.createWidget(name, "<span class='line-editor'></span>", options);
	element.style.width = "100%";

	const lineEditor: LineEditor = new LineEditor(value, options);
	const lineEditorSpan: HTMLElement | null = element.querySelector("span.line-editor");
	lineEditorSpan?.appendChild(lineEditor.root);

	LiteGUI.bind(lineEditor, "change", (e: Event) =>
	{
		const target = e.target as LineEditorElement;
		LiteGUI.trigger(element, "wbeforechange", target.valuesArray);
		if (options.callback) { options.callback.call(element, target.valuesArray, e); }
		LiteGUI.trigger(element, "wchange", target.valuesArray);
		that.onWidgetChange(element, name, target.valuesArray, options as unknown as WidgetChangeOptions);
	});

	that.appendWidget(element, options);
	return element;
}

declare module "./inspector" {
	interface Inspector
	{
		addLineEditor(name: string, value: number[][], options?: LineEditorOptions): InspectorWidget;
	}
}

Inspector.prototype.addLineEditor = function (name: string, value: number[][], options?: LineEditorOptions): InspectorWidget
{
	return AddLineEditor(this, name, value, options ?? {});
};

Inspector.widgetConstructors.line = "addLineEditor";