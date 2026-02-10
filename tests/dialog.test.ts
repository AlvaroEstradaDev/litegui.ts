import { LiteGUI } from "../src/core";
import { Dialog } from "../src/dialog";
import { Dragger } from "../src/dragger";

describe("Dialog initialize test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	it("Should be defined", () =>
	{
		expect(new Dialog(options)).toBeDefined();
	});
});

describe("Dialog get dialog test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	it("Should return dialog", () =>
	{
		document.body.appendChild(dialog.root);
		expect(dialog.getDialog("testDialog")).toBeDefined();
	});
});


describe("Dialog constructor test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);

	it("Root should be defined", () =>
	{
		expect(dialog.root).toBeDefined();
	});
});


describe("Dialog add test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: false, detachable: true
	};
	const dialog = new Dialog(options);
	const dragger = new Dragger(0, { disabled: false });
	dialog.add(dragger);
	it("Dialog should contain a dragger element", () =>
	{
		expect((dialog.content as HTMLDivElement)?.childNodes[0]).toBe(dragger.root);
	});
});

describe("Dialog enable properties test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: false, draggable: false, detachable: true
	};
	const dialog = new Dialog(options);
	jest.spyOn(dialog, 'setResizable');
	it("Dialog resizable and draggable should be active", () =>
	{
		dialog.enableProperties({ resizable: true, draggable: true, });
		expect(dialog.setResizable).toHaveBeenCalled();
		expect(dialog.draggable).toBe(true);
	});
});
describe("Dialog set resizable test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: false, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	dialog.setResizable();
	it("Resizable property should be true", () =>
	{
		expect(dialog.resizable);
	});
});

describe("Dialog dock to test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true, width: 800, height: 800 });
	const dialog = new Dialog(options);
	it("Dialog should dock to main window", () =>
	{
		dialog.dockTo(LiteGUI.root);
		expect(dialog.root.style.width).toBe("100%");
		expect(dialog.root.style.height).toBe("100%");
	});
});

describe("Dialog add button test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	const button = dialog.addButton("myButton", { name: "myButton" });
	it("Dialog should add button", () =>
	{
		expect(button).toBeInstanceOf(HTMLButtonElement);
	});
});

describe("Dialog highlight test", () =>
{
	jest.useFakeTimers();
	jest.spyOn(global, 'setTimeout');
	const focus = window.focus;
	window.focus = jest.fn(() => ({}));
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const highlightTime = 200;
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	it("Dialog should highlight", () =>
	{
		dialog.highlight(highlightTime);
		expect(setTimeout).toHaveBeenCalled();
		expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), highlightTime);
		window.focus = focus;
	});
});

describe("Dialog minimize test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true, fullcontent: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	dialog.setSize(1000, 1200);
	dialog.minimize();
	it("Dialog should minimize", () =>
	{
		expect(dialog.root?.style.width).toBe(Dialog.MINIMIZED_WIDTH + "px");
	});
});

describe("Dialog arrange minimized test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	dialog.setSize(1000, 1200);
	dialog.minimize();
	it("Dialog should have a top property", () =>
	{
		dialog.arrangeMinimized();
		expect(dialog.root!.style.top).toBe("-20px");
	});
});

describe("Dialog maximize test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true, fullcontent: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	dialog.minimize();
	it("Dialog should maximize", () =>
	{
		dialog.maximize();
		const uDialog = dialog as unknown as object;
		const oldBox = "_oldBox" in uDialog ? uDialog._oldBox : null;
		expect(dialog.root?.style.width).toBe((typeof oldBox === "object" && oldBox !== null &&
			"width" in oldBox ? oldBox.width : 0) + "px");
	});
});

describe("Dialog make modal test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	it("modaldiv should contain dialog", () =>
	{
		dialog.makeModal();
		expect(LiteGUI.modalBackground?.childNodes.length).toBeGreaterThan(0);
	});
});

