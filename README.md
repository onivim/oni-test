# oni-test

[![Build Status](https://travis-ci.org/onivim/oni-test.svg?branch=master)](https://travis-ci.org/onivim/oni-test)

:mag: Easily test [Oni](https://github.com/onivim/oni) plugins using the [Oni API](https://onivim.github.io/oni-api/).

This is the next generation of the 'integration' / 'CiTests' that were in the core Oni repo,
intended to be generalized so that any Oni plugin can easily tests against a live Oni instance.

## Installation

`npm install -g oni-test`

## Usage

Create a test case:

```
# From the project root, create a folder called test, in that directory, create a filed called 'test.ts'
touch test/test1.ts

# Change directory to test
cd test
```

And then create your first test case:

```
const Oni = require("oni-api")

export const test = async (oni) => {

    // Wait for editors to load
    await oni.automation.waitForEditors()

    // Send the 'i' key to switch to insert mode
    oni.automation.sendKeys("i")

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

    const mode = oni.editors.activeEditor.mode
    assert.strictEqual(mode, "insert", "Verify we've entered insert mode")
}
```

To run your test, run from the project root:

```
oni-test test
```

This runs all tests in the `test` folder.

## Options

By default, `oni-test` uses an Oni executable defined by the `ONI_EXECUTABLE_PATH` environment variable.

However, you can override this by passing the `--develop` flag:

*   `--develop` - String path to a local built Oni folder. This should be the _root_ folder, so I've cloned Oni to `~/oni`, then I'd pass that path to development. This makes

Other arguments are also available:

*   `--args` - Array of arguments to pass to Oni on launch.

> If testing a custom plugin / extension, you'll want to pass your built plugin in the `--plugin` paramter.

*   The final parameter is a `glob` of test files to run.

## Test File Format

The test file _must_ export a `test` function that takes the [Oni API object] and returns a `Promise`. This is the core of the test case.

The test can override the configuration by exporting a `settings` object, like:

```
// Set custom settings prior to running the test
export const settings = {
    config: {
        "tabs.mode": "buffers",
    },
}
```
