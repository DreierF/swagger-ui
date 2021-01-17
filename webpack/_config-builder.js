/**
 * @prettier
 */

import path from "path"
import os from "os"
import merge from "lodash/merge"
import webpack from "webpack"
import TerserPlugin from "terser-webpack-plugin"
import nodeExternals from "webpack-node-externals"

import { getRepoInfo } from "./_helpers"
import pkg from "../package.json"

const projectBasePath = path.join(__dirname, "../")

const baseRules = [
  {
    test: /\.jsx?$/,
    include: [
      path.join(projectBasePath, "src"),
      path.join(projectBasePath, "node_modules", "object-assign-deep"),
    ],
    loader: "babel-loader",
    options: {
      retainLines: true,
      cacheDirectory: true,
    },
  },
  { test: /\.(txt|yaml)$/, loader: "raw-loader" },
  { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url-loader" },
  {
    test: /\.(woff|woff2)$/,
    loader: "url-loader?",
    options: {
      limit: 10000,
    },
  },
  { test: /\.(ttf|eot)$/, loader: "file-loader" },
]

export default function buildConfig(
  {
    minimize = true,
    mangle = true,
    sourcemaps = true,
    includeDependencies = true,
  },
  customConfig
) {
  const gitInfo = getRepoInfo()

  var plugins = [
    new webpack.DefinePlugin({
      buildInfo: JSON.stringify({
        PACKAGE_VERSION: pkg.version,
        GIT_COMMIT: gitInfo.hash,
        GIT_DIRTY: gitInfo.dirty,
        HOSTNAME: os.hostname(),
        BUILD_TIME: new Date().toUTCString(),
      }),
    }),
  ]

  const completeConfig = merge(
    {},
    {
      mode: "production",

      entry: {},

      output: {
        path: path.join(projectBasePath, "dist"),
        publicPath: "/dist",
        filename: "[name].js",
        chunkFilename: "[name].js",
        libraryTarget: "umd",
        libraryExport: "default", // TODO: enable
      },

      target: "web",

      node: {
        // yaml-js has a reference to `fs`, this is a workaround
        fs: "empty",
      },

      module: {
        rules: baseRules,
      },

      externals: includeDependencies
        ? {
            // json-react-schema/deeper depends on buffertools, which fails.
            buffertools: true,
            esprima: true,
          }
        : nodeExternals(),

      resolve: {
        modules: [path.join(projectBasePath, "./src"), "node_modules"],
        extensions: [".web.js", ".js", ".jsx", ".json", ".less"],
        // these aliases make sure that we don't bundle same libraries twice
        // when the versions of these libraries diverge between swagger-js and swagger-ui
        alias: {
          "@babel/runtime-corejs3": path.resolve(__dirname, "..", "node_modules/@babel/runtime-corejs3"),
          "js-yaml": path.resolve(__dirname, "..", "node_modules/js-yaml"),
          "lodash": path.resolve(__dirname, "..", "node_modules/lodash"),
          "lodash.debounce": path.resolve(__dirname, "..", "node_modules/lodash/debounce"),
          // Has the same API but does not rely on buffer polyfill
          "deep-extend": path.resolve(__dirname, "..", "node_modules/lodash/merge")
        },
      },

      // If we're mangling, size is a concern -- so use trace-only sourcemaps
      // Otherwise, provide heavy souremaps suitable for development
      devtool: sourcemaps
        ? minimize
          ? "nosource-source-map"
          : "module-source-map"
        : false,

      performance: {
        hints: "error",
        maxEntrypointSize: 1072000,
        maxAssetSize: 1072000,
      },

      optimization: {
        minimize: !!minimize,
        minimizer: [
          compiler =>
            new TerserPlugin({
              cache: true,
              sourceMap: sourcemaps,
              terserOptions: {
                mangle: !!mangle,
              },
            }).apply(compiler)
        ],
      },
    },
    customConfig
  )

  // deepExtend mangles Plugin instances, this doesn't
  completeConfig.plugins = plugins.concat(customConfig.plugins || [])

  return completeConfig
}
