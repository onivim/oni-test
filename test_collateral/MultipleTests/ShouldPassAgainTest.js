const assert = require("assert")

module.exports = {
    test: () => {
        console.log("This test should pass - [ShouldPassAgainTest]")
        assert.strictEqual(1, 1)
    },
}
