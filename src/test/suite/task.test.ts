import * as assert from "assert"
import * as vscode from "vscode"

<<<<<<< HEAD
suite("Roo Code Task", () => {
=======
suite("Optima AI Task", () => {
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
	test("Should handle prompt and response correctly", async function () {
		const timeout = 30000
		const interval = 1000

		if (!globalThis.extension) {
			assert.fail("Extension not found")
		}

		try {
			// Ensure the webview is launched.
			let startTime = Date.now()

			while (Date.now() - startTime < timeout) {
				if (globalThis.provider.viewLaunched) {
					break
				}

				await new Promise((resolve) => setTimeout(resolve, interval))
			}

			await globalThis.api.startNewTask("Hello world, what is your name? Respond with 'My name is ...'")

			// Wait for task to appear in history with tokens.
			startTime = Date.now()

			while (Date.now() - startTime < timeout) {
				const state = await globalThis.provider.getState()
				const task = state.taskHistory?.[0]

				if (task && task.tokensOut > 0) {
					break
				}

				await new Promise((resolve) => setTimeout(resolve, interval))
			}

			if (globalThis.provider.messages.length === 0) {
				assert.fail("No messages received")
			}

			assert.ok(
				globalThis.provider.messages.some(
					({ type, text }) => type === "say" && text?.includes("My name is Roo"),
				),
				"Did not receive expected response containing 'My name is Roo'",
			)
		} finally {
		}
	})
})
