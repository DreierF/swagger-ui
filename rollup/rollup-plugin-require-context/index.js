const _ = require("rollup-pluginutils")
const generateSourceMap = require("generate-source-map")
import {hasRequireContext} from "./helper/has-require-context"
import {gernerateRequireContextCode} from "./helper/generate-require-context-code"

export default function plugin(options = {}) {
  const filter = _.createFilter(options.include || ["**/*.js"], options.exclude || "node_modules/**")
  return {
    name: "require_content",
    async transform(code, id) {
      if (!filter(id) || !hasRequireContext(code)) {
        return
      }
      code = await gernerateRequireContextCode(id, code)

      const sourcemap = generateSourceMap({
        source: code,
        sourceFile: "rollup-plugin-require-context.js"
      }).toString()

      return {
        code,
        map: sourcemap
      }
    }
  }
}
