#!/usr/bin/env/node

"use strict"

const path = require("path")
const OniTest = require("./../lib/src/OniTest")

const testPath = path.join(__dirname, "./../test_collateral/ShouldFailTest.js")

const test = new OniTest.OniTest(
    {
        executablePath: "E:/oni/node_modules/.bin/electron.cmd",
        executableArgs: ["E:/oni/lib/main/src/main.js"],
    },
    testPath,
    1,
)
test.run()
