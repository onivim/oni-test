import * as assert from "assert"

import * as path from "path"

import { execSync, spawnSync } from "child_process"

const binPath = process.execPath
const coreScriptPath = path.join(__dirname, "..", "..", "bin", "cli.js")

const developmentBuildPath = path.join(__dirname, "..", "..", ".local-oni")

describe("failure cases", () => {
    it("logs failure", () => {
        console.log(binPath + " " + coreScriptPath)

        let result = null
        try {
            result = spawnSync(
                binPath,
                [coreScriptPath, "--develop", developmentBuildPath],
                {},
            ).stdout.toString("utf8")
        } catch (err) {
            console.log("return code: " + err.status)
        }

        console.log("output: " + result)

        console.log("done")
        assert.strictEqual(0, 1)
    })
})
