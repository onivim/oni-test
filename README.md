# oni-test

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

The `oni-test` command exposes several options:

- `--path` - String path to the Oni exectable to launch.

> If this is not specified, `oni-test` will look to the `$ONI_EXECUTABLE_PATH` environment variable. Recommend using with `ovm` to get an oni executable for a particular version.

- `--args` - Array of arguments to pass to Oni on launch.

> If testing a custom plugin / extension, you'll want to pass your built plugin in the `--plugin` paramter.

- The final parameter is a `glob` of test files to run.

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

