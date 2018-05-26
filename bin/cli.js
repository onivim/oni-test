#!/usr/bin/env/node

"use strict"

const parseArgs = require("minimist")

const result = parseArgs(process.argv)
const os = require("os")

const args = result["_"]
const testPath = args[args.length - 1]

const path = require("path")
const OniTest = require("./../lib/src/OniTest")

let executablePath, executableArgs

if (result["develop"]) {
    const electronCommand = os.platform() === "win32" ? "electron.cmd" : "electron"
    executablePath = path.join(result["develop"], "node_modules", ".bin", electronCommand)

    const mainJsPath = path.join(path.join(result["develop"]), "lib", "main", "src", "main.js")
    executableArgs = [mainJsPath]
} else {
    executablePath = process.env["ONI_EXECUTABLE_PATH"]
    executableArgs = []
}

const test = new OniTest.OniTest(
    {
        executablePath: executablePath,
        executableArgs: executableArgs,
    },
    testPath,
    1,
)
test.run()
