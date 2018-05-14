import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

const startTime = new Date().getTime()

export const logWithTimeStamp = (message: string) => {
    const currentTime = new Date().getTime()
    const delta = currentTime - startTime
    const deltaInSeconds = delta / 1000

    console.log(`[${deltaInSeconds}] ${message}`)
}