describe("Dialog bring to front test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	it("Dialog should bring its root to front", () =>
	{
		dialog.bringToFront();
		expect(dialog.root?.parentNode?.childNodes[dialog.root?.parentNode?.childNodes.length - 1]).toBe(dialog.root);
	});
});

describe("Dialog show test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	dialog.hide();
	it("Dialog should show", () =>
	{
		dialog.show();
		expect(dialog.root!.style.display).toBe("");
	});
});

describe("Dialog hide test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	it("Dialog should hide", () =>
	{
		dialog.hide();
		expect(dialog.root!.style.display).toBe("none");
	});
});

describe("Dialog fade in test", () =>
{
	jest.useFakeTimers();
	jest.spyOn(global, 'setTimeout');
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	const fadeTime = 300;
	it("Dialog should fade in", () =>
	{
		dialog.fadeIn(fadeTime);
		expect(setTimeout).toHaveBeenCalled();
		expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
	});
});

describe("Dialog set position test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	const x = 450;
	const y = 550;
	dialog.setPosition(x, y);
	it("Dialog should correctly positionate", () =>
	{
		expect(dialog.root!.style.left).toBe(x + "px");
		expect(dialog.root!.style.top).toBe(y + "px");
	});
});

describe("Dialog set size test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	const w = 400;
	const h = 400;
	dialog.setSize(w, h);
	it("Dialog should resize", () =>
	{
		expect(dialog.root!.style.width).toBe(w + "px");
		expect(dialog.root!.style.height).toBe(h + "px");
	});
});

describe("Dialog set title test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	const title = "myNewTitle";
	dialog.setTitle(title);
	it("Dialog should change title", () =>
	{
		expect(dialog.header!.innerHTML).toBe(title);
	});
});

describe("Dialog center test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	dialog.setPosition(0, 0);
	it("Dialog should be centered", () =>
	{
		dialog.center();
		expect(dialog.root?.style.left !== "0px");
		expect(dialog.root?.style.top !== "0px");
	});
});

describe("Dialog adjust size test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 3000, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	const dragger = new Dragger(0, { disabled: false });
	dialog.add(dragger);
	it("Dialog should adjust size", () =>
	{
		dialog.adjustSize(0, true);
		expect(dialog);
	});
});

describe("Dialog clear test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const dialog = new Dialog(options);
	dialog.clear();
	it("Dialog content should be empty", () =>
	{
		expect((dialog.content as HTMLDivElement).innerHTML).toBe("");
	});
});

describe("Dialog detach window test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const windowOpenSpy = jest.spyOn(window, "open");
	LiteGUI.init({ wrapped: true, width: 800, height: 800 });
	const dialog = new Dialog(options);
	dialog.setSize(1000, 1200);
	LiteGUI.add(dialog);
	it("Detached window should exists", () =>
	{
		windowOpenSpy.mockImplementation(() => ({
			document: window.document,
			onbeforeunload: null,
		} as Window & typeof globalThis));
		const clientRects = dialog.root!.getClientRects;
        dialog.root!.getClientRects = jest.fn(() => { return [{ width: 100, height: 100 }] as unknown as DOMRectList; });
        dialog.detachWindow();
        expect(windowOpenSpy).toHaveBeenCalledWith("", "", "width=100, height=100, location=no, status=no, menubar=no, titlebar=no, fullscreen=yes");
        windowOpenSpy.mockRestore();
        dialog.root!.getClientRects = clientRects;
	});
});

