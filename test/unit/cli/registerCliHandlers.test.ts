import { describe, expect, it, vi } from "vitest";
import type QuartzSyncer from "src/main";
import { registerCliHandlers } from "src/cli/registerCliHandlers";

type RegisteredHandler = (data: Record<string, string>) => Promise<string>;

describe("registerCliHandlers", () => {
	it("uses the plugin manifest id for registered commands and help output", async () => {
		const registered = new Map<string, RegisteredHandler>();
		const registerCliHandler = vi.fn(
			(
				name: string,
				_description: string,
				_flags: unknown,
				handler: RegisteredHandler,
			) => {
				registered.set(name, handler);
			},
		);
		const plugin = {
			manifest: { id: "quartz-syncer-custom" },
			registerCliHandler,
		} as unknown as QuartzSyncer;

		registerCliHandlers(plugin);

		expect(registered.has("quartz-syncer-custom")).toBe(true);
		expect(registered.has("quartz-syncer-custom:status")).toBe(true);
		expect(registered.has("quartz-syncer")).toBe(false);

		const baseHelp = await registered.get("quartz-syncer-custom")?.({});
		expect(baseHelp).toContain("quartz-syncer-custom:status");
		expect(baseHelp).not.toContain("quartz-syncer:status");

		const statusHelp = await registered.get(
			"quartz-syncer-custom:status",
		)?.({ help: "true" });
		expect(statusHelp).toContain("quartz-syncer-custom:status");
		expect(statusHelp).toContain("obsidian quartz-syncer-custom:status");
	});
});
