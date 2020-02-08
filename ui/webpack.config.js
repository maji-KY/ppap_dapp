const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const env = process.env.NODE_ENV;
const distDir = "public";

const config = {

  "mode": env,

  "entry": {
    "main": path.resolve(__dirname, "src/main/main.tsx"),
  },

  "output": {
    "path": path.join(__dirname, distDir),
    "filename": "[name].[hash].js",
    "libraryTarget": "this",
  },

  "optimization": {
    "minimizer": [
      new TerserPlugin({
        "cache": true,
        "parallel": true,
        "sourceMap": true,
        "terserOptions": {
          "compress": {
            "ecma": 7,
          },
          "output": {
            "ecma": 7,
            "comments": false,
          },
        },
      }),
    ],
  },

  "resolve": {
    "extensions": [".tsx", ".ts", ".js"],
    "modules": [
      path.join(__dirname, "src/main"),
      "node_modules",
    ],
  },

  "plugins": [
    new CleanWebpackPlugin({
      "verbose": true,
    }),
    new HtmlWebpackPlugin({
      "template": "index.html",
    }),
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify(env),
      },
    }),
  ],

  "module": {
    "rules": [
      {
        "test": /\.tsx?$/,
        "use": ["ts-loader"],
        "exclude": /node_modules/,
      },
      {
        "test": /\.(jpg|png|mp4|ico|txt)$/,
        "use": "file-loader?name=[name].[ext]",
      },
      {
        "test": /\.css$/,
        "use": [
          {"loader": "style-loader", "options": {"injectType": "linkTag"}},
          {"loader": "file-loader?name=[name].[ext]"},
        ],
      },
    ],
  },

  "devServer": {
    "port": 8081,
    "proxy": {
      "/api": {
        "target": "http://localhost:9000",
        "secure": false,
        "changeOrigin": true,
      },
    },
  },
};

if (env === "production") {
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin(true));
  config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
  config.plugins.push(new webpack.LoaderOptionsPlugin({"minimize": true}));
} else {
  config.optimization = {
    "namedModules": true,
  };
  config.devtool = "eval-source-map";
  config.externals = {};
}

module.exports = config;
