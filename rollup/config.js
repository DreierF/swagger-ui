import { terser } from "rollup-plugin-terser"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import yaml from "@rollup/plugin-yaml"
import json from "@rollup/plugin-json"
import image from "@rollup/plugin-image"
import replace from "@rollup/plugin-replace"
import {getBuildInfo} from "../webpack/_config-builder"
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle"
import requireContext from "./rollup-plugin-require-context/index.js"
import nodePolyfills from "rollup-plugin-node-polyfills"

export default {
    input: "./src/index.js",
    external: ["buffertools", "esprima"],
    output: {
        file: "./dist/swagger-ui-es-bundle-core.js",
        format: "esm",
        sourcemap: "nosource-source-map"
    },
    plugins: [
        replace({
            buildInfo: getBuildInfo(),
        }),
        nodePolyfills(),
        nodeResolve({
            extensions: [".web.js", ".js", ".jsx", ".json", ".less"],
            preferBuiltins: false
        }),
        excludeDependenciesFromBundle(),
        yaml(),
        json(),
        image(),
        babel({
            babelHelpers: "runtime",
            include: ["src/**", "node_modules/object-assign-deep/**"],
            exclude: "node_modules/**",
            presets: [
                [
                    "@babel/preset-env",
                    {
                        modules: false,
                        bugfixes: true
                    }
                ],
                "@babel/preset-react",
            ],
            plugins: [
                [
                    "@babel/plugin-transform-runtime",
                    {
                        "absoluteRuntime": false,
                        "corejs": 3,
                        "version": "^7.11.2"
                    }
                ],
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread",
                "@babel/plugin-proposal-optional-chaining",
            ],
            sourceMap: true,
            inputSourceMap: true
        }),
        requireContext(),
        terser({mangle: true})
    ]
}