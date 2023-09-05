import fs from 'fs'
import webpack from 'webpack'
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github']
      },
      //Necessary for electron to render properly
      chainWebpackRendererProcess(config) {
        config.plugin('define').tap((args) => {
          delete args[0]['import.meta.env'].BASE_URL
          return args
        })
      }
    }
  },
  // transpileDependencies: ['vuetify'],

  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'import.meta.env.PACKAGE_VERSION': '"' + version + '"'
      })
    ]
  },

  runtimeCompiler: true,
  lintOnSave: false
}
