import { Tabs, TabsOptions } from "../src/tabs";

describe("Tabs Component", () =>
{

	describe("Constructor and Options", () =>
	{
		it("should be defined", () =>
		{
			const tabs = new Tabs();
			expect(tabs).toBeDefined();
		});

		it("should accept options", () =>
		{
			const options: TabsOptions = { mode: "vertical", id: "test-tabs", width: 200 };
			const tabs = new Tabs(options);
			expect(tabs.mode).toBe("vertical");
			expect(tabs.root.id).toBe("test-tabs");
		});
	});

	describe("Tab Management", () =>
	{
		let tabs: Tabs;

		beforeEach(() =>
		{
			// New instance for each test
			tabs = new Tabs({ id: "main-tabs" });
		});

		it("should add a tab", () =>
		{
			const tabInfo = tabs.addTab("tab1", { title: "Tab 1" });
			expect(tabs.getNumOfTabs()).toBe(1);
			expect(tabInfo.id).toBe("tab1");
		});

		it("should retrieve tab by index", () =>
		{
			tabs.addTab("tab1", { title: "Tab 1" });
			const tabInfo = tabs.getTabByIndex(0);
			expect(tabInfo).toBeDefined();
			expect(tabInfo.id).toBe("tab1");
		});

		it("should retrieve current tab element", () =>
		{
			tabs.addTab("tab1", { title: "Tab 1", selected: true });
			const currentTabElement = tabs.getCurrentTab();
			expect(currentTabElement).not.toBeNull();
			// In addTab, element.dataset.id = id
			expect(currentTabElement!.dataset.id).toBe("tab1");
		});

		it("should retrieve current tab ID", () =>
		{
			tabs.addTab("tab1", { title: "Tab 1", selected: true });
			expect(tabs.getCurrentTabId()).toBe("tab1");
		});

		it("should count tabs correctly", () =>
		{
			tabs.addTab("tab1", {});
			tabs.addTab("tab2", {});
			expect(tabs.getNumOfTabs()).toBe(2);
		});

		it("should remove a tab", () =>
		{
			tabs.addTab("tab1", {});
			tabs.addTab("tab2", {});
			tabs.removeTab("tab1");
			expect(tabs.getNumOfTabs()).toBe(1);
			expect(tabs.getTab("tab1")).toBeUndefined();
			expect(tabs.getTab("tab2")).toBeDefined();
		});

		it("should clear all tabs", () =>
		{
			tabs.addTab("tab1", {});
			tabs.addTab("tab2", {});
			tabs.clear();
			expect(tabs.getNumOfTabs()).toBe(0);
		});
	});

	describe("Navigation and Selection", () =>
	{
		let tabs: Tabs;

		beforeEach(() =>
		{
			tabs = new Tabs();
			tabs.addTab("tab1", { title: "Tab 1" });
			tabs.addTab("tab2", { title: "Tab 2" });
			tabs.addTab("tab3", { title: "Tab 3" });
		});

		it("should select the first tab by default", () =>
		{
			expect(tabs.getCurrentTabId()).toBe("tab1");
		});

		it("should select a tab by ID", () =>
		{
			tabs.selectTab("tab2");
			expect(tabs.getCurrentTabId()).toBe("tab2");
		});

		it("should track previous tab", () =>
		{
			// Currently tab1
			tabs.selectTab("tab2"); // Switch to tab2
			const prev = tabs.getPreviousTab();
			expect(prev).not.toBeNull();
			expect(prev!.dataset.id).toBe("tab1");

			tabs.selectTab("tab3");
			const prev2 = tabs.getPreviousTab();
			expect(prev2).not.toBeNull();
			expect(prev2!.dataset.id).toBe("tab2");
		});
	});

	describe("Bug Fixes and Regressions", () =>
	{
		let tabs: Tabs;

		it("should not overwrite global options when adding a tab", () =>
		{
			// Regression test: adding a tab overwrote this.options with the tab's options
			tabs = new Tabs({ autoswitch: true });
			expect(tabs.options.autoswitch).toBe(true);

			tabs.addTab("t1", { title: "T1", button: true }); // Tab options without autoswitch

			// Check if global options are preserved
			expect(tabs.options.autoswitch).toBe(true);
		});

		it("should respect skipCb in selectTab (inverted logic fix)", () =>
		{
			const callbackSpy = jest.fn();
			tabs = new Tabs({ callback: callbackSpy });
			tabs.addTab("t1", {});
			tabs.addTab("t2", {});

			// Reset spy because addTab might have triggered it (first tab)
			callbackSpy.mockClear();

			// Call selectTab with skipEvents = true
			tabs.selectTab("t2", true);

			expect(tabs.getCurrentTabId()).toBe("t2");
			expect(callbackSpy).not.toHaveBeenCalled();

			// Call selectTab with skipEvents = false (default)
			tabs.selectTab("t1");
			expect(tabs.getCurrentTabId()).toBe("t1");
			// The callback receives (id, event)
			expect(callbackSpy).toHaveBeenCalledWith("t1", true); // We pass true when firing events via selectTab
		});

		it("should support tab-specific callbacks", () =>
		{
			const tabSpy = jest.fn();
			tabs = new Tabs();
			tabs.addTab("t1", { callback: tabSpy });

			tabs.selectTab("t1");
			expect(tabSpy).toHaveBeenCalled();
		});
	});
});
