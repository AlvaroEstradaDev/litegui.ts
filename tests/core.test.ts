import { LiteGUI } from "../src/core";
import { TriggerableElement } from "../src/utilities";

describe("Core (LiteGUI) Test", () =>
{

	describe("init", () =>
	{
		it("should initialize root and content", () =>
		{
			/*
			 * We can't easily re-run init if it modifies global state destructively,
			 * But we can check if it's already initialized or init with a new container.
			 */
			const container = document.createElement("div");
			container.id = "test-container";
			document.body.appendChild(container);

			// LiteGUI might be a singleton that's already initialized or we can re-init it with options
			LiteGUI.init({ container: "test-container", wrapped: true });

			expect(LiteGUI.root).toBeDefined();
			expect(LiteGUI.content).toBeDefined();
			expect(LiteGUI.container).toBe(container);

			document.body.removeChild(container);
		});
	});

	describe("bind / trigger / unbind", () =>
	{
		it("should bind and trigger custom events on regular objects", () =>
		{
			const obj: TriggerableElement = {__events: new EventTarget() };
			const callback = jest.fn();

			LiteGUI.bind(obj, "test-event", callback);
			LiteGUI.trigger(obj, "test-event", "payload");

			expect(callback).toHaveBeenCalled();
			// Check if payload is passed. LiteGUI.trigger passes params in e.detail
			expect(callback.mock.calls[0][0].detail).toBe("payload");

			LiteGUI.unbind(obj, "test-event", callback);
			LiteGUI.trigger(obj, "test-event", "payload2");
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should bind and trigger events on HTML elements", () =>
		{
			const el = document.createElement("div");
			const callback = jest.fn();

			LiteGUI.bind(el, "click", callback);
			// We can use standard dispatchEvent or LiteGUI.trigger
			el.click();
			expect(callback).toHaveBeenCalled();

			LiteGUI.unbind(el, "click", callback);
			el.click();
			expect(callback).toHaveBeenCalledTimes(1);
		});
	});

	describe("add / remove", () =>
	{
		it("should add element to content", () =>
		{
			const el = document.createElement("div");
			LiteGUI.add(el);
			expect(el.parentNode).toBe(LiteGUI.content);
			LiteGUI.remove(el);
			expect(el.parentNode).toBeNull();
		});

		it("should remove by selector", () =>
		{
			const el = document.createElement("div");
			el.className = "remove-me";
			document.body.appendChild(el);

			LiteGUI.remove(".remove-me");
			expect(document.querySelector(".remove-me")).toBeNull();
		});
	});

	describe("getById", () =>
	{
		it("should return element by id", () =>
		{
			const el = document.createElement("div");
			el.id = "find-me";
			document.body.appendChild(el);

			expect(LiteGUI.getById("find-me")).toBe(el);

			document.body.removeChild(el);
		});
	});
});
