import * as assert from "assert"

import * as path from "path"

import * as cp from "child_process"

const binPath = process.execPath
const coreScriptPath = path.join(__dirname, "..", "..", "bin", "cli.js")
const failureTestPath = path.join(__dirname, "..", "..", "test_collateral", "ShouldFailTest.js")

describe("failure cases", () => {
    it("logs failure", () => {
        console.log(binPath + " " + coreScriptPath)
        console.log("Oni executable path in test: " + process.env["ONI_EXECUTABLE_PATH"])

        let result: cp.SpawnSyncReturns<Buffer> = null
        try {
            result = cp.spawnSync(binPath, [coreScriptPath, failureTestPath], {})
        } catch (err) {}

        console.log("Status code: " + result.status)
        console.log("Output: " + result.output)

        assert.strictEqual(
            result.status,
            1,
            "Status should be 1, since this is running a failure test",
        )

        assert.ok(
            result.output.indexOf("derpy") >= 0,
            "The failure reason should be included in the output",
        )
    })
})
