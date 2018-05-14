import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

const chalk = require("chalk")

const startTime = new Date().getTime()

export const logWithTimeStamp = (message: string) => {
    const currentTime = new Date().getTime()
    const delta = currentTime - startTime
    const deltaInSeconds = delta / 1000

    console.log(chalk.default(`[${deltaInSeconds}] ${message}`))
}

export const logSuccess = (message: string) => {
    logWithTimeStamp(chalk.bgGreen.white(message))
}

export const logFailure = (message: string) => {
    logWithTimeStamp(chalk.bgRed.white(message))
}

export const normalizePath = p => p.split("\\").join("/")
