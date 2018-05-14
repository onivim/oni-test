import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni, OniStartOptions } from "./Oni"
import { ensureProcessNotRunning } from "./ensureProcessNotRunning"
import { loadTest, ITestCase } from "./TestLoader"
import { logWithTimeStamp } from "./Utility"

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
    private _logTimer: number | undefined

    constructor(
        private _startOptions: OniStartOptions,
        private _testFile: string,
        private _timeout: number = 10 * 60 * 1000,
    ) {
        this._oni = new Oni()
        this._testCase = loadTest(this._getRootTestPath(), this._getTestName())
    }

    public async run(): Promise<void> {
        await this._runAndListenForErrors(() => this._setup(), "SETUP")
        await this._runAndListenForErrors(() => this._test(), "TEST")
        await this._runAndListenForErrors(() => this._teardown(), "TEARDOWN")
    }

    private async _setup(): Promise<void> {
        const startOptions = {
            ...this._startOptions,
            env: this._testCase.env,
        }

        logWithTimeStamp("- Calling oni.start")
        await this._oni.start(startOptions)
        logWithTimeStamp("- oni.start complete")

        this._logTimer = window.setInterval(() => {
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

        this._oni.client.execute("Oni.automation.runTest('" + this._testFile + "')")

        logWithTimeStamp("Waiting for result...") // tslint:disable-line
        const value = await this._oni.client.waitForExist(".automated-test-result", this._timeout)
        logWithTimeStamp("waitForExist for 'automated-test-result' complete: " + value)

        await this._flushLogs()

        console.log("Getting result...")
        const resultText = await this._oni.client.getText(".automated-test-result")
        const result = JSON.parse(resultText)

        if (!result.passed) {
            this._markFailed(JSON.stringify(result.exception))
        }
    }

    private async _teardown(): Promise<void> {
        window.clearInterval(this._logTimer)
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

    private _writeRendererLogs(): void {
        const isLogFailure = (log: any) =>
            log.level === "SEVERE" && !this._testCase.allowLogFailures
        const anyLogFailure = (logs: any[]) => logs.filter(isLogFailure).length > 0

        const writeLogs = (logs: any[], forceWrite?: boolean): void => {
            const anyFailures = anyLogFailure(logs)

            logs.forEach(log => {
                const logMessage = `[${log.level}] ${log.message}`

                console.log(logMessage)

                if (isLogFailure(log)) {
                    this._markFailed(logMessage)
                }
            })
        }
    }

    private async _writeMainProcessLogs(): Promise<void> {
        const mainProcessLogs: any[] = await this._oni.client.getMainProcessLogs()
        mainProcessLogs.forEach(l => {
            console.log("[MAIN] " + l)
        })
    }

    private _markFailed(failureMessage: string) {
        this._failed = true
        this._failureInfo.push(failureMessage)
        throw new Error("Test Failed")
    }
}
