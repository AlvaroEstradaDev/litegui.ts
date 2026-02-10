import { CloneInsides, SizeToCSS, RGBAToHEXA, BeautifyCode, BeautifyJSON, PurgeElement, AssignValue, CollectProperties, IsCursorOverElement, SafeName, CloneObject, DataURItoBlob, FocusElement, BlurElement, GetRect, EscapeHtmlEntities, GetById, Bind, Unbind, RemoveElement, RemoveClass, CreateElement, CreateListItem, CreateButton, GetParents, Trigger, InstanceHolder } from "../src/utilities";

describe("Utilities Test", () =>
{
	describe("CloneInsides", () =>
	{
		it("should shallow clone an object", () =>
		{
			const original = { a: 1, b: "test", c: { d: 2 } };
			const clone = CloneInsides(original);
			expect(clone).not.toBe(original);
			expect(clone).toEqual(original);
			expect(clone.c).toBe(original.c);
		});

		it("should copy properties to target", () =>
		{
			const original = { a: 1 };
			const target = { b: 2 };
			CloneInsides(original, target);
			expect(target).toEqual({ a: 1, b: 2 });
		});

		it("should handle empty original", () =>
		{
			const clone = CloneInsides();
			expect(clone).toEqual({});
		});
	});

	describe("sizeToCSS", () =>
	{
		it("should convert number to px", () =>
		{
			expect(SizeToCSS(100)).toBe("100px");
			expect(SizeToCSS(0)).toBe("0px");
		});

		it("should return string as is", () =>
		{
			expect(SizeToCSS("50%")).toBe("50%");
			expect(SizeToCSS("calc(100% - 10px)")).toBe("calc(100% - 10px)");
		});

		it("should handle negative numbers", () =>
		{
			expect(SizeToCSS(-20)).toBe("calc( 100% - 20px )");
		});

		it("should return undefined for undefined", () =>
		{
			expect(SizeToCSS(undefined)).toBeUndefined();
		});
	});

	describe("RGBAToHEXA", () =>
	{
		it("should convert RGBA to Hex string", () =>
		{
			expect(RGBAToHEXA([0, 0, 0, 255])).toBe("#000000ff");
			expect(RGBAToHEXA([255, 255, 255, 255])).toBe("#ffffffff");
			expect(RGBAToHEXA([255, 0, 0, 128])).toBe("#ff000080");
		});

		it("should pad single digit hex values", () =>
		{
			expect(RGBAToHEXA([10, 10, 10, 10])).toBe("#0a0a0a0a");
		});
	});

	describe("beautifyCode", () =>
	{
		it("should wrap keywords in spans", () =>
		{
			const code = "function test() { return true; }";
			const beautified = BeautifyCode(code, ["function", "return", "true"], true);
			expect(beautified).toContain("<span class='rsv'>function</span>");
			expect(beautified).toContain("<span class='rsv'>return</span>");
			expect(beautified).toContain("<span class='rsv'>true</span>");
		});

		it("should highlight strings", () =>
		{
			const code = 'const s = "hello";';
			const beautified = BeautifyCode(code, ["const"], true);
			expect(beautified).toContain("<span class='str'>\"hello\"</span>");
		});
	});

	describe("beautifyJSON", () =>
	{
		it("should highlight keys and values", () =>
		{
			const json = { a: 1, b: "test" };
			const beautified = BeautifyJSON(JSON.stringify(json), true);
			expect(beautified).toContain("<span class='str'>\"a\"</span>");
			expect(beautified).toContain("<span class='num'>1</span>");
			expect(beautified).toContain("<span class='str'>\"test\"</span>");
		});
	});

	describe("purgeElement", () =>
	{
		it("should remove properties corresponding to attributes", () =>
		{
			const el = document.createElement("div");
			el.setAttribute("onclick", "void(0)");
			el.onclick = function () { };

			expect(el.onclick).not.toBeNull();
			PurgeElement(el);
			expect(el.onclick).toBeNull();
		});

		it("should traverse children", () =>
		{
			const parent = document.createElement("div");
			const child = document.createElement("div");
			parent.appendChild(child);

			child.setAttribute("onclick", "void(0)");
			child.onclick = function () { };

			PurgeElement(parent);
			expect(child.onclick).toBeNull();
		});
	});

	describe("AssignValue", () =>
	{
		it("should assign null values directly", () =>
		{
			const instance = { value: "test" };
			const holder: InstanceHolder = { instance, name: "value" };
			AssignValue(holder, null);
			expect(instance.value).toBeNull();
		});

		it("should parse numbers when current value is number", () =>
		{
			const instance = { value: 42 };
			const holder: InstanceHolder = { instance, name: "value" };
			AssignValue(holder, "123");
			expect(instance.value).toBe(123);
		});

		it("should assign strings directly", () =>
		{
			const instance = { value: "original" };
			const holder: InstanceHolder = { instance, name: "value" };
			AssignValue(holder, "new value");
			expect(instance.value).toBe("new value");
		});

		it("should update array elements when both are arrays", () =>
		{
			const instance = { coords: [1, 2, 3] };
			const holder: InstanceHolder = { instance, name: "coords" };
			AssignValue(holder, [10, 20, 30]);
			expect((instance.coords as number[])[0]).toBe(10);
			expect((instance.coords as number[])[1]).toBe(20);
		});
	});

	describe("CollectProperties", () =>
	{
		it("should skip properties with constructors (numbers, strings, booleans)", () =>
		{
			const obj = { a: 1, b: "test", c: true };
			const props = CollectProperties(obj);
			expect(props).toEqual({});
		});

		it("should skip properties with object values (no @ marker)", () =>
		{
			const obj = { data: { x: 1 }, a: 1 };
			const props = CollectProperties(obj);
			expect(props).toEqual({});
		});

		it("should skip properties starting with _", () =>
		{
			const obj = { a: 1, _private: "hidden", b: 2 };
			const props = CollectProperties(obj);
			expect(props).not.toHaveProperty("_private");
		});

		it("should skip properties starting with @", () =>
		{
			const obj = { a: 1, "@special": "skip", b: 2 };
			const props = CollectProperties(obj);
			expect(props).not.toHaveProperty("@special");
		});

		it("should skip jQuery properties", () =>
		{
			const obj = { a: 1, jQuery123: "skip", b: 2 };
			const props = CollectProperties(obj);
			expect(props).not.toHaveProperty("jQuery123");
		});
	});

	describe("IsCursorOverElement", () =>
	{
		it("should return false when rect is null", () =>
		{
			const el = document.createElement("div");
			const event = new MouseEvent("mousemove", { bubbles: true });
			Object.defineProperty(event, "pageX", { value: 50 });
			Object.defineProperty(event, "pageY", { value: 50 });

			expect(IsCursorOverElement(event, el)).toBe(false);
		});

		it("should return true when cursor is inside element (Mocked Rect)", () =>
		{
			const el = document.createElement("div");

			// Mock getBoundingClientRect
			jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 100,
				top: 100,
				right: 200,
				bottom: 200,
				width: 100,
				height: 100,
				x: 100,
				y: 100,
				toJSON: () => { }
			});

			// Event inside the rect (100,100 to 200,200)
			const event = new MouseEvent("mousemove", { bubbles: true });
			Object.defineProperty(event, "pageX", { value: 150 });
			Object.defineProperty(event, "pageY", { value: 150 });

			expect(IsCursorOverElement(event, el)).toBe(true);
		});

		it("should return false when outside element bounds", () =>
		{
			const el = document.createElement("div");

			// Mock getBoundingClientRect for consistent testing
			const rect = {
				left: 100,
				top: 100,
				right: 200,
				bottom: 200,
				width: 100,
				height: 100,
				x: 100,
				y: 100,
				toJSON: () => {}
			};
			jest.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect);

			const event = new MouseEvent("mousemove", { bubbles: true });
			// Cursor at 300,300 is outside the 100-200 range
			Object.defineProperty(event, "pageX", { value: rect.left + 200 });
			Object.defineProperty(event, "pageY", { value: rect.top + 200 });

			expect(IsCursorOverElement(event, el)).toBe(false);
		});
	});

	describe("SafeName", () =>
	{
		it("should remove spaces from string", () =>
		{
			expect(SafeName("hello world")).toBe("helloworld");
			expect(SafeName("  spaced out  ")).toBe("spacedout");
		});

		it("should remove dots from string", () =>
		{
			expect(SafeName("file.name.txt")).toBe("filenametxt");
		});

		it("should handle empty string", () =>
		{
			expect(SafeName("")).toBe("");
		});

		it("should handle string with only spaces and dots", () =>
		{
			expect(SafeName("   ..   ")).toBe("");
		});

		it("should convert to string", () =>
		{
			expect(SafeName(123 as unknown as string)).toBe("123");
		});
	});

	describe("CloneObject", () =>
	{
		it("should clone primitive types", () =>
		{
			const source = { a: 1, b: "test", c: true };
			const clone = CloneObject(source, undefined);
			expect(clone).toEqual(source);
			expect(clone).not.toBe(source);
		});

		it("should clone nested objects", () =>
		{
			const source = { a: 1, nested: { b: 2, c: { d: 3 } } };
			const clone = CloneObject(source, undefined);
			expect(clone.nested).not.toBe(source.nested);
			expect(clone.nested.c).not.toBe(source.nested.c);
			expect(clone).toEqual(source);
		});

		it("should clone arrays", () =>
		{
			const source = { items: [1, 2, 3] };
			const clone = CloneObject(source, undefined);
			expect(clone.items).not.toBe(source.items);
			expect(clone.items).toEqual(source.items);
		});

		it("should convert Float32Array to regular array", () =>
		{
			const source = { data: new Float32Array([1.1, 2.2, 3.3]) };
			const clone = CloneObject(source, undefined);
			expect(Array.isArray(clone.data)).toBe(true);
			expect(clone.data.length).toBe(3);
			expect(clone.data[0]).toBeCloseTo(1.1, 5);
			expect(clone.data[1]).toBeCloseTo(2.2, 5);
			expect(clone.data[2]).toBeCloseTo(3.3, 5);
		});

		it("should skip functions", () =>
		{
			const source = { a: 1, method: () => { return 42; } };
			const clone = CloneObject(source, undefined);
			expect(clone).not.toHaveProperty("method");
		});

		it("should skip properties starting with _", () =>
		{
			const source = { a: 1, _private: "hidden" };
			const clone = CloneObject(source, undefined);
			expect(clone).not.toHaveProperty("_private");
		});
	});

	describe("DataURItoBlob", () =>
	{
		it("should convert data URI to Blob", () =>
		{
			const dataURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
			const blob = DataURItoBlob(dataURI);
			expect(blob).toBeInstanceOf(Blob);
			expect(blob.size).toBeGreaterThan(0);
		});

		it("should handle text data URI", () =>
		{
			const dataURI = "data:text/plain;base64,SGVsbG8gV29ybGQ=";
			const blob = DataURItoBlob(dataURI);
			expect(blob).toBeInstanceOf(Blob);
			expect(blob.size).toBeGreaterThan(0);
		});
	});

	describe("FocusElement / BlurElement", () =>
	{
		it("should focus and blur element without throwing", () =>
		{
			const el = document.createElement("input");
			document.body.appendChild(el);

			expect(() => FocusElement(el)).not.toThrow();
			expect(el).toBe(document.activeElement);

			expect(() => BlurElement(el)).not.toThrow();

			document.body.removeChild(el);
		});
	});

	describe("GetRect", () =>
	{
		it("should return a DOMRect object", () =>
		{
			const el = document.createElement("div");
			document.body.appendChild(el);

			const rect = GetRect(el);
			expect(rect).toBeDefined();
			expect(rect.width).toBeGreaterThanOrEqual(0);
			expect(rect.height).toBeGreaterThanOrEqual(0);

			document.body.removeChild(el);
		});
	});

	describe("EscapeHtmlEntities", () =>
	{
		it("should escape HTML special characters (< > &)", () =>
		{
			expect(EscapeHtmlEntities("<>&")).toBe("&lt;&gt;&amp;");
		});

		it("should escape nbsp character (charCode 160)", () =>
		{
			expect(EscapeHtmlEntities(String.fromCharCode(160))).toBe("&nbsp;");
		});

		it("should handle empty string", () =>
		{
			expect(EscapeHtmlEntities("")).toBe("");
		});

		it("should escape accented characters", () =>
		{
			expect(EscapeHtmlEntities("á")).toBe("&aacute;");
		});

		it("should escape characters in the defined range", () =>
		{
			expect(EscapeHtmlEntities(String.fromCharCode(161))).toBe("&iexcl;");
		});
	});

	describe("GetById", () =>
	{
		it("should return element by id", () =>
		{
			const el = document.createElement("div");
			el.id = "test-getbyid";
			document.body.appendChild(el);

			expect(GetById("test-getbyid")).toBe(el);

			document.body.removeChild(el);
		});

		it("should return null for non-existent id", () =>
		{
			expect(GetById("non-existent-id")).toBeNull();
		});
	});

	describe("Bind / Unbind", () =>
	{
		it("should bind event to HTML element", () =>
		{
			const el = document.createElement("div");
			const callback = jest.fn();

			Bind(el, "click", callback);
			el.click();

			expect(callback).toHaveBeenCalledTimes(1);

			Unbind(el, "click", callback);
			el.click();

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should bind event to regular object", () =>
		{
			const obj = {};
			const callback = jest.fn();

			Bind(obj, "custom-event", callback);
			Trigger(obj, "custom-event", "data");

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should throw on bind without callback", () =>
		{
			const el = document.createElement("div");
			expect(() => Bind(el, "click", null as unknown as EventListener)).toThrow("Bind callback missing");
		});

		it("should bind to array of elements", () =>
		{
			const el1 = document.createElement("div");
			const el2 = document.createElement("div");
			const callback = jest.fn();

			Bind([el1, el2], "test", callback);
			Trigger(el1, "test");
			Trigger(el2, "test");

			expect(callback).toHaveBeenCalledTimes(2);
		});
	});

	describe("RemoveElement", () =>
	{
		it("should remove element from DOM", () =>
		{
			const el = document.createElement("div");
			el.id = "remove-test";
			document.body.appendChild(el);

			expect(document.getElementById("remove-test")).not.toBeNull();

			RemoveElement(el);

			expect(document.getElementById("remove-test")).toBeNull();
		});

		it("should remove by selector string", () =>
		{
			const el = document.createElement("div");
			el.className = "remove-by-selector";
			document.body.appendChild(el);

			RemoveElement(".remove-by-selector");

			expect(document.querySelector(".remove-by-selector")).toBeNull();
		});

		it("should remove LiteGUI object by root property", () =>
		{
			const widget = { root: document.createElement("div") };
			document.body.appendChild(widget.root);

			RemoveElement(widget as unknown as { root: HTMLElement });

			expect(widget.root.parentNode).toBeNull();
		});

		it("should handle array of elements", () =>
		{
			const el1 = document.createElement("div");
			const el2 = document.createElement("div");
			el1.className = "array-remove-1";
			el2.className = "array-remove-2";
			document.body.appendChild(el1);
			document.body.appendChild(el2);

			RemoveElement([el1, el2]);

			expect(document.querySelector(".array-remove-1")).toBeNull();
			expect(document.querySelector(".array-remove-2")).toBeNull();
		});
	});

	describe("RemoveClass", () =>
	{
		it("should remove class from matching elements within container", () =>
		{
			const container = document.createElement("div");
			const el = document.createElement("div");
			el.className = "test-class other-class";
			container.appendChild(el);
			document.body.appendChild(container);

			RemoveClass(container, "test-class");

			expect(el.className).not.toContain("test-class");
			expect(el.className).toContain("other-class");

			document.body.removeChild(container);
		});

		it("should remove class from direct element when using document", () =>
		{
			const el = document.createElement("div");
			el.className = "direct-class other-class";
			document.body.appendChild(el);

			RemoveClass(document.body, "direct-class");

			expect(el.className).not.toContain("direct-class");
			expect(el.className).toContain("other-class");

			document.body.removeChild(el);
		});

		it("should use selector to find elements", () =>
		{
			const container = document.createElement("div");
			const el1 = document.createElement("div");
			const el2 = document.createElement("div");
			el1.className = "shared-class";
			el2.className = "shared-class";
			container.appendChild(el1);
			container.appendChild(el2);
			document.body.appendChild(container);

			RemoveClass(container, "div", "shared-class");

			expect(el1.className).not.toContain("shared-class");
			expect(el2.className).not.toContain("shared-class");

			document.body.removeChild(container);
		});
	});

	describe("CreateElement", () =>
	{
		it("should create element with tag and class", () =>
		{
			const el = CreateElement("div", ".my-class", "content");
			expect(el.tagName).toBe("DIV");
			expect(el.classList.contains("my-class")).toBe(true);
		});

		it("should create element with id", () =>
		{
			const el = CreateElement("div", "#my-id", "");
			expect(el.id).toBe("my-id");
		});

		it("should create element with multiple classes and id", () =>
		{
			const el = CreateElement("div", "#id .class1 .class2", "");
			expect(el.id).toBe("id");
			expect(el.classList.contains("class1")).toBe(true);
			expect(el.classList.contains("class2")).toBe(true);
		});

		it("should set innerHTML content", () =>
		{
			const el = CreateElement("div", "", "<span>Hello</span>");
			expect(el.innerHTML).toContain("<span>Hello</span>");
		});

		it("should have add method", () =>
		{
			const el = CreateElement("div", "", "");
			const child = document.createElement("div");
			el.add(child);
			expect(el.contains(child)).toBe(true);
		});
	});

	describe("CreateListItem", () =>
	{
		it("should create element from template", () =>
		{
			const code = "<div><span class='content'></span></div>";
			const elem = CreateListItem(code, {});
			expect(elem.tagName).toBe("DIV");
		});

		it("should apply style", () =>
		{
			const code = "<div><span></span></div>";
			// Cast to any to bypass TS error and check runtime logic
			const elem = CreateListItem(code, {}, { color: "blue" } as Record<string, string>);
			expect(elem.style.color).toBe("blue");
		});

		it("should create list item from template and values", () =>
		{
			const code = "<div><span class='title'></span><span class='desc'></span></div>";
			const elem = CreateListItem(code, { ".title": "Hello", ".desc": "World" });
			const titleSpan = elem.querySelector(".title") as HTMLElement;
			const descSpan = elem.querySelector(".desc") as HTMLElement;

			expect(titleSpan.innerText).toBe("Hello");
			expect(descSpan.innerText).toBe("World");
		});
	});

	describe("CreateButton", () =>
	{
		it("should create button with class", () =>
		{
			const btn = CreateButton(".my-button", "Click me", () => {}, "");
			expect(btn.tagName).toBe("BUTTON");
			expect(btn.classList.contains("litebutton")).toBe(true);
			expect(btn.textContent).toBe("Click me");
		});

		it("should set id", () =>
		{
			const btn = CreateButton("#submit-btn", "Submit", () => {}, "");
			expect(btn.id).toBe("submit-btn");
		});

		it("should call callback on click", () =>
		{
			const callback = jest.fn();
			const btn = CreateButton("", "Test", callback, "");
			btn.click();
			expect(callback).toHaveBeenCalledTimes(1);
		});
	});

	describe("GetParents", () =>
	{
		it("should return array of parent elements", () =>
		{
			const container = document.createElement("div");
			const parent = document.createElement("div");
			const child = document.createElement("span");
			container.appendChild(parent);
			parent.appendChild(child);
			document.body.appendChild(container);

			const parents = GetParents(child);

			expect(parents.length).toBeGreaterThanOrEqual(1);
			expect(parents[0]).toBe(child);

			document.body.removeChild(container);
		});
	});

});

