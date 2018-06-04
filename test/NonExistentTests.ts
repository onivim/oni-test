import * as assert from "assert"

import * as path from "path"

import * as cp from "child_process"

const binPath = process.execPath
const coreScriptPath = path.join(__dirname, "..", "..", "bin", "cli.js")
const nonExistentPath = path.join(
    __dirname,
    "..",
    "..",
    "test_collateral",
    "ATestThatWillNeverExist.js",
)

describe("non-existent test cases", () => {
    it("logs failure if a test file is specified that doesn't exist", () => {
        console.log(binPath + " " + coreScriptPath)
        console.log("Oni executable path in test: " + process.env["ONI_EXECUTABLE_PATH"])

        let result: cp.SpawnSyncReturns<Buffer> = null
        try {
            result = cp.spawnSync(binPath, [coreScriptPath, nonExistentPath], {})
        } catch (err) {}

        console.log("Status code: " + result.status)
        const outputString = result.output.toString()
        console.log("Output: ")
        console.log("---------------")
        console.log(outputString)
        console.log("---------------")

        assert.strictEqual(
            result.status,
            1,
            "Status should be 1, since a valid test wasn't specified",
        )
    })
})
