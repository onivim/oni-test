import * as assert from "assert"

import * as path from "path"

import * as cp from "child_process"

const binPath = process.execPath
const coreScriptPath = path.join(__dirname, "..", "..", "bin", "cli.js")
const successTestPah = path.join(__dirname, "..", "..", "test_collateral", "ShouldPassTest.js")

describe("success cases", () => {
    it("logs success", () => {
        let result: cp.SpawnSyncReturns<Buffer> = null
        try {
            result = cp.spawnSync(binPath, [coreScriptPath, successTestPah], {})
        } catch (err) {}

        console.log("Return code: " + result.status)
        console.log("Output: " + result.output.toString())

        assert.strictEqual(result.status, 0, "Status should be 0, since the test passed")
    })
})