describe("Dialog reattach window test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const windowOpenSpy = jest.spyOn(window, "open");
	LiteGUI.init({ wrapped: true, width: 800, height: 800 });
	const dialog = new Dialog(options);
	dialog.setSize(1000, 1200);
	LiteGUI.add(dialog);
	windowOpenSpy.mockImplementation(() => ({
		document: window.document,
		close: () => { },
		onbeforeunload: null,
	} as Window & typeof globalThis));
	const clientRects = dialog.root!.getClientRects;
	dialog.root!.getClientRects = jest.fn(() => { return [{ width: 100, height: 100 }] as unknown as DOMRectList; });
	dialog.detachWindow();
	it("Detached window should reattach", () =>
	{
		dialog.reattachWindow();
		interface DialogWithWindow { _dialogWindow?: Window }
		expect((dialog as unknown as DialogWithWindow)._dialogWindow).toBeUndefined();
		windowOpenSpy.mockRestore();
		dialog.root!.getClientRects = clientRects;
	});
});

describe("Dialog close test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	const openSpy = jest.spyOn(window, "open");
	LiteGUI.init({ wrapped: true, width: 800, height: 800 });
	const dialog = new Dialog(options);
	dialog.setSize(1000, 1200);
	LiteGUI.add(dialog);
	openSpy.mockImplementation(() => ({
		document: window.document,
		close: () => { },
		onbeforeunload: null,
	} as Window & typeof globalThis));
	const clientRects = dialog.root!.getClientRects;
	dialog.root!.getClientRects = jest.fn(() => { return [{ width: 100, height: 100 }] as unknown as DOMRectList; });
	dialog.detachWindow();
	it("Dialog window should close", () =>
	{
		dialog.close();
		interface DialogWithWindow { _dialogWindow?: Window }
		expect((dialog as unknown as DialogWithWindow)._dialogWindow).toBeUndefined();
		openSpy.mockRestore();
		openSpy.mockClear();
		dialog.root!.getClientRects = clientRects;
	});
});

describe("Dialog show all test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	jest.spyOn(dialog, 'show');
	it("All dialogs should show", () =>
	{
		dialog.showAll();
		expect(dialog.show).toHaveBeenCalledTimes(document.body.querySelectorAll("litedialog").length);
	});
});

describe("Dialog hide all test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	jest.spyOn(dialog, 'hide');
	it("All dialogs should hide", () =>
	{
		dialog.hideAll();
		expect(dialog.hide).toHaveBeenCalledTimes(document.body.querySelectorAll("litedialog").length);
	});
});

describe("Dialog close all test", () =>
{
	const options = {
		id: "testDialog", title: "testDialog", closable: true, minimize: true,
		width: 300, scroll: true, resizable: true, draggable: true, detachable: true
	};
	LiteGUI.init({ wrapped: true });
	const dialog = new Dialog(options);
	LiteGUI.add(dialog);
	jest.spyOn(dialog, 'close');
	it("All dialogs should close", () =>
	{
		dialog.closeAll();
		expect(dialog.close).toHaveBeenCalledTimes(document.body.querySelectorAll("litedialog").length);
	});
});

