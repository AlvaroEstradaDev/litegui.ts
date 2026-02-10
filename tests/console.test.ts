import { Console } from "../src/console";

describe("Test of console creation", () =>
{
	const options = { prompt: "]" };
	it(`Should create the console`, () =>
	{
		expect(new Console(options)).toBeDefined();
	});
});

describe('processKeyDown', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should simulate pressing E`, () =>
	{
		expect(console.processKeyDown(new KeyboardEvent('keydown',
			{
				'key': 'E'
			})));
	});
});

describe('addMessage', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Message should be "Hello world"`, () =>
	{
		expect(console.addMessage("Hello world", "msglog"));
	});
});

describe('log', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should show an unknown message`, () =>
	{
		expect(console.log());
	});
});

describe('warn', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should show an unknown warn`, () =>
	{
		expect(console.warn());
	});
});

describe('error', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should show an unknown error`, () =>
	{
		expect(console.error());
	});
});

describe('clear', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should clear the console`, () =>
	{
		expect(console.clear());
	});
});

describe('onAutocomplete', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should autocomplete "Hello world" but it's empty`, () =>
	{
		expect(console.onAutocomplete("Hello world"));
	});
});

describe('onProcessCommand', () =>
{
	const options = { prompt: "]" };
	const console = new Console(options);
	it(`Should process "Hello world" but it's empty`, () =>
	{
		expect(console.onProcessCommand("Hello world"));
	});
});