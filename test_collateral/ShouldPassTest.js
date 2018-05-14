const assert = require("assert")

module.exports = {
    test: () => {
        console.log("This test should pass")
        assert.strictEqual(1, 1)
    },
}
