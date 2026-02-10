import type { InspectorWidget } from "../@types/Inspector";
import { Inspector } from "./inspector";

/**
 * Creates a horizontal separator line in the inspector.
 * @function AddSeparator
 * @param {Inspector} that The inspector instance.
 * @returns {InspectorWidget} The separator widget element.
 */
export function AddSeparator(that: Inspector)
{
	const element = document.createElement("DIV") as InspectorWidget;
	element.className = "separator";
	that.appendWidget(element);
	return element;
}

declare module "./inspector" {
    interface Inspector
    {
        addSeparator(): InspectorWidget;
    }
}

Inspector.prototype.addSeparator = function (): InspectorWidget
{
	return AddSeparator(this);
};

Inspector.widgetConstructors.separator = "addSeparator";