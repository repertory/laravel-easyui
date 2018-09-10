window.$ = window.jQuery = require('jquery');
$.cookie = require('js-cookie');
window.moment = require('moment');
require('jeasyui/jquery.easyui.min');
require('jeasyui/locale/easyui-lang-zh_CN');
$.easyui.extension = require('./extension');
moment.locale('zh-cn');

$.fn.extend({
  options: function (options, callback) {
    if (typeof options == 'function') {
      callback = options;
      options = {};
    }
    if (!$(this).data('options')) {
      $(this).data('options', {});
    }
    options = $.extend($(this).data('options'), options || {});

    typeof callback == 'function' && callback.apply(this, [options, this]);
    return options;
  }
});
