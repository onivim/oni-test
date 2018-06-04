const assert = require("assert")

module.exports = {
    test: () => {
        console.log("This test should pass - [ShouldPassTest]")
        assert.strictEqual(1, 1)
    },
}
