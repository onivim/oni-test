#!/usr/bin/env/node

"use strict"

const parseArgs = require("minimist")

const result = parseArgs(process.argv)
const os = require("os")
const fs = require("fs")
const glob = require("glob")

const args = result["_"]
console.dir(args)
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

console.log("Specified tests: " + testPath)

const allTests = glob.sync(testPath)

if (!allTests || !allTests.length) {
    console.error("No test files found with path: " + testPath)
    process.exit(1)
}

const executeTest = async testPath => {
    const test = new OniTest.OniTest(
        {
            executablePath: executablePath,
            executableArgs: executableArgs,
        },
        testPath,
        1,
    )

    await test.run()
}

const executeTests = async tests => {
    while (tests.length > 0) {
        const test = tests.shift()
        await executeTest(test)
    }
}

executeTests(allTests).then(() => console.log("--Completed"))
