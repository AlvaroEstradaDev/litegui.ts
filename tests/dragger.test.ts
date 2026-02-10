import { LiteGUI } from "../src/core";

describe("Dragger Init test", () =>
{
	const options = { disabled: false };
	it("Should be defined", () =>
	{
		expect(new LiteGUI.Dragger(0.5, options)).toBeDefined();
	});
});

describe("Dragger set range test", () =>
{
	const options = { disabled: false };
	const dragger = new LiteGUI.Dragger(0.5, options);
	dragger.setRange(0.1, 0.9);
	it("Dragger options min and max should be 0.1 and 0.9", () =>
	{
		expect(dragger.options.min).toBe(0.1);
		expect(dragger.options.max).toBe(0.9);
	});
});

describe("Dragger set value test", () =>
{
	const options = { disabled: false };
	const dragger = new LiteGUI.Dragger(0.5, options);
	dragger.setValue(1, true);
	it("Value should be 1", () =>
	{
		expect(dragger.getValue()).toBe(1);
	});
});

describe("Dragger get value test", () =>
{
	const options = { disabled: false };
	const dragger = new LiteGUI.Dragger(0.5, options);
	it("Value should be 0.5", () =>
	{
		expect(dragger.getValue()).toBe(0.5);
	});
});

describe("Dragger interactivity test", () =>
{
	it("Should update value when dragged", () =>
	{
		const options = { disabled: false, step: 0.1, linear: true };
		const dragger = new LiteGUI.Dragger(0, options);

		if (!dragger.root.requestPointerLock)
		{
			dragger.root.requestPointerLock = jest.fn();
		}

		const dragWidget = dragger.root.querySelector(".drag_widget");
		const input = dragger.root.querySelector("input");

		if (!dragWidget || !input)
		{
			throw new Error("Dragger DOM structure is invalid");
		}

		const changeSpy = jest.fn();
		input.addEventListener("change", changeSpy);

		dragWidget.dispatchEvent(new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
			screenX: 100,
			screenY: 100
		}));

		expect(dragger.dragging).toBe(true);

		document.dispatchEvent(new MouseEvent("mousemove", {
			bubbles: true,
			cancelable: true,
			screenX: 100,
			screenY: 90,
			movementX: 0,
			movementY: -10
		} as MouseEventInit));

		expect(changeSpy).toHaveBeenCalled();
		expect(parseFloat(input.value)).toBeCloseTo(1.0);
		document.dispatchEvent(new MouseEvent("mouseup", {
			bubbles: true,
			cancelable: true
		}));

		expect(dragger.dragging).toBe(false);
	});
});