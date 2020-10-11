import Path from "path"
import { parse } from "acorn"
import walk from "acorn-walk"

function extract(code) {
  return new Promise((resolve) => {
    const ast = parse(code, {
      sourceType: "module"
    })
    const res = []
    walk.simple(ast, {
      CallExpression(node) {
        const {
          start,
          end,
          callee,
          arguments: argNodes
        } = node
        let args = []
        if (
          callee.type === "MemberExpression" &&
          callee.object.name === "require" &&
          callee.property.name === "context"
        ) {
          args = argNodes.map(a => a.value)
          res.push({
            start,
            end,
            args
          })
        }
      }
    })

    resolve(res)
  })
}

export async function extractArgs(code, baseDirname) {
  const data = await extract(code)

  return data.map(r => {
    const { start, end, args } = r
    const [
      rawDirname = "",
      rawRecursive,
      rawRegexp
    ] = args

    const dirname = Path.join(baseDirname, rawDirname)
    const recursive = rawRecursive
    const regexp = rawRegexp

    return {
      dirname,
      recursive,
      regexp,
      start,
      end
    }
  })
}