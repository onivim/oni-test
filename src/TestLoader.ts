import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni } from "./Oni"

import { ensureProcessNotRunning } from "./ensureProcessNotRunning"

// tslint:disable:no-console

export interface ITestCase {
    name: string
    testPath: string
    allowLogFailures: boolean
    env: {
        [key: string]: string
    }
}

const normalizePath = p => p.split("\\").join("/")

export const loadTest = (rootPath: string, testName: string): ITestCase => {
    const testPath = path.join(rootPath, testName + ".js")

    const testMeta = require(testPath)
    const testDescription = testMeta.settings || {}

    const normalizedMeta: ITestCase = {
        name: testDescription.name || testName,
        testPath: normalizePath(testPath),
        allowLogFailures: testDescription.allowLogFailures,
        env: {
            ...(testDescription.env || {}),
            ONI_CONFIG_FILE: getConfigPath(testMeta.settings, rootPath),
        },
    }

    return normalizedMeta
}

import * as os from "os"

const getConfigPath = (settings: any, rootPath: string) => {
    settings = settings || {}

    if (settings.configPath) {
        if (!path.isAbsolute(settings.configPath)) {
            return normalizePath(path.join(rootPath, settings.configPath))
        } else {
            return settings.configPath
        }
    } else if (settings.config) {
        return normalizePath(serializeConfig(settings.config))
    } else {
        // Fix #1436 - if no config is specified, we'll just use
        // the empty config, so that the user's config doesn't
        // impact the test results.
        return normalizePath(serializeConfig({ "oni.loadInitVim": false }))
    }
}

// Helper method to write a config to a temporary folder
// Returns the path to the serialized config
const serializeConfig = (configValues: { [key: string]: any }): string => {
    const stringifiedConfig = Object.keys(configValues).map(key => {
        return `"${key}": ${JSON.stringify(configValues[key])},`
    })

    const outputConfig = `// User Configuration${os.EOL}${os.EOL}module.exports = {${
        os.EOL
    }${stringifiedConfig.join(os.EOL)}${os.EOL}}`

    const folder = os.tmpdir()
    const fileName = "config_" + new Date().getTime().toString() + ".js"

    const fullFilepath = path.join(folder, fileName)
    console.log("Writing config to: " + fullFilepath)
    console.log("Config contents: " + outputConfig)
    fs.writeFileSync(fullFilepath, outputConfig)
    return fullFilepath
}