describe('Event Binding Edge Cases (Bind/Unbind)', () =>
{
	it('should bind events to all elements via querySelectorAll NodeList', () =>
	{
		const container = document.createElement("div");
		container.innerHTML = '<span class="target"></span><span class="target"></span><span class="target"></span>';
		document.body.appendChild(container);

		const callbacks: number[] = [];
		const nodes = container.querySelectorAll(".target");

		Bind(nodes, "test_event", () => { callbacks.push(1); });

		// Trigger on each element
		for (let i = 0; i < nodes.length; i++)
		{
			Trigger(nodes[i], "test_event");
		}

		expect(callbacks.length).toBe(3);

		document.body.removeChild(container);
	});

	it('should unbind events on regular objects', () =>
	{
		const obj = {} as Record<string, unknown>;
		let callCount = 0;
		const cb = () => { callCount++; };

		Bind(obj, "custom_evt", cb);
		Trigger(obj, "custom_evt");
		expect(callCount).toBe(1);

		Unbind(obj as unknown as HTMLElement, "custom_evt", cb);
		Trigger(obj, "custom_evt");
		// After unbind, callback should not fire again
		expect(callCount).toBe(1);
	});

	it('should throw when Bind is called with null element', () =>
	{
		expect(() => Bind(null as unknown as HTMLElement, "click", () => {})).toThrow("Cannot bind to null");
	});

	it('should throw when Bind is called with empty event string', () =>
	{
		const el = document.createElement("div");
		expect(() => Bind(el, "", () => {})).toThrow("Event bind missing");
	});

	it('should return event without error when Trigger is called on non-object', () =>
	{
		const evt = Trigger(null, "test_event");
		expect(evt).toBeInstanceOf(CustomEvent);
		expect(evt.type).toBe("test_event");

		const evt2 = Trigger(undefined, "test_event");
		expect(evt2).toBeInstanceOf(CustomEvent);

		const evt3 = Trigger(42, "some_event", { data: true });
		expect(evt3).toBeInstanceOf(CustomEvent);
		expect(evt3.detail).toEqual({ data: true });
	});
});
