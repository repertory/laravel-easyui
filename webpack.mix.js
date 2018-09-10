const fs = require('fs');
const mix = require('laravel-mix');

const publicPath = 'public';
const basePath = '../../../public';
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.setPublicPath(publicPath)
  .js('assets/js/app.js', 'js/laravel/easyui')
  .sass('assets/sass/app.scss', 'css/laravel/easyui')
  .sass('assets/sass/theme/black.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/bootstrap.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/default.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/gray.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/material.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/material-teal.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/metro.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/metro-blue.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/metro-gray.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/metro-green.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/metro-orange.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/metro-red.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/ui-cupertino.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/ui-dark-hive.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/ui-pepper-grinder.scss', 'css/laravel/easyui/theme')
  .sass('assets/sass/theme/ui-sunny.scss', 'css/laravel/easyui/theme');

fs.existsSync(basePath) && mix.copy(publicPath, basePath);
