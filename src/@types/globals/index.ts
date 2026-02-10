import { Tabs } from "../../tabs";

declare global
{
    interface Window
    {
        tabs?: Tabs;
    }
}

export interface LiteGUIObject
{
    root: HTMLElement;
}
