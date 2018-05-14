import * as assert from "assert"
import * as path from "path"

import { Application, SpectronClient } from "spectron"

import { ensureProcessNotRunning } from "./ensureProcessNotRunning"

const log = (msg: string) => {
    console.log(msg) // tslint:disable-line no-console
}

export interface OniStartOptions {
    executablePath: string
    executableArgs: string[]
    env?: {
        ONI_CONFIG_FILE?: string
        MYVIMRC?: string
        [key: string]: string
    }
}

/**
 * Thin wrapper around the Spectron `Application` object to facilitate
 * starting / stopping Oni
 */
export class Oni {
    private _app: Application

    public get client(): SpectronClient {
        return this._app.client
    }

    public async start(options: OniStartOptions): Promise<void> {
        const { executableArgs, executablePath } = options
        log("Using executable path: " + executablePath)
        log("Using executable args: " + executableArgs)

        log("Start options: " + JSON.stringify(options))

        this._app = new Application({
            path: executablePath,
            args: executableArgs,
            env: options.env,
        })

        log("Oni starting...")
        await this._app.start()
        log("Oni started. Waiting for window load..")
        await this.client.waitUntilWindowLoaded()
        const count = await this.client.getWindowCount()
        assert.ok(count > 0)

        log(`Window loaded. Reports ${count} windows.`)
    }

    public async close(): Promise<void> {
        log("Closing Oni...")
        const windowCount = await this.client.getWindowCount()
        log(`- current window count: ${windowCount}`)
        if (this._app) {
            let attempts = 1
            while (attempts < 5) {
                if (!this._app.isRunning()) {
                    log("- _app.isRunning() is now false")
                    break
                }

                log("- Calling _app.stop")
                let didStop = false
                const promise1 = this._app.stop().then(
                    () => {
                        log("_app.stop promise completed!")
                        didStop = true
                    },
                    err => {
                        // tslint:disable-next-line
                        console.error(err)
                    },
                )

                const promise2 = sleep(15000)

                log("- Racing with 15s timer...")
                const race = Promise.race([promise1, promise2])
                await race

                log("- Race complete. didStop: " + didStop)

                if (!didStop) {
                    log("- Attemping to force close processes:")
                    await ensureProcessNotRunning("nvim")
                    log("- Force close complete")
                }

                attempts++
            }
        }
        log("Oni closed.")
    }
}

const sleep = (timeout: number = 1000) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout)
    })
}