describe("Dialog Helper Tests", () =>
{
	afterEach(() =>
	{
		const dialogs = document.querySelectorAll(".litedialog");
		dialogs.forEach(d => d.remove());
		const modals = document.querySelectorAll(".litemodalbg");
		modals.forEach(m => m.remove());
	});

	describe("AlertDialog", () =>
	{
		it("Should create a dialog with content and close button", () =>
		{
			const dialog = LiteGUI.alert("Hello Alert");
			expect(dialog).toBeInstanceOf(Dialog);
			expect(dialog.content.innerHTML).toContain("Hello Alert");
			expect(dialog.root.querySelector(".close-button")).toBeTruthy();
			expect(dialog.root.classList.contains("alert")).toBe(true);
		});
	});

	describe("ConfirmDialog", () =>
	{
		it("Should create a dialog with Yes/No buttons", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.confirm("Are you sure?", callback);
			const buttons = dialog.content.querySelectorAll("button");
			expect(buttons.length).toBe(2);
			const yesBtn = dialog.content.querySelector("button[data-value='yes']");
			const noBtn = dialog.content.querySelector("button[data-value='no']");
			expect(yesBtn).toBeTruthy();
			expect(noBtn).toBeTruthy();
			expect(yesBtn?.innerHTML).toBe("Yes");
			expect(noBtn?.innerHTML).toBe("No");
		});

		it("Should call callback with true when Yes is clicked", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.confirm("Are you sure?", callback);
			const yesBtn = dialog.content.querySelector("button[data-value='yes']") as HTMLButtonElement;
			yesBtn.click();
			expect(callback).toHaveBeenCalledWith(true);
		});

		it("Should call callback with false when No is clicked", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.confirm("Are you sure?", callback);
			const noBtn = dialog.content.querySelector("button[data-value='no']") as HTMLButtonElement;
			noBtn.click();
			expect(callback).toHaveBeenCalledWith(false);
		});
	});

	describe("PromptDialog", () =>
	{
		it("Should create a dialog with input and Accept/Cancel buttons", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.prompt("Enter name", callback);
			expect(dialog.content.querySelector("input")).toBeTruthy();
			expect(dialog.content.querySelector("button[data-value='accept']")).toBeTruthy();
			expect(dialog.content.querySelector("button[data-value='cancel']")).toBeTruthy();
		});

		it("Should call callback with value when Accept is clicked", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.prompt("Enter name", callback);
			const input = dialog.content.querySelector("input") as HTMLInputElement;
			input.value = "LiteGUI User";
			const acceptBtn = dialog.content.querySelector("button[data-value='accept']") as HTMLButtonElement;
			acceptBtn.click();
			expect(callback).toHaveBeenCalledWith("LiteGUI User");
		});

		it("Should call callback with undefined when Cancel is clicked", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.prompt("Enter name", callback);
			const cancelBtn = dialog.content.querySelector("button[data-value='cancel']") as HTMLButtonElement;
			cancelBtn.click();
			expect(callback).toHaveBeenCalledWith(undefined);
		});

		it("Should use textarea if requested", () =>
		{
			const callback = jest.fn();
			const dialog = LiteGUI.prompt("Enter description", callback, { textarea: true });
			expect(dialog.content.querySelector("textarea")).toBeTruthy();
			expect(dialog.content.querySelector("input")).toBeFalsy();
		});
	});

	describe("ChoiceDialog", () =>
	{
		it("Should create a dialog with buttons for choices", () =>
		{
			const callback = jest.fn();
			const choices = ["Option A", "Option B"];
			const dialog = LiteGUI.choice("Choose one", choices, callback);
			const buttons = dialog.content.querySelectorAll("button");
			expect(buttons.length).toBe(2);
			expect(buttons[0].innerHTML).toBe("Option A");
			expect(buttons[1].innerHTML).toBe("Option B");
		});

		it("Should call callback with selected value", () =>
		{
			const callback = jest.fn();
			const choices = ["Option A", "Option B"];
			const dialog = LiteGUI.choice("Choose one", choices, callback);
			const btnB = dialog.content.querySelector("button[data-value='1']") as HTMLButtonElement;
			btnB.click();
			expect(callback).toHaveBeenCalledWith("Option B");
		});
	});

	describe("ShowMessage", () =>
	{
		it("Should create a modal dialog", () =>
		{
			const dialog = LiteGUI.showMessage("Important Message");
			expect(dialog).toBeInstanceOf(Dialog);
			if (!LiteGUI.root) {LiteGUI.init();}

			expect(LiteGUI.modalBackground!.style.display).toBe("block");
			dialog.close();
		});

		it("Should include close button if closable is true", () =>
		{
			const dialog = LiteGUI.showMessage("Closable Message", { closable: true });
			// ShowMessage adds a FOOTER button "Close" if closable option is true
			const footerBtns = dialog.root.querySelectorAll(".panel-footer button");
			let foundClose = false;
			footerBtns.forEach(btn =>
			{
				if (btn.innerHTML === "Close") {foundClose = true;}
			});
			expect(foundClose).toBe(true);
		});
	});
});
