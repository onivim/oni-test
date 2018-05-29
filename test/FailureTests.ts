import * as assert from "assert"

import * as path from "path"

import { execSync, spawnSync } from "child_process"

const binPath = process.execPath
const coreScriptPath = path.join(__dirname, "..", "..", "bin", "cli.js")

describe("failure cases", () => {
    it("logs failure", () => {
        console.log(binPath + " " + coreScriptPath)

        let result = null
        try {
            result = spawnSync(binPath, [coreScriptPath], {}).stdout.toString("utf8")
        } catch (err) {
            console.log("return code: " + err.status)
        }

        console.log("output: " + result)
    })
})
