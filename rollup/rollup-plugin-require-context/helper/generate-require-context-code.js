import Path from "path"
import {extractArgs} from "./extract-args"
import {resolveRequireModules} from "./resolve-reqquire-modules"
import {genRequireCode as resolveRequireCode} from "./resolve-require-code"

export async function gernerateRequireContextCode(id, code) {
  const currentCodeDirname = Path.dirname(id)
  const data = await extractArgs(code, currentCodeDirname)
  let head = ""

  const body = data.reduceRight((res, r) => {
    const {
      start, end,
      dirname, recursive, regexp
    } = r
    const modules = resolveRequireModules(dirname, recursive, regexp)
    const { importCode, requireFnCode } = resolveRequireCode(dirname, modules)

    head += importCode

    res = [
      res.slice(0, start),
      requireFnCode,
      res.slice(end)
    ].join("")
    return res
  }, code)

  return [
    head,
    body
  ].join("\n")
}