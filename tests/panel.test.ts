import { Panel } from "../src/panel";

describe("Panel constructor test", () =>
{
	const options = {
		className: "panel-header", title: "Hello world", content: "Just a test",
		width: "300", height: "150", position: [10, 10], scroll: true
	};
	it(`Should be defined`, () =>
	{
		expect(new Panel("Panel01", options)).toBeDefined();
	});
});

describe("Add Panel", () =>
{
	const options = {
		className: "panel-header", title: "Hello world", content: "Just a test",
		width: "300", height: "150", position: [10, 10], scroll: true
	};
	const panel0 = new Panel("Panel01", options);

	options.title = "Hello world 2";
	options.content = "Hello world, este es el panel que se va a agregar";
	options.position = [10, 160];
	it('Should add a panel to panel01', () =>
	{
		expect(panel0.add(new Panel("Panel01_0", options)));
	});
});
describe('Panel clear', () =>
{
	const options = {
		className: "panel-header", title: "Hello world", content: "Just a test",
		width: "300", height: "150", position: [10, 10], scroll: true
	};
	const panel0 = new Panel("Panel01", options);
	it('Should clear panel01', () =>
	{
		expect(panel0.clear());
	});
});