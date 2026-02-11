import type { Tabs } from "../../tabs";
import type { Core } from "../../core";

declare global
{
    interface Window
    {
        tabs?: Tabs;
		LiteGUI?: Core;
    }
}

export interface LiteGUIObject
{
    root: HTMLElement;
}
