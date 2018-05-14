#!/usr/bin/env/node

"use strict"

const parseArgs = require("minimist")

const result = parseArgs(process.argv)

const args = result["_"]
const testPath = args[args.length - 1]

const path = require("path")
const OniTest = require("./../lib/src/OniTest")

const test = new OniTest.OniTest(
    {
        executablePath: "E:/oni/node_modules/.bin/electron.cmd",
        executableArgs: ["E:/oni/lib/main/src/main.js"],
    },
    testPath,
    1,
)
test.run()
