const assert = require("assert")

module.exports = {
    test: () => {
        console.log("This test should fail")
        assert.strictEqual(0, 1, "derpy comparison")
    },
}
