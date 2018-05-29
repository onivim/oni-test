import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni, OniStartOptions } from "./Oni"
import { ensureProcessNotRunning } from "./ensureProcessNotRunning"
import { loadTest, ITestCase } from "./TestLoader"
import { logWithTimeStamp, normalizePath, logSuccess, logFailure } from "./Utility"

import * as chalk from "chalk"

export interface IFailedTest {
    test: string
    path: string
    expected: any
    actual: any
}

export class OniTest {
    private _oni: Oni
    private _testCase: ITestCase
    private _failed: boolean = false
    private _failureInfo: string[] = []
    private _logTimer: NodeJS.Timer

    constructor(
        private _startOptions: OniStartOptions,
        private _testFile: string,
        private _timeout: number = 10 * 60 * 1000,
    ) {
        this._oni = new Oni()
        this._testCase = null
    }

    public async run(): Promise<void> {
        await this._runAndListenForErrors(async () => await this._setup(), "SETUP")
        await this._runAndListenForErrors(async () => await this._test(), "TEST")
        await this._runAndListenForErrors(async () => await this._teardown(), "TEARDOWN")

        if (this._failed) {
            logFailure("FAILED: " + this._testFile)
            process.exit(1)
        } else {
            logSuccess("PASSED: " + this._testFile)
        }

        logWithTimeStamp("Completed")
    }

    private _printReport(): void {}

    private async _setup(): Promise<void> {
        this._testCase = loadTest(this._getRootTestPath(), this._getTestName())
        const startOptions = {
            ...this._startOptions,
            env: this._testCase.env,
        }

        logWithTimeStamp("- Calling oni.start")
        await this._oni.start(startOptions)
        logWithTimeStamp("- oni.start complete")

        this._logTimer = setInterval(() => {
            this._flushLogs()
        }, 2000)
    }

    private async _test(): Promise<void> {
        logWithTimeStamp("TEST: " + this._getTestName())
        console.log("Waiting for editor element...")
        await this._oni.client.waitForExist(".editor", this._timeout)

        logWithTimeStamp("Found editor element. Getting editor element text: ")
        const text = await this._oni.client.getText(".editor")
        logWithTimeStamp("Editor element text: " + text)

        logWithTimeStamp("Test path: " + this._testFile) // tslint:disable-line

        this._oni.client.execute("Oni.automation.runTest('" + normalizePath(this._testFile) + "')")

        logWithTimeStamp("Waiting for result...") // tslint:disable-line
        const value = await this._oni.client.waitForExist(".automated-test-result", this._timeout)
        logWithTimeStamp("waitForExist for 'automated-test-result' complete: " + value)

        await this._flushLogs()

        console.log("Getting result...")
        const resultText = await this._oni.client.getText(".automated-test-result")
        console.log("Result text: " + resultText)
        const result = JSON.parse(resultText)

        if (!result.passed) {
            this._markFailed(JSON.stringify(result.exception))
        }
    }

    private async _teardown(): Promise<void> {
        clearInterval(this._logTimer)
        await this._flushLogs()

        await this._oni.close()
    }

    private _getRootTestPath(): string {
        return path.dirname(this._testFile)
    }

    private _getTestName(): string {
        return path.basename(this._testFile)
    }

    private async _runAndListenForErrors(fn: () => Promise<void>, label: string): Promise<void> {
        logWithTimeStamp(`[${label}] starting`)
        try {
            await fn()
            logWithTimeStamp(`[${label}] completed`)
        } catch (ex) {
            logWithTimeStamp(`[ERROR]: ${ex}`)
        }
    }

    private async _flushLogs(): Promise<void> {
        await this._writeMainProcessLogs()
        await this._writeRendererLogs()
    }

    private async _writeRendererLogs(): Promise<void> {
        const isLogFailure = (log: any) =>
            log.level === "SEVERE" && !this._testCase.allowLogFailures
        const anyLogFailure = (logs: any[]) => logs.filter(isLogFailure).length > 0

        const writeLogs = (logs: any[], forceWrite?: boolean): void => {
            const anyFailures = anyLogFailure(logs)

            logs.forEach(log => {
                // TODO: Add verbose flag
                const logMessage = `[${log.level}] ${log.message}`

                if (isLogFailure(log)) {
                    console.log(logMessage)
                    this._markFailed(logMessage)
                }
            })
        }

        const rendererLogs: any[] = await this._oni.client.getRenderProcessLogs()
        writeLogs(rendererLogs)
    }

    private async _writeMainProcessLogs(): Promise<void> {
        const mainProcessLogs: any[] = await this._oni.client.getMainProcessLogs()
        mainProcessLogs.forEach(l => {
            // TODO: Add verbose flag
            // console.log("[MAIN] " + l)
        })
    }

    private _markFailed(failureMessage: string) {
        this._failed = true
        this._failureInfo.push(failureMessage)
        throw new Error("Test Failed")
    }
}
