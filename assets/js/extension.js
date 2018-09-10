// http://jeasyui.com/extension/portal.php
require('jeasyui/extension/jquery-easyui-portal/jquery.portal');

// http://jeasyui.com/extension/datagrid_filter.php
require('jeasyui/extension/datagrid-filter/datagrid-filter.js');

// http://jeasyui.com/extension/datagrid_export.php
// require('jeasyui/extension/datagrid-export/datagrid-export.js');
(function ($) {
  function getRows(target) {
    var state = $(target).data('datagrid');
    if (state.filterSource) {
      return state.filterSource.rows;
    } else {
      return state.data.rows;
    }
  }

  function toHtml(target, rows) {
    rows = rows || getRows(target);
    var dg = $(target);
    var data = ['<table border="1" rull="all" style="border-collapse:collapse">'];
    var fields = dg.datagrid('getColumnFields', true).concat(dg.datagrid('getColumnFields', false));
    var trStyle = 'height:32px';
    var tdStyle0 = 'vertical-align:middle;padding:0 4px';
    data.push('<tr style="' + trStyle + '">');
    fields = fields.filter(function (field) {
      var col = dg.datagrid('getColumnOption', field);
      return !!col.title && !!col.export;
    });
    for (var i = 0; i < fields.length; i++) {
      var col = dg.datagrid('getColumnOption', fields[i]);
      var tdStyle = tdStyle0 + ';width:' + col.boxWidth + 'px;';
      data.push('<th style="' + tdStyle + '">' + col.title + '</th>');
    }
    data.push('</tr>');
    $.map(rows, function (row, index) {
      data.push('<tr style="' + trStyle + '">');
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var col = dg.datagrid('getColumnOption', field);
        if (typeof col.formatter == 'function') {
          data.push(
            '<td style="' + tdStyle0 + '">' + col.formatter(row[field], row, index) + '</td>'
          );
        } else {
          data.push(
            '<td style="' + tdStyle0 + '">' + row[field] + '</td>'
          );
        }
      }
      data.push('</tr>');
    });
    data.push('</table>');
    return data.join('');
  }

  function toArray(target, rows) {
    rows = rows || getRows(target);
    var dg = $(target);
    var fields = dg.datagrid('getColumnFields', true).concat(dg.datagrid('getColumnFields', false));
    var data = [];
    var r = [];
    fields = fields.filter(function (field) {
      var col = dg.datagrid('getColumnOption', field);
      return !!col.title && !!col.export;
    });
    for (var i = 0; i < fields.length; i++) {
      var col = dg.datagrid('getColumnOption', fields[i]);
      r.push(col.title);
    }
    data.push(r);
    $.map(rows, function (row, index) {
      var r = [];
      for (var i = 0; i < fields.length; i++) {
        var col = dg.datagrid('getColumnOption', fields[i]);
        if (typeof col.formatter == 'function') {
          r.push(col.formatter(row[fields[i]], row, index));
        } else {
          r.push(row[fields[i]]);
        }
      }
      data.push(r);
    });
    return data;
  }

  function print(target, param) {
    var title = null;
    var rows = null;
    if (typeof param == 'string') {
      title = param;
    } else {
      title = param['title'];
      rows = param['rows'];
    }
    var newWindow = window.open('', '', 'width=800, height=500');
    var doc = newWindow.document.open();
    var content =
      '<!doctype html>' +
      '<html>' +
      '<head>' +
      '<meta charset="utf-8">' +
      '<title>' + title + '</title>' +
      '</head>' +
      '<body>' + toHtml(target, rows) + '</body>' +
      '</html>';
    doc.write(content);
    doc.close();
    newWindow.print();
  }

  function b64toBlob(data) {
    var sliceSize = 512;
    var chars = atob(data);
    var byteArrays = [];
    for (var offset = 0; offset < chars.length; offset += sliceSize) {
      var slice = chars.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {
      type: ''
    });
  }

  function toExcel(target, param) {
    var filename = null;
    var rows = null;
    var worksheet = 'Worksheet';
    if (typeof param == 'string') {
      filename = param;
    } else {
      filename = param['filename'];
      rows = param['rows'];
      worksheet = param['worksheet'] || 'Worksheet';
    }
    var dg = $(target);
    var uri = 'data:application/vnd.ms-excel;base64,',
      template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>',
      base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)))
      },
      format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
          return c[p];
        })
      }

    var table = toHtml(target, rows);
    var ctx = {
      worksheet: worksheet,
      table: table
    };
    var data = base64(format(template, ctx));
    if (window.navigator.msSaveBlob) {
      var blob = b64toBlob(data);
      window.navigator.msSaveBlob(blob, filename);
    } else {
      var alink = $('<a style="display:none"></a>').appendTo('body');
      alink[0].href = uri + data;
      alink[0].download = filename;
      alink[0].click();
      alink.remove();
    }
  }

  $.extend($.fn.datagrid.methods, {
    toHtml: function (jq, rows) {
      return toHtml(jq[0], rows);
    },
    toArray: function (jq, rows) {
      return toArray(jq[0], rows);
    },
    toExcel: function (jq, param) {
      return jq.each(function () {
        toExcel(this, param);
      });
    },
    print: function (jq, param) {
      return jq.each(function () {
        print(this, param);
      });
    }
  });
})(jQuery);

// http://jeasyui.com/extension/datagridview.php
require('jeasyui/extension/jquery-easyui-datagridview/datagrid-bufferview.js');
require('jeasyui/extension/jquery-easyui-datagridview/datagrid-detailview.js');
require('jeasyui/extension/jquery-easyui-datagridview/datagrid-groupview.js');
require('jeasyui/extension/jquery-easyui-datagridview/datagrid-scrollview.js');

// http://jeasyui.com/extension/edatagrid.php
require('jeasyui/extension/jquery-easyui-edatagrid/jquery.edatagrid.js');

// http://jeasyui.com/extension/datagrid_cellediting.php
require('jeasyui/extension/datagrid-cellediting/datagrid-cellediting.js');

// http://jeasyui.com/extension/columns_ext.php
require('jeasyui/extension/columns-ext/columns-ext.js');

// http://jeasyui.com/extension/etree.php
require('jeasyui/extension/jquery-easyui-etree/jquery.etree.js');
require('jeasyui/extension/jquery-easyui-etree/jquery.etree.lang.js');

// http://jeasyui.com/extension/datagrid_dnd.php
require('jeasyui/extension/datagrid-dnd/datagrid-dnd.js');

// http://jeasyui.com/extension/treegrid_dnd.php
require('jeasyui/extension/treegrid-dnd/treegrid-dnd.js');

// http://jeasyui.com/extension/pivotgrid.php
require('jeasyui/extension/jquery-easyui-pivotgrid/jquery.pivotgrid.js');

// http://jeasyui.com/extension/ribbon.php
require('jeasyui/extension/jquery-easyui-ribbon/jquery.ribbon.js');

// http://jeasyui.com/extension/texteditor.php
// require('jeasyui/extension/jquery-easyui-texteditor/jquery.texteditor.js');
(function ($) {
  function saveRange(target) {
    var opts = $.data(target, 'texteditor').options;
    opts.selectedRange = null;
    if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        var range = sel.getRangeAt(0);
        var pnode = range.commonAncestorContainer.parentNode;
        if ($(pnode).closest('.texteditor')[0] == $(target).parent()[0]) {
          opts.selectedRange = range;
        }
      }
    } else if (document.selection && document.selection.createRange) {
      var range = document.selection.createRange();
      var pnode = range.parentElement();
      if ($(pnode).closest('.texteditor')[0] == $(target).parent()[0]) {
        opts.selectedRange = range;
      }
    }
  }

  function restoreRange(target) {
    var opts = $.data(target, 'texteditor').options;
    var range = opts.selectedRange;
    if (window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
      if (range) {
        sel.addRange(range);
      }
    } else if (document.selection) {
      document.selection.empty();
      if (range && range.select) {
        range.select();
      }
    }
  }

  function insertContent(target, html) {
    var opts = $.data(target, 'texteditor').options;
    if (opts.selectedRange) {
      if (window.getSelection) {
        opts.selectedRange.collapse(false);
        opts.selectedRange.insertNode($(html)[0]);
      } else if (document.selection && opts.selectedRange.select) {
        opts.selectedRange.collapse(false);
        opts.selectedRange.pasteHTML($(html)[0]);
      }
    }
  }

  function updateToolbar(target) {
    var opts = $.data(target, 'texteditor').options;
    opts.dlgToolbar.find('.l-btn').each(function () {
      var cmd = $(this).attr('cmd');
      if (document.queryCommandState(cmd)) {
        $(this).linkbutton('select');
      } else {
        $(this).linkbutton('unselect');
      }
    });
    opts.dlgToolbar.find('.combobox-f').each(function () {
      var cmd = $(this).attr('cmd');
      var value = String(document.queryCommandValue(cmd) || '');
      value = value.replace(/['"]/g, '').toLowerCase();
      var copts = $(this).combo('options');
      var onChange = copts.onChange;
      copts.onChange = function () {
      };
      var data = $(this).combobox('getData');
      if ($.easyui.indexOfArray(data, copts.valueField, value) >= 0) {
        $(this).combobox('setValue', value);
      } else {
        $(this).combobox('clear');
      }
      copts.onChange = onChange;
    });
  }

  function buildEditor(target) {
    var opts = $.data(target, 'texteditor').options;
    $(opts.dlgToolbar).panel('clear').remove();
    opts.dlgToolbar = $('<div></div>');
    for (var i = 0; i < opts.toolbar.length; i++) {
      var tool = opts.toolbar[i];
      if (tool == '-') {
        $('<span class="dialog-tool-separator"></span>').appendTo(opts.dlgToolbar);
      } else {
        var cmd = opts.commands[tool];
        if (cmd) {
          cmd.type = cmd.type || 'linkbutton';
          cmd.plain = cmd.plain || true;
          var btn = $('<a href="javascript:;"></a>').appendTo(opts.dlgToolbar);
          btn.attr('cmd', tool);
          btn[cmd.type](cmd);
          if (cmd.onInit) {
            cmd.onInit.call(btn[0]);
          }
        }
      }
    }
    $(target).dialog($.extend({}, opts, {
      toolbar: opts.dlgToolbar
    }));
    $(target).attr('contenteditable', true);
    var input = $(target).dialog('dialog').children('.texteditor-value');
    if (!input.length) {
      input = $('<textarea class="texteditor-value" style="display:none"></textarea>').insertAfter(target);
    }
    input.attr('name', opts.name || $(target).attr('name'));
    $(target).dialog('dialog').unbind('.texteditor').bind('mouseup.texteditor keyup.texteditor', function () {
      saveRange(target);
      updateToolbar(target);
    }).bind('blur.texteditor input.texteditor', function (e) {
      input.val($(target).html());
      $(target)[0].value = $(target).html();
    });
    input.val($(target).html());
  }

  function buildColorPanel(mb) {
    var opts = $(mb).menubutton('options');
    if (!opts.menu) {
      opts.menu = $('<div class="menu-content texteditor-color"></div>');
    }
    opts.menu.menu({
      onShow: function () {
        if ($(this).is(':empty')) {
          var colors = [
            "0,0,0", "68,68,68", "102,102,102", "153,153,153", "204,204,204", "238,238,238", "243,243,243", "255,255,255",
            "244,204,204", "252,229,205", "255,242,204", "217,234,211", "208,224,227", "207,226,243", "217,210,233", "234,209,220",
            "234,153,153", "249,203,156", "255,229,153", "182,215,168", "162,196,201", "159,197,232", "180,167,214", "213,166,189",
            "224,102,102", "246,178,107", "255,217,102", "147,196,125", "118,165,175", "111,168,220", "142,124,195", "194,123,160",
            "204,0,0", "230,145,56", "241,194,50", "106,168,79", "69,129,142", "61,133,198", "103,78,167", "166,77,121",
            "153,0,0", "180,95,6", "191,144,0", "56,118,29", "19,79,92", "11,83,148", "53,28,117", "116,27,71",
            "102,0,0", "120,63,4", "127,96,0", "39,78,19", "12,52,61", "7,55,99", "32,18,77", "76,17,48"
          ];
          for (var i = 0; i < colors.length; i++) {
            var a = $('<a class="texteditor-colorcell"></a>').appendTo(this);
            a.css('backgroundColor', 'rgb(' + colors[i] + ')');
          }
        }
      }
    });
    opts.menu.bind('click', function (e) {
      if ($(e.target).hasClass('texteditor-colorcell')) {
        var color = $(e.target).css('backgroundColor');
        opts.onClick.call(mb, color);
        opts.menu.menu('hide');
      }
    });
    $(mb).menubutton({menu: opts.menu});	// attach the menu
  }

  function getInsertDialog(target, param) {
    var opts = $.data(target, 'texteditor').options;
    if (!opts.dlg) {
      opts.dlg = $('<div></div>').appendTo('body').dialog({
        modal: true,
        border: 'thin',
        buttons: [{
          text: '确定',
          width: 80,
          handler: function () {
            if (param.callback) {
              param.callback.call(opts.dlg[0]);
            }
          }
        }, {
          text: '取消',
          width: 80,
          handler: function () {
            opts.dlg.dialog('close');
          }
        }]
      });
    }
    var dlg = opts.dlg;
    if (param.content) {
      dlg.html(param.content);
    }
    dlg.dialog('setTitle', param.title || 'Insert');
    dlg.dialog('resize', {width: param.width || 400, height: param.height || 'auto'});
    dlg.dialog('center');
    return dlg;

  }

  function setDisabled(target, disabled) {
    if (disabled) {
      $(target).dialog('dialog').addClass('texteditor-disabled');
      $(target).removeAttr('contenteditable');
      $(target).next().attr('disabled', 'disabled');
    } else {
      $(target).dialog('dialog').removeClass('texteditor-disabled');
      $(target).attr('contenteditable', true);
      $(target).next().removeAttr('disabled');
    }
  }

  function setReadonly(target, mode) {
    var readonly = mode == undefined ? true : mode;
    if (readonly) {
      $(target).dialog('dialog').addClass('texteditor-readonly');
      $(target).removeAttr('contenteditable');
    } else {
      $(target).dialog('dialog').removeClass('texteditor-readonly');
      $(target).attr('contenteditable', true);
    }
  }

  $.fn.texteditor = function (options, param) {
    if (typeof options == 'string') {
      var method = $.fn.texteditor.methods[options];
      if (method) {
        return method(this, param);
      } else {
        return this.dialog(options, param);
      }
    }
    options = options || {};
    return this.each(function () {
      var state = $.data(this, 'texteditor');
      if (state) {
        $.extend(state.options, options);
      } else {
        state = $.data(this, 'texteditor', {
          options: $.extend({}, $.fn.texteditor.defaults, $.fn.texteditor.parseOptions(this), options)
        });
      }
      buildEditor(this);
    });
  };

  $.fn.texteditor.methods = {
    options: function (jq) {
      return jq.data('texteditor').options;
    },
    execCommand: function (jq, cmd) {
      return jq.each(function () {
        var a = cmd.split(' ');
        var c = a.shift();
        restoreRange(this);
        document.execCommand(c, false, a.join(' ') || null);
        updateToolbar(this);
        saveRange(this);
      });
    },
    getEditor: function (jq) {
      return jq.closest('.texteditor').children('.texteditor-body');
    },
    insertContent: function (jq, html) {
      return jq.each(function () {
        insertContent(this, html);
        $(this).dialog('dialog').children('.texteditor-value').val($(this).html());
      });
    },
    getInsertDialog: function (jq, param) {
      return getInsertDialog(jq[0], param);
    },
    destroy: function (jq) {
      return jq.each(function () {
        var opts = $(this).texteditor('options');
        $(opts.dlgToolbar).panel('clear');
        $(this).dialog('destroy');
      });
    },
    getValue: function (jq) {
      return jq.dialog('dialog').children('.texteditor-value').val();
    },
    setValue: function (jq, html) {
      return jq.each(function () {
        $(this).html(html);
        $(this).dialog('dialog').children('.texteditor-value').val($(this).html());
        this.value = $(this).html();
      });
    },
    disable: function (jq) {
      return jq.each(function () {
        setDisabled(this, true);
      });
    },
    enable: function (jq) {
      return jq.each(function () {
        setDisabled(this, false);
      });
    },
    readonly: function (jq, mode) {
      return jq.each(function () {
        setReadonly(this, mode);
      });
    }
  };

  $.fn.texteditor.parseOptions = function (target) {
    return $.extend({}, $.fn.dialog.parseOptions(target), {});
  };

  $.fn.texteditor.defaults = $.extend({}, $.fn.dialog.defaults, {
    title: null,
    cls: 'texteditor',
    bodyCls: 'texteditor-body',
    draggable: false,
    shadow: false,
    closable: false,
    inline: true,
    border: 'thin',
    name: '',
    toolbar: ['bold', 'italic', 'strikethrough', 'underline', '-', 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', '-', 'insertorderedlist', 'insertunorderedlist', 'outdent', 'indent', '-', 'insertimage', 'insertlink', '-', 'forecolor', 'backcolor', '-', 'formatblock', 'fontname', 'fontsize'],
    commands: {
      'bold': {
        type: 'linkbutton',
        iconCls: 'icon-bold',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'bold');
        }
      },
      'italic': {
        type: 'linkbutton',
        iconCls: 'icon-italic',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'italic');
        }
      },
      'strikethrough': {
        type: 'linkbutton',
        iconCls: 'icon-strikethrough',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'strikethrough');
        }
      },
      'underline': {
        type: 'linkbutton',
        iconCls: 'icon-underline',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'underline');
        }
      },
      'justifyleft': {
        type: 'linkbutton',
        iconCls: 'icon-justifyleft',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'justifyleft');
        }
      },
      'justifycenter': {
        type: 'linkbutton',
        iconCls: 'icon-justifycenter',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'justifycenter');
        }
      },
      'justifyright': {
        type: 'linkbutton',
        iconCls: 'icon-justifyright',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'justifyright');
        }
      },
      'justifyfull': {
        type: 'linkbutton',
        iconCls: 'icon-justifyfull',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'justifyfull');
        }
      },
      'insertorderedlist': {
        type: 'linkbutton',
        iconCls: 'icon-insertorderedlist',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'insertorderedlist');
        }
      },
      'insertunorderedlist': {
        type: 'linkbutton',
        iconCls: 'icon-insertunorderedlist',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'insertunorderedlist');
        }
      },
      'outdent': {
        type: 'linkbutton',
        iconCls: 'icon-outdent',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'outdent');
        }
      },
      'indent': {
        type: 'linkbutton',
        iconCls: 'icon-indent',
        onClick: function () {
          $(this).texteditor('getEditor').texteditor('execCommand', 'indent');
        }
      },
      'forecolor': {
        type: 'menubutton',
        iconCls: 'icon-forecolor',
        hasDownArrow: false,
        onInit: function () {
          buildColorPanel(this);
        },
        onClick: function (color) {
          $(this).texteditor('getEditor').texteditor('execCommand', 'forecolor ' + color);
        }
      },
      'backcolor': {
        type: 'menubutton',
        iconCls: 'icon-backcolor',
        hasDownArrow: false,
        onInit: function () {
          buildColorPanel(this);
        },
        onClick: function (color) {
          $(this).texteditor('getEditor').texteditor('execCommand', 'backcolor ' + color);
        }
      },
      'formatblock': {
        type: 'combobox',
        width: 120,
        prompt: '字体格式',
        editable: false,
        panelHeight: 'auto',
        data: [
          {value: 'p', text: 'p'},
          {value: 'pre', text: 'pre'},
          {value: 'h6', text: 'h6'},
          {value: 'h5', text: 'h5'},
          {value: 'h4', text: 'h4'},
          {value: 'h3', text: 'h3'},
          {value: 'h2', text: 'h2'},
          {value: 'h1', text: 'h1'}
        ],
        formatter: function (row) {
          return '<' + row.value + ' style="margin:0;padding:0">' + row.text + '</' + row.value + '>';
        },
        onChange: function (value) {
          $(this).texteditor('getEditor').texteditor('execCommand', 'formatblock ' + value);
        }
      },
      'fontname': {
        type: 'combobox',
        width: 120,
        prompt: '字体',
        editable: false,
        panelHeight: 'auto',
        data: [
          {value: 'SimSun', text: '宋体'},
          {value: 'FangSong_GB2312', text: '仿宋体'},
          {value: 'SimHei', text: '黑体'},
          {value: 'KaiTi_GB2312', text: '楷体'},
          {value: 'Microsoft YaHei', text: '微软雅黑'},
          {value: 'arial', text: 'Arial'},
          {value: 'comic sans ms', text: 'Comic Sans'},
          {value: 'courier new', text: 'Courier New'},
          {value: 'georgia', text: 'Georgia'},
          {value: 'helvetica', text: 'Helvetica'},
          {value: 'impact', text: 'Impact'},
          {value: 'times new roman', text: 'Times'},
          {value: 'trebuchet ms', text: 'Trebuchet'},
          {value: 'verdana', text: 'Verdana'}
        ],
        formatter: function (row) {
          return '<font face="' + row.value + '">' + row.text + '</font>';
        },
        onChange: function (value) {
          $(this).texteditor('getEditor').texteditor('execCommand', 'fontname ' + value);
        }
      },
      'fontsize': {
        type: 'combobox',
        width: 120,
        prompt: '字体大小',
        editable: false,
        panelHeight: 'auto',
        data: [
          {value: 1, text: 'Size 1'},
          {value: 2, text: 'Size 2'},
          {value: 3, text: 'Size 3'},
          {value: 4, text: 'Size 4'},
          {value: 5, text: 'Size 5'},
          {value: 6, text: 'Size 6'}
        ],
        formatter: function (row) {
          return '<font size="' + row.value + '">' + row.text + '</font>';
        },
        onChange: function (value) {
          $(this).texteditor('getEditor').texteditor('execCommand', 'fontsize ' + value);
        }
      },
      'insertimage': {
        type: 'linkbutton',
        iconCls: 'icon-image',
        onClick: function () {
          var content =
            '<div style="padding:40px 30px 40px 20px">' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-textbox img-src" label="地址:" labelAlign="right" style="width:100%">' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-textbox img-alt" label="描述:" labelAlign="right" style="width:100%">' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-numberbox img-width" label="宽度:" labelAlign="right" style="width:50%">' +
            '<input class="easyui-numberbox img-height" label="高度:" labelAlign="right" style="width:50%">' +
            '</div>' +
            '</div>';
          var te = $(this).texteditor('getEditor');
          var dlg = te.texteditor('getInsertDialog', {
            title: '插入图片',
            content: content,
            callback: function () {
              var src = $(this).find('.img-src').textbox('getValue');
              var alt = $(this).find('.img-alt').textbox('getValue');
              var width = $(this).find('.img-width').numberbox('getValue');
              var height = $(this).find('.img-height').numberbox('getValue');
              var style = '';
              if (width) {
                style += 'width:' + width + 'px;';
              }
              if (height) {
                style += 'height:' + height + 'px;';
              }
              var img = '<img src="' + src + '" alt="' + alt + '"' + (style ? ' style="' + style + '"' : '') + '>';
              te.texteditor('insertContent', img);
              $(this).dialog('close');
            }
          });
          $.parser.parse(dlg);
          dlg.dialog('open').dialog('resize').find('.img-src').textbox('textbox').focus();
        }
      },
      'insertlink': {
        type: 'linkbutton',
        iconCls: 'icon-link',
        onClick: function () {
          var content =
            '<div style="padding:40px 50px 40px 20px">' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-textbox link-url" label="地址:" labelAlign="right" validType="url" style="width:100%">' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-textbox link-text" label="文字:" labelAlign="right" style="width:100%">' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-textbox link-title" label="标题:" labelAlign="right" style="width:100%">' +
            '</div>' +
            '<div style="margin-bottom:20px">' +
            '<input class="easyui-combobox link-target" label="打开方式:" labelAlign="right" panelHeight="auto" data-options="editable:false,data:[{value:\'\',text:\'当前\'},{value:\'_blank\',text:\'新窗口\'}]" style="width:100%">' +
            '</div>' +
            '</div>';
          var te = $(this).texteditor('getEditor');
          var dlg = te.texteditor('getInsertDialog', {
            title: '插入链接',
            content: content,
            callback: function () {
              var url = $(this).find('.link-url').textbox('getValue');
              var text = $(this).find('.link-text').textbox('getValue') || url;
              var title = $(this).find('.link-title').textbox('getValue');
              var target = $(this).find('.link-target').combobox('getValue');
              var link = '<a href="' + url + '"' + (title ? ' title="' + title + '"' : '') + (target ? ' target="' + target + '"' : '') + '>' + text + '</a>';
              te.texteditor('insertContent', link);
              $(this).dialog('close');
            }
          });
          $.parser.parse(dlg);
          dlg.dialog('open').dialog('resize').find('.link-url').textbox('textbox').focus();
        }
      }
    }

  });

  $.parser.plugins.push('texteditor');
})(jQuery);

// http://jeasyui.com/extension/color.php
require('jeasyui/extension/jquery-easyui-color/jquery.color.js');

// http://jeasyui.com/extension/desktop.php
require('jeasyui/extension/jquery-easyui-desktop/jquery.desktop.js');

$.extend($.fn.datagrid.defaults.operators, {
  nofilter: {
    text: '不筛选'
  },
  contains: {
    text: '包含',
    isMatch: function (source, value) {
      source = String(source);
      value = String(value);
      return source.toLowerCase().indexOf(value.toLowerCase()) >= 0;
    }
  },
  notcontains: {
    text: '不包含',
    isMatch: function (source, value) {
      source = String(source);
      value = String(value);
      return source.toLowerCase().indexOf(value.toLowerCase()) < 0;
    }
  },
  equal: {
    text: '等于',
    isMatch: function (source, value) {
      return source == value;
    }
  },
  notequal: {
    text: '不等于',
    isMatch: function (source, value) {
      return source != value;
    }
  },
  beginwith: {
    text: '开始于',
    isMatch: function (source, value) {
      source = String(source);
      value = String(value);
      return source.toLowerCase().indexOf(value.toLowerCase()) == 0;
    }
  },
  endwith: {
    text: '结束于',
    isMatch: function (source, value) {
      source = String(source);
      value = String(value);
      return source.toLowerCase().indexOf(value.toLowerCase(), source.length - value.length) !== -1;
    }
  },
  less: {
    text: '小于',
    isMatch: function (source, value) {
      return source < value;
    }
  },
  lessorequal: {
    text: '小于或等于',
    isMatch: function (source, value) {
      return source <= value;
    }
  },
  greater: {
    text: '大于',
    isMatch: function (source, value) {
      return source > value;
    }
  },
  greaterorequal: {
    text: '大于或等于',
    isMatch: function (source, value) {
      return source >= value;
    }
  }
});

$.extend($.fn.datagrid.methods, {
  getRows: function (jq) {
    return $.data(jq[0], "datagrid").data.rows || [];
  }
});

$.extend($.messager, {
  success: function (title, msg) {
    $.messager.show({
      title: title,
      msg: `<div class="messager-icon messager-info"></div><div>${msg}</div>`,
      timeout: 2000,
      showType: 'slide'
    });
  },
  error: function (title, msg) {
    $.messager.show({
      title: title,
      msg: `<div class="messager-icon messager-error"></div><div>${msg}</div>`,
      timeout: 3000,
      showType: 'slide'
    });
  }
});

$.extend($.fn.panel.defaults, {
  loaderError: function (opts, xhr) {
    let content = `<div class="easyui-panel" fit="true" border="false" style="padding: 0 16px">
                      <h2>:(</h2>
                      <p>错误信息：${xhr.statusText}</p>
                      <p>错误码：　${xhr.status}</p>
                      <p>请求地址：${opts.href}</p>
                    </div>`
    switch (xhr.status) {
      case 401:
        content = `<div class="easyui-panel" fit="true" border="false" style="padding: 0 16px">
                      <h2>:(</h2>
                      <p>错误信息：抱歉，你已退出登录！</p>
                      <p>错误码：　${xhr.status}</p>
                      <p>请求地址：${opts.href}</p>
                    </div>`
        break;
      case 403:
        content = `<div class="easyui-panel" fit="true" border="false" style="padding: 0 16px">
                      <h2>:(</h2>
                      <p>错误信息：抱歉，你无权访问该页面！</p>
                      <p>错误码：　${xhr.status}</p>
                      <p>请求地址：${opts.href}</p>
                    </div>`
        break;
      case 404:
        content = `<div class="easyui-panel" fit="true" border="false" style="padding: 0 16px">
                      <h2>:(</h2>
                      <p>错误信息：抱歉，您访问的页面不存在！</p>
                      <p>错误码：　${xhr.status}</p>
                      <p>请求地址：${opts.href}</p>
                    </div>`
        break;
    }
    return content;
  },
  loader: function (param, success) {
    let opts = $(this).panel("options");
    if (!opts.href) {
      return false;
    }
    if (opts.iframe) {
      let html = [];
      html.push('<div class="panel-loading" style="position: absolute;width:100%;height:100%;">Loading...</div>');
      html.push('<iframe width="100%" height="100%" allowtransparency="true" src="' + opts.href + '"');
      html.push(' style="background-color:transparent;border:none;margin-bottom:-5px;"');
      html.push(' onload="this.previousSibling.remove()"');
      html.push('></iframe>');
      success(`<div class="panel-loading"
                    style="position: absolute;width:100%;height:100%;">Loading...</div>
               <iframe src="${opts.href}"
                       frameborder="0"
                       width="100%"
                       height="100%"
                       allowtransparency="true"
                       onload="$(this).prev().remove()"
                       style="margin-bottom:-5px;"></iframe>`);
      return false;
    }
    $.ajax({
      type: opts.method,
      url: opts.href,
      cache: false,
      data: param,
      dataType: "html",
      success: function (data, textStatus, xhr) {
        let module = new Date().getTime();
        data = data
          .replace(/<style[^>]*?>[\s\S]*?<\/style>/ig, function (style) {
            return style.replace(/\:module/ig, `[module="${module}"]`);
          })
          .replace(/\:module/ig, `[module=${module}]`);
        success(`<div class="easyui-panel" border="false" fit="true" module="${module}">${data}</div>`);
      },
      error: function (xhr) {
        success($.fn.panel.defaults.loaderError(opts, xhr));
      }
    });
  }
});
$.extend($.fn.layout.paneldefaults, {
  loader: $.fn.panel.defaults.loader
});
$.extend($.fn.dialog.defaults, {
  loader: $.fn.panel.defaults.loader
});
$.extend($.fn.window.defaults, {
  loader: $.fn.panel.defaults.loader
});
$.extend($.fn.form.methods, {
  ajax: function (jq, options) {
    function ajaxSubmit(target, options) {
      let opts = $.data(target, 'form').options;
      $.extend(opts, options || {});

      let param = $.extend({}, opts.queryParams);
      if (opts.onSubmit.call(target, param) == false) {
        return;
      }

      // $(target).find('.textbox-text:focus').blur();
      let input = $(target).find('.textbox-text:focus');
      input.triggerHandler('blur');
      input.focus();

      let disabledFields = null; // the fields to be disabled
      if (opts.dirty) {
        let ff = []; // all the dirty fields
        $.map(opts.dirtyFields, function (f) {
          if ($(f).hasClass('textbox-f')) {
            $(f).next().find('.textbox-value').each(function () {
              ff.push(this);
            });
          } else {
            ff.push(f);
          }
        });
        disabledFields = $(target).find('input[name]:enabled,textarea[name]:enabled,select[name]:enabled').filter(function () {
          return $.inArray(this, ff) == -1;
        });
        disabledFields.attr('disabled', 'disabled');
      }

      if (opts.ajax) {
        submitXhr(target, param);
      } else {
        $(target).submit();
      }

      if (opts.dirty) {
        disabledFields.removeAttr('disabled');
      }
    }

    function submitXhr(target, param) {
      let opts = $.data(target, 'form').options;
      let formData = new FormData($(target)[0]);
      for (let name in param) {
        formData.append(name, param[name]);
      }
      $.ajax({
        url: opts.url,
        type: opts.type || 'post',
        data: formData,
        cache: opts.cache || false,
        contentType: opts.contentType || false,
        processData: opts.processData || false,
        beforeSend: function (XHR) {
          opts.beforeSend && opts.beforeSend.call(target, XHR);
          if (opts.progressbar) {
            $.messager.progress({
              title: opts.progressbar,
              text: '0%',
              interval: false
            });
          }
        },
        success: function (data, textStatus, jqXHR) {
          opts.success.call(target, data, textStatus, jqXHR);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (typeof opts.error !== 'function') {
            let error = {
              title: '操作失败',
              status: {
                401: '请先登录！',
                403: '抱歉，你没有权限，请联系管理员！',
                404: '数据不存在或已删除！',
              }
            };
            opts.error && $.extend(error, typeof opts.error === 'object' ? opts.error : {
              title: opts.error || '操作失败'
            });
            if (!jqXHR.responseJSON) {
              jqXHR.responseJSON = {
                message: undefined
              };
            }
            let msg = error.msg || error.status[parseInt(jqXHR.status)] || jqXHR.responseJSON.message || errorThrown;
            $.messager.error(error.title, msg);
          } else {
            opts.error.call(target, jqXHR, textStatus, errorThrown);
          }
        },
        complete: function (XHR, TS) {
          opts.complete && opts.complete.call(target, XHR, TS);
          if (opts.progressbar) {
            $.messager.progress('close');
          }
        },
        xhr: function () {
          let xhr = $.ajaxSettings.xhr();
          if (xhr.upload) {
            xhr.upload.addEventListener('progress', function (e) {
              if (e.lengthComputable) {
                let total = e.total;
                let position = e.loaded || e.position;
                let percent = Math.ceil(position * 100 / total);
                opts.onProgress.call(target, percent);
                if (opts.progressbar) {
                  $('.messager-p-bar:first', '.messager-window').progressbar({
                    text: percent + '%',
                    value: percent,
                  });
                }
              }
            }, false);
          }
          return xhr;
        }
      });
    }

    return jq.each(function () {
      ajaxSubmit(this, options);
    });
  }
});


let extension = {
  datagrid: {}
};

$.extend(extension.datagrid, {
  bufferview: $.extend({}, $.fn.datagrid.defaults.view, {
    render: function (target, container, frozen) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var rows = this.rows || [];
      if (!rows.length) {
        return;
      }
      var fields = $(target).datagrid('getColumnFields', frozen);

      if (frozen) {
        if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
          return;
        }
      }

      var index = parseInt(opts.finder.getTr(target, '', 'last', (frozen ? 1 : 2)).attr('datagrid-row-index')) + 1 || 0;
      var table = ['<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>'];
      for (var i = 0; i < rows.length; i++) {
        // get the class and style attributes for this row
        var css = opts.rowStyler ? opts.rowStyler.call(target, index, rows[i]) : '';
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }

        var cls = 'class="datagrid-row ' + (index % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
        var style = styleValue ? 'style="' + styleValue + '"' : '';
        var rowId = state.rowIdPrefix + '-' + (frozen ? 1 : 2) + '-' + index;
        table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
        table.push(this.renderRow.call(this, target, fields, frozen, index, rows[i]));
        table.push('</tr>');
        index++;
      }
      table.push('</tbody></table>');

      $(container).append(table.join(''));
    },

    onBeforeRender: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      var view = this;
      this.renderedCount = 0;
      this.rows = [];

      dc.body1.add(dc.body2).empty();
      init();

      function init() {
        opts.rowHeight = $(target).datagrid('getRowHeight');
        // erase the onLoadSuccess event, make sure it can't be triggered
        state.onLoadSuccess = opts.onLoadSuccess;
        opts.onLoadSuccess = function () {
        };
        setTimeout(function () {
          dc.body2.unbind('.datagrid').bind('scroll.datagrid', function (e) {
            if (state.onLoadSuccess) {
              opts.onLoadSuccess = state.onLoadSuccess; // restore the onLoadSuccess event
              state.onLoadSuccess = undefined;
            }
            if (view.scrollTimer) {
              clearTimeout(view.scrollTimer);
            }
            view.scrollTimer = setTimeout(function () {
              scrolling.call(view);
            }, 50);
          });
          dc.body2.triggerHandler('scroll.datagrid');
        }, 0);
      }

      function scrolling() {
        if (getDataHeight() < dc.body2.height() && view.renderedCount < state.data.total) {
          this.getRows.call(this, target, function (rows) {
            this.rows = rows;
            this.populate.call(this, target);
            dc.body2.triggerHandler('scroll.datagrid');
          });
        } else if (dc.body2.scrollTop() >= getDataHeight() - dc.body2.height()) {
          this.getRows.call(this, target, function (rows) {
            this.rows = rows;
            this.populate.call(this, target);
          });
        }
      }

      function getDataHeight() {
        // var h = 0;
        // dc.body2.children('table.datagrid-btable').each(function(){
        // 	h += $(this).outerHeight();
        // });
        // if (!h){
        // 	h = view.renderedCount * opts.rowHeight;
        // }
        // return h;
        return view.renderedCount * opts.rowHeight;
      }
    },

    getRows: function (target, callback) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var page = Math.floor(this.renderedCount / opts.pageSize) + 1;

      if (this.renderedCount >= state.data.total) {
        return;
      }
      if (opts.onBeforeFetch.call(target, page) == false) {
        return
      }

      //		var rows = state.data.rows.slice(this.renderedCount, this.renderedCount+opts.pageSize);
      var index = (page - 1) * opts.pageSize;
      var rows = state.data.rows.slice(index, index + opts.pageSize);
      if (rows.length) {
        opts.onFetch.call(target, page, rows);
        callback.call(this, rows);
      } else {
        var param = $.extend({}, opts.queryParams, {
          page: Math.floor(this.renderedCount / opts.pageSize) + 1,
          rows: opts.pageSize
        });
        if (opts.sortName) {
          $.extend(param, {
            sort: opts.sortName,
            order: opts.sortOrder
          });
        }
        if (opts.onBeforeLoad.call(target, param) == false) {
          return;
        }

        $(target).datagrid('loading');
        var result = opts.loader.call(target, param, function (data) {
          $(target).datagrid('loaded');
          var data = opts.loadFilter.call(target, data);
          opts.onFetch.call(target, page, data.rows);
          if (data.rows && data.rows.length) {
            state.data.rows = state.data.rows.concat(data.rows);
            callback.call(opts.view, data.rows);
          } else {
            opts.onLoadSuccess.call(target, data);
          }
        }, function () {
          $(target).datagrid('loaded');
          opts.onLoadError.apply(target, arguments);
        });
        if (result == false) {
          $(target).datagrid('loaded');
          if (!state.data.rows.length) {
            opts.onFetch.call(target, page, state.data.rows);
            opts.onLoadSuccess.call(target, state.data);
          }
        }
      }
    },

    populate: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      if (this.rows.length) {
        this.renderedCount += this.rows.length;
        this.render.call(this, target, dc.body2, false);
        this.render.call(this, target, dc.body1, true);
        opts.onLoadSuccess.call(target, {
          total: state.data.total,
          rows: this.rows
        });
        //			for(var i=this.renderedCount-this.rows.length; i<this.renderedCount; i++){
        //				$(target).datagrid('fixRowHeight', i);
        //			}
      }
    }
  }),
  defaultView: {
    render: function (target, container, frozen) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var rows = state.data.rows || [];
      var fields = $(target).datagrid('getColumnFields', frozen);

      if (frozen) {
        if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
          return;
        }
      }

      var table = ['<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>'];
      for (var i = 0; i < rows.length; i++) {
        // get the class and style attributes for this row
        var css = opts.rowStyler ? opts.rowStyler.call(target, i, rows[i]) : '';
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }

        var cls = 'class="datagrid-row ' + (i % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
        var style = styleValue ? 'style="' + styleValue + '"' : '';
        var rowId = state.rowIdPrefix + '-' + (frozen ? 1 : 2) + '-' + i;
        table.push('<tr id="' + rowId + '" datagrid-row-index="' + i + '" ' + cls + ' ' + style + '>');
        table.push(this.renderRow.call(this, target, fields, frozen, i, rows[i]));
        table.push('</tr>');
      }
      table.push('</tbody></table>');

      $(container).html(table.join(''));
    },

    renderFooter: function (target, container, frozen) {
      var opts = $.data(target, 'datagrid').options;
      var rows = $.data(target, 'datagrid').footer || [];
      var fields = $(target).datagrid('getColumnFields', frozen);
      var table = ['<table class="datagrid-ftable" cellspacing="0" cellpadding="0" border="0"><tbody>'];

      for (var i = 0; i < rows.length; i++) {
        table.push('<tr class="datagrid-row" datagrid-row-index="' + i + '">');
        table.push(this.renderRow.call(this, target, fields, frozen, i, rows[i]));
        table.push('</tr>');
      }

      table.push('</tbody></table>');
      $(container).html(table.join(''));
    },

    renderRow: function (target, fields, frozen, rowIndex, rowData) {
      var opts = $.data(target, 'datagrid').options;

      var cc = [];
      if (frozen && opts.rownumbers) {
        var rownumber = rowIndex + 1;
        if (opts.pagination) {
          rownumber += (opts.pageNumber - 1) * opts.pageSize;
        }
        cc.push('<td class="datagrid-td-rownumber"><div class="datagrid-cell-rownumber">' + rownumber + '</div></td>');
      }
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var col = $(target).datagrid('getColumnOption', field);
        if (col) {
          var value = rowData[field]; // the field value
          var css = col.styler ? (col.styler(value, rowData, rowIndex) || '') : '';
          var classValue = '';
          var styleValue = '';
          if (typeof css == 'string') {
            styleValue = css;
          } else if (cc) {
            classValue = css['class'] || '';
            styleValue = css['style'] || '';
          }
          var cls = classValue ? 'class="' + classValue + '"' : '';
          var style = col.hidden ? 'style="display:none;' + styleValue + '"' : (styleValue ? 'style="' + styleValue + '"' : '');

          cc.push('<td field="' + field + '" ' + cls + ' ' + style + '>');

          if (col.checkbox) {
            var style = '';
          } else {
            var style = styleValue;
            if (col.align) {
              style += ';text-align:' + col.align + ';'
            }
            if (!opts.nowrap) {
              style += ';white-space:normal;height:auto;';
            } else if (opts.autoRowHeight) {
              style += ';height:auto;';
            }
          }

          cc.push('<div style="' + style + '" ');
          cc.push(col.checkbox ? 'class="datagrid-cell-check"' : 'class="datagrid-cell ' + col.cellClass + '"');
          cc.push('>');

          if (col.checkbox) {
            cc.push('<input type="checkbox" name="' + field + '" value="' + (value != undefined ? value : '') + '">');
          } else if (col.formatter) {
            cc.push(col.formatter(value, rowData, rowIndex));
          } else {
            cc.push(value);
          }

          cc.push('</div>');
          cc.push('</td>');
        }
      }
      return cc.join('');
    },

    refreshRow: function (target, rowIndex) {
      this.updateRow.call(this, target, rowIndex, {});
    },

    updateRow: function (target, rowIndex, row) {
      var opts = $.data(target, 'datagrid').options;
      var rows = $(target).datagrid('getRows');
      $.extend(rows[rowIndex], row);
      var css = opts.rowStyler ? opts.rowStyler.call(target, rowIndex, rows[rowIndex]) : '';
      var classValue = '';
      var styleValue = '';
      if (typeof css == 'string') {
        styleValue = css;
      } else if (css) {
        classValue = css['class'] || '';
        styleValue = css['style'] || '';
      }
      var classValue = 'datagrid-row ' + (rowIndex % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue;

      function _update(frozen) {
        var fields = $(target).datagrid('getColumnFields', frozen);
        var tr = opts.finder.getTr(target, rowIndex, 'body', (frozen ? 1 : 2));
        var checked = tr.find('div.datagrid-cell-check input[type=checkbox]').is(':checked');
        tr.html(this.renderRow.call(this, target, fields, frozen, rowIndex, rows[rowIndex]));
        tr.attr('style', styleValue).attr('class', classValue);
        if (checked) {
          tr.find('div.datagrid-cell-check input[type=checkbox]')._propAttr('checked', true);
        }
      }

      _update.call(this, true);
      _update.call(this, false);
      $(target).datagrid('fixRowHeight', rowIndex);
    },

    insertRow: function (target, index, row) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      var data = state.data;

      if (index == undefined || index == null) index = data.rows.length;
      if (index > data.rows.length) index = data.rows.length;

      function _incIndex(frozen) {
        var serno = frozen ? 1 : 2;
        for (var i = data.rows.length - 1; i >= index; i--) {
          var tr = opts.finder.getTr(target, i, 'body', serno);
          tr.attr('datagrid-row-index', i + 1);
          tr.attr('id', state.rowIdPrefix + '-' + serno + '-' + (i + 1));
          if (frozen && opts.rownumbers) {
            var rownumber = i + 2;
            if (opts.pagination) {
              rownumber += (opts.pageNumber - 1) * opts.pageSize;
            }
            tr.find('div.datagrid-cell-rownumber').html(rownumber);
          }
          if (opts.striped) {
            tr.removeClass('datagrid-row-alt').addClass((i + 1) % 2 ? 'datagrid-row-alt' : '');
          }
        }
      }

      function _insert(frozen) {
        var serno = frozen ? 1 : 2;
        var fields = $(target).datagrid('getColumnFields', frozen);
        var rowId = state.rowIdPrefix + '-' + serno + '-' + index;
        var tr = '<tr id="' + rowId + '" class="datagrid-row" datagrid-row-index="' + index + '"></tr>';
        //				var tr = '<tr id="' + rowId + '" class="datagrid-row" datagrid-row-index="' + index + '">' + this.renderRow.call(this, target, fields, frozen, index, row) + '</tr>';
        if (index >= data.rows.length) { // append new row
          if (data.rows.length) { // not empty
            opts.finder.getTr(target, '', 'last', serno).after(tr);
          } else {
            var cc = frozen ? dc.body1 : dc.body2;
            cc.html('<table cellspacing="0" cellpadding="0" border="0"><tbody>' + tr + '</tbody></table>');
          }
        } else { // insert new row
          opts.finder.getTr(target, index + 1, 'body', serno).before(tr);
        }
      }

      _incIndex.call(this, true);
      _incIndex.call(this, false);
      _insert.call(this, true);
      _insert.call(this, false);

      data.total += 1;
      data.rows.splice(index, 0, row);

      this.refreshRow.call(this, target, index);
    },

    deleteRow: function (target, index) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var data = state.data;

      function _decIndex(frozen) {
        var serno = frozen ? 1 : 2;
        for (var i = index + 1; i < data.rows.length; i++) {
          var tr = opts.finder.getTr(target, i, 'body', serno);
          tr.attr('datagrid-row-index', i - 1);
          tr.attr('id', state.rowIdPrefix + '-' + serno + '-' + (i - 1));
          if (frozen && opts.rownumbers) {
            var rownumber = i;
            if (opts.pagination) {
              rownumber += (opts.pageNumber - 1) * opts.pageSize;
            }
            tr.find('div.datagrid-cell-rownumber').html(rownumber);
          }
          if (opts.striped) {
            tr.removeClass('datagrid-row-alt').addClass((i - 1) % 2 ? 'datagrid-row-alt' : '');
          }
        }
      }

      opts.finder.getTr(target, index).remove();
      _decIndex.call(this, true);
      _decIndex.call(this, false);

      data.total -= 1;
      data.rows.splice(index, 1);
    },

    onBeforeRender: function (target, rows) {
    },
    onAfterRender: function (target) {
      var opts = $.data(target, 'datagrid').options;
      if (opts.showFooter) {
        var footer = $(target).datagrid('getPanel').find('div.datagrid-footer');
        footer.find('div.datagrid-cell-rownumber,div.datagrid-cell-check').css('visibility', 'hidden');
      }
    }
  },
  detailview: $.extend({}, $.fn.datagrid.defaults.view, {
    render: function (target, container, frozen) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      if (frozen) {
        if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
          return;
        }
      }

      var rows = state.data.rows || [];
      var fields = $(target).datagrid('getColumnFields', frozen);
      var table = [];
      table.push('<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>');
      for (var i = 0; i < rows.length; i++) {
        // get the class and style attributes for this row
        var css = opts.rowStyler ? opts.rowStyler.call(target, i, rows[i]) : '';
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }

        var cls = 'class="datagrid-row ' + (i % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
        var style = styleValue ? 'style="' + styleValue + '"' : '';
        var rowId = state.rowIdPrefix + '-' + (frozen ? 1 : 2) + '-' + i;
        table.push('<tr id="' + rowId + '" datagrid-row-index="' + i + '" ' + cls + ' ' + style + '>');
        table.push(this.renderRow.call(this, target, fields, frozen, i, rows[i]));
        table.push('</tr>');

        table.push('<tr style="display:none;">');
        if (frozen) {
          table.push('<td colspan=' + (fields.length + (opts.rownumbers ? 1 : 0)) + ' style="border-right:0">');
        } else {
          table.push('<td colspan=' + (fields.length) + '>');
        }

        table.push('<div class="datagrid-row-detail">');
        if (frozen) {
          table.push('&nbsp;');
        } else {
          table.push(opts.detailFormatter.call(target, i, rows[i]));
        }
        table.push('</div>');

        table.push('</td>');
        table.push('</tr>');

      }
      table.push('</tbody></table>');

      $(container).html(table.join(''));
    },

    renderRow: function (target, fields, frozen, rowIndex, rowData) {
      var opts = $.data(target, 'datagrid').options;

      var cc = [];
      if (frozen && opts.rownumbers) {
        var rownumber = rowIndex + 1;
        if (opts.pagination) {
          rownumber += (opts.pageNumber - 1) * opts.pageSize;
        }
        cc.push('<td class="datagrid-td-rownumber"><div class="datagrid-cell-rownumber">' + rownumber + '</div></td>');
      }
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var col = $(target).datagrid('getColumnOption', field);
        if (col) {
          var value = rowData[field]; // the field value
          var css = col.styler ? (col.styler(value, rowData, rowIndex) || '') : '';
          var classValue = '';
          var styleValue = '';
          if (typeof css == 'string') {
            styleValue = css;
          } else if (cc) {
            classValue = css['class'] || '';
            styleValue = css['style'] || '';
          }
          var cls = classValue ? 'class="' + classValue + '"' : '';
          var style = col.hidden ? 'style="display:none;' + styleValue + '"' : (styleValue ? 'style="' + styleValue + '"' : '');

          cc.push('<td field="' + field + '" ' + cls + ' ' + style + '>');

          if (col.checkbox) {
            style = '';
          } else if (col.expander) {
            style = "text-align:center;height:16px;";
          } else {
            style = styleValue;
            if (col.align) {
              style += ';text-align:' + col.align + ';'
            }
            if (!opts.nowrap) {
              style += ';white-space:normal;height:auto;';
            } else if (opts.autoRowHeight) {
              style += ';height:auto;';
            }
          }

          cc.push('<div style="' + style + '" ');
          if (col.checkbox) {
            cc.push('class="datagrid-cell-check ');
          } else {
            cc.push('class="datagrid-cell ' + col.cellClass);
          }
          cc.push('">');

          if (col.checkbox) {
            cc.push('<input type="checkbox" name="' + field + '" value="' + (value != undefined ? value : '') + '">');
          } else if (col.expander) {
            //cc.push('<div style="text-align:center;width:16px;height:16px;">');
            cc.push('<span class="datagrid-row-expander datagrid-row-expand" style="display:inline-block;width:16px;height:16px;margin:0;cursor:pointer;" />');
            //cc.push('</div>');
          } else if (col.formatter) {
            cc.push(col.formatter(value, rowData, rowIndex));
          } else {
            cc.push(value);
          }

          cc.push('</div>');
          cc.push('</td>');
        }
      }
      return cc.join('');
    },

    insertRow: function (target, index, row) {
      var opts = $.data(target, 'datagrid').options;
      var dc = $.data(target, 'datagrid').dc;
      var panel = $(target).datagrid('getPanel');
      var view1 = dc.view1;
      var view2 = dc.view2;

      var isAppend = false;
      var rowLength = $(target).datagrid('getRows').length;
      if (rowLength == 0) {
        $(target).datagrid('loadData', {
          total: 1,
          rows: [row]
        });
        return;
      }

      if (index == undefined || index == null || index >= rowLength) {
        index = rowLength;
        isAppend = true;
        this.canUpdateDetail = false;
      }

      $.fn.datagrid.defaults.view.insertRow.call(this, target, index, row);

      _insert(true);
      _insert(false);

      this.canUpdateDetail = true;

      function _insert(frozen) {
        var tr = opts.finder.getTr(target, index, 'body', frozen ? 1 : 2);
        if (isAppend) {
          var detail = tr.next();
          var newDetail = tr.next().clone();
          tr.insertAfter(detail);
        } else {
          var newDetail = tr.next().next().clone();
        }
        newDetail.insertAfter(tr);
        newDetail.hide();
        if (!frozen) {
          newDetail.find('div.datagrid-row-detail').html(opts.detailFormatter.call(target, index, row));
        }
      }
    },

    deleteRow: function (target, index) {
      var opts = $.data(target, 'datagrid').options;
      var dc = $.data(target, 'datagrid').dc;
      var tr = opts.finder.getTr(target, index);
      tr.next().remove();
      $.fn.datagrid.defaults.view.deleteRow.call(this, target, index);
      dc.body2.triggerHandler('scroll');
    },

    updateRow: function (target, rowIndex, row) {
      var dc = $.data(target, 'datagrid').dc;
      var opts = $.data(target, 'datagrid').options;
      var cls = $(target).datagrid('getExpander', rowIndex).attr('class');
      $.fn.datagrid.defaults.view.updateRow.call(this, target, rowIndex, row);
      $(target).datagrid('getExpander', rowIndex).attr('class', cls);

      // update the detail content
      if (opts.autoUpdateDetail && this.canUpdateDetail) {
        var row = $(target).datagrid('getRows')[rowIndex];
        var detail = $(target).datagrid('getRowDetail', rowIndex);
        detail.html(opts.detailFormatter.call(target, rowIndex, row));
      }
    },

    bindEvents: function (target) {
      var state = $.data(target, 'datagrid');

      if (state.ss.bindDetailEvents) {
        return;
      }
      state.ss.bindDetailEvents = true;

      var dc = state.dc;
      var opts = state.options;
      var body = dc.body1.add(dc.body2);
      var clickHandler = ($.data(body[0], 'events') || $._data(body[0], 'events')).click[0].handler;
      body.unbind('click.detailview').bind('click.detailview', function (e) {
        var tt = $(e.target);
        var tr = tt.closest('tr.datagrid-row');
        if (!tr.length) {
          return
        }
        if (tt.hasClass('datagrid-row-expander')) {
          var rowIndex = parseInt(tr.attr('datagrid-row-index'));
          if (tt.hasClass('datagrid-row-expand')) {
            $(target).datagrid('expandRow', rowIndex);
          } else {
            $(target).datagrid('collapseRow', rowIndex);
          }
          $(target).datagrid('fixRowHeight');
          e.stopPropagation();

        } else {
          // clickHandler(e);
        }
      });
    },

    onBeforeRender: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      var t = $(target);
      var hasExpander = false;
      var fields = t.datagrid('getColumnFields', true).concat(t.datagrid('getColumnFields'));
      for (var i = 0; i < fields.length; i++) {
        var col = t.datagrid('getColumnOption', fields[i]);
        if (col.expander) {
          hasExpander = true;
          break;
        }
      }
      if (!hasExpander) {
        if (opts.frozenColumns && opts.frozenColumns.length) {
          opts.frozenColumns[0].splice(0, 0, {
            field: '_expander',
            expander: true,
            width: 24,
            resizable: false,
            fixed: true
          });
        } else {
          opts.frozenColumns = [
            [{
              field: '_expander',
              expander: true,
              width: 24,
              resizable: false,
              fixed: true
            }]
          ];
        }

        var t = dc.view1.children('div.datagrid-header').find('table');
        var td = $('<td rowspan="' + opts.frozenColumns.length + '"><div class="datagrid-header-expander" style="width:24px;"></div></td>');
        if ($('tr', t).length == 0) {
          td.wrap('<tr></tr>').parent().appendTo($('tbody', t));
        } else if (opts.rownumbers) {
          td.insertAfter(t.find('td:has(div.datagrid-header-rownumber)'));
        } else {
          td.prependTo(t.find('tr:first'));
        }
      }

      // if (!state.bindDetailEvents){
      // 	state.bindDetailEvents = true;
      // 	var that = this;
      // 	setTimeout(function(){
      // 		that.bindEvents(target);
      // 	},0);
      // }
    },

    onAfterRender: function (target) {
      var that = this;
      var state = $.data(target, 'datagrid');
      var dc = state.dc;
      var opts = state.options;
      var panel = $(target).datagrid('getPanel');

      $.fn.datagrid.defaults.view.onAfterRender.call(this, target);

      if (!state.onResizeColumn) {
        state.onResizeColumn = opts.onResizeColumn;
        opts.onResizeColumn = function (field, width) {
          if (!opts.fitColumns) {
            resizeDetails();
          }
          var rowCount = $(target).datagrid('getRows').length;
          for (var i = 0; i < rowCount; i++) {
            $(target).datagrid('fixDetailRowHeight', i);
          }

          // call the old event code
          state.onResizeColumn.call(target, field, width);
        };
      }
      if (!state.onResize) {
        state.onResize = opts.onResize;
        opts.onResize = function (width, height) {
          if (opts.fitColumns) {
            resizeDetails();
          }
          state.onResize.call(panel, width, height);
        };
      }

      // function resizeDetails(){
      // 	var details = dc.body2.find('>table.datagrid-btable>tbody>tr>td>div.datagrid-row-detail:visible');
      // 	if (details.length){
      // 		var ww = 0;
      // 		dc.header2.find('.datagrid-header-check:visible,.datagrid-cell:visible').each(function(){
      // 			ww += $(this).outerWidth(true) + 1;
      // 		});
      // 		if (ww != details.outerWidth(true)){
      // 			details._outerWidth(ww);
      // 			details.find('.easyui-fluid').trigger('_resize');
      // 		}
      // 	}
      // }
      function resizeDetails() {
        var details = dc.body2.find('>table.datagrid-btable>tbody>tr>td>div.datagrid-row-detail:visible');
        if (details.length) {
          var ww = 0;
          // dc.header2.find('.datagrid-header-check:visible,.datagrid-cell:visible').each(function(){
          // 	ww += $(this).outerWidth(true) + 1;
          // });
          dc.body2.find('>table.datagrid-btable>tbody>tr:visible:first').find('.datagrid-cell-check:visible,.datagrid-cell:visible').each(function () {
            ww += $(this).outerWidth(true) + 1;
          });
          if (ww != details.outerWidth(true)) {
            details._outerWidth(ww);
            details.find('.easyui-fluid').trigger('_resize');
          }
        }
      }


      this.canUpdateDetail = true; // define if to update the detail content when 'updateRow' method is called;

      var footer = dc.footer1.add(dc.footer2);
      footer.find('span.datagrid-row-expander').css('visibility', 'hidden');
      $(target).datagrid('resize');

      this.bindEvents(target);
      var detail = dc.body1.add(dc.body2).find('div.datagrid-row-detail');
      detail.unbind().bind('mouseover mouseout click dblclick contextmenu scroll', function (e) {
        e.stopPropagation();
      });
    }
  }),
  groupview: $.extend({}, $.fn.datagrid.defaults.view, {
    render: function (target, container, frozen) {
      var table = [];
      var groups = this.groups;
      for (var i = 0; i < groups.length; i++) {
        table.push(this.renderGroup.call(this, target, i, groups[i], frozen));
      }
      $(container).html(table.join(''));
    },

    renderGroup: function (target, groupIndex, group, frozen) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var fields = $(target).datagrid('getColumnFields', frozen);
      var hasFrozen = opts.frozenColumns && opts.frozenColumns.length;

      if (frozen) {
        if (!(opts.rownumbers || hasFrozen)) {
          return '';
        }
      }

      var table = [];

      var css = opts.groupStyler.call(target, group.value, group.rows);
      var cs = parseCss(css, 'datagrid-group');
      table.push('<div group-index=' + groupIndex + ' ' + cs + '>');
      if ((frozen && (opts.rownumbers || opts.frozenColumns.length)) ||
        (!frozen && !(opts.rownumbers || opts.frozenColumns.length))) {
        table.push('<span class="datagrid-group-expander">');
        table.push('<span class="datagrid-row-expander datagrid-row-collapse">&nbsp;</span>');
        table.push('</span>');
      }
      if ((frozen && hasFrozen) || (!frozen)) {
        table.push('<span class="datagrid-group-title">');
        table.push(opts.groupFormatter.call(target, group.value, group.rows));
        table.push('</span>');
      }
      table.push('</div>');

      table.push('<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>');
      var index = group.startIndex;
      for (var j = 0; j < group.rows.length; j++) {
        var css = opts.rowStyler ? opts.rowStyler.call(target, index, group.rows[j]) : '';
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }

        var cls = 'class="datagrid-row ' + (index % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
        var style = styleValue ? 'style="' + styleValue + '"' : '';
        var rowId = state.rowIdPrefix + '-' + (frozen ? 1 : 2) + '-' + index;
        table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
        table.push(this.renderRow.call(this, target, fields, frozen, index, group.rows[j]));
        table.push('</tr>');
        index++;
      }
      table.push('</tbody></table>');
      return table.join('');

      function parseCss(css, cls) {
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }
        return 'class="' + cls + (classValue ? ' ' + classValue : '') + '" ' +
          'style="' + styleValue + '"';
      }
    },

    bindEvents: function (target) {
      var state = $.data(target, 'datagrid');
      var dc = state.dc;
      var body = dc.body1.add(dc.body2);
      var clickHandler = ($.data(body[0], 'events') || $._data(body[0], 'events')).click[0].handler;
      body.unbind('click').bind('click', function (e) {
        var tt = $(e.target);
        var expander = tt.closest('span.datagrid-row-expander');
        if (expander.length) {
          var gindex = expander.closest('div.datagrid-group').attr('group-index');
          if (expander.hasClass('datagrid-row-collapse')) {
            $(target).datagrid('collapseGroup', gindex);
          } else {
            $(target).datagrid('expandGroup', gindex);
          }
        } else {
          clickHandler(e);
        }
        e.stopPropagation();
      });
    },

    onBeforeRender: function (target, rows) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;

      initCss();

      var groups = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var group = getGroup(row[opts.groupField]);
        if (!group) {
          group = {
            value: row[opts.groupField],
            rows: [row]
          };
          groups.push(group);
        } else {
          group.rows.push(row);
        }
      }

      var index = 0;
      var newRows = [];
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        group.startIndex = index;
        index += group.rows.length;
        newRows = newRows.concat(group.rows);
      }

      state.data.rows = newRows;
      this.groups = groups;

      var that = this;
      setTimeout(function () {
        that.bindEvents(target);
      }, 0);

      function getGroup(value) {
        for (var i = 0; i < groups.length; i++) {
          var group = groups[i];
          if (group.value == value) {
            return group;
          }
        }
        return null;
      }

      function initCss() {
        if (!$('#datagrid-group-style').length) {
          $('head').append(
            '<style id="datagrid-group-style">' +
            '.datagrid-group{height:' + opts.groupHeight + 'px;overflow:hidden;font-weight:bold;border-bottom:1px solid #ccc;white-space:nowrap;word-break:normal;}' +
            '.datagrid-group-title,.datagrid-group-expander{display:inline-block;vertical-align:bottom;height:100%;line-height:' + opts.groupHeight + 'px;padding:0 4px;}' +
            '.datagrid-group-title{position:relative;}' +
            '.datagrid-group-expander{width:' + opts.expanderWidth + 'px;text-align:center;padding:0}' +
            '.datagrid-row-expander{margin:' + Math.floor((opts.groupHeight - 16) / 2) + 'px 0;display:inline-block;width:16px;height:16px;cursor:pointer}' +
            '</style>'
          );
        }
      }
    },
    onAfterRender: function (target) {
      $.fn.datagrid.defaults.view.onAfterRender.call(this, target);

      var view = this;
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      if (!state.onResizeColumn) {
        state.onResizeColumn = opts.onResizeColumn;
      }
      if (!state.onResize) {
        state.onResize = opts.onResize;
      }
      opts.onResizeColumn = function (field, width) {
        view.resizeGroup(target);
        state.onResizeColumn.call(target, field, width);
      }
      opts.onResize = function (width, height) {
        view.resizeGroup(target);
        state.onResize.call($(target).datagrid('getPanel')[0], width, height);
      }
      view.resizeGroup(target);
    }
  }),
  scrollview: $.extend({}, $.fn.datagrid.defaults.view, {
    type: 'scrollview',
    index: 0,
    r1: [],
    r2: [],
    rows: [],
    render: function (target, container, frozen) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var rows = this.rows || [];
      if (!rows.length) {
        return;
      }
      var fields = $(target).datagrid('getColumnFields', frozen);

      if (frozen) {
        if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
          return;
        }
      }

      var index = this.index;
      var table = ['<div class="datagrid-btable-top"></div>',
        '<table class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>'
      ];
      for (var i = 0; i < rows.length; i++) {
        var css = opts.rowStyler ? opts.rowStyler.call(target, index, rows[i]) : '';
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }
        var cls = 'class="datagrid-row ' + (index % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
        var style = styleValue ? 'style="' + styleValue + '"' : '';
        var rowId = state.rowIdPrefix + '-' + (frozen ? 1 : 2) + '-' + index;
        table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
        table.push(this.renderRow.call(this, target, fields, frozen, index, rows[i]));
        table.push('</tr>');

        // render the detail row
        if (opts.detailFormatter) {
          table.push('<tr style="display:none;">');
          if (frozen) {
            table.push('<td colspan=' + (fields.length + (opts.rownumbers ? 1 : 0)) + ' style="border-right:0">');
          } else {
            table.push('<td colspan=' + (fields.length) + '>');
          }
          table.push('<div class="datagrid-row-detail">');
          if (frozen) {
            table.push('&nbsp;');
          } else {
            table.push(opts.detailFormatter.call(target, index, rows[i]));
          }
          table.push('</div>');
          table.push('</td>');
          table.push('</tr>');
        }

        index++;
      }
      table.push('</tbody></table>');
      table.push('<div class="datagrid-btable-bottom"></div>');

      $(container).html(table.join(''));
    },

    renderRow: function (target, fields, frozen, rowIndex, rowData) {
      var opts = $.data(target, 'datagrid').options;

      var cc = [];
      if (frozen && opts.rownumbers) {
        var rownumber = rowIndex + 1;
        // if (opts.pagination){
        // 	rownumber += (opts.pageNumber-1)*opts.pageSize;
        // }
        cc.push('<td class="datagrid-td-rownumber"><div class="datagrid-cell-rownumber">' + rownumber + '</div></td>');
      }
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var col = $(target).datagrid('getColumnOption', field);
        if (col) {
          var value = rowData[field]; // the field value
          var css = col.styler ? (col.styler(value, rowData, rowIndex) || '') : '';
          var classValue = '';
          var styleValue = '';
          if (typeof css == 'string') {
            styleValue = css;
          } else if (cc) {
            classValue = css['class'] || '';
            styleValue = css['style'] || '';
          }
          var cls = classValue ? 'class="' + classValue + '"' : '';
          var style = col.hidden ? 'style="display:none;' + styleValue + '"' : (styleValue ? 'style="' + styleValue + '"' : '');

          cc.push('<td field="' + field + '" ' + cls + ' ' + style + '>');

          if (col.checkbox) {
            style = '';
          } else if (col.expander) {
            style = "text-align:center;height:16px;";
          } else {
            style = styleValue;
            if (col.align) {
              style += ';text-align:' + col.align + ';'
            }
            if (!opts.nowrap) {
              style += ';white-space:normal;height:auto;';
            } else if (opts.autoRowHeight) {
              style += ';height:auto;';
            }
          }

          cc.push('<div style="' + style + '" ');
          if (col.checkbox) {
            cc.push('class="datagrid-cell-check ');
          } else {
            cc.push('class="datagrid-cell ' + col.cellClass);
          }
          cc.push('">');

          if (col.checkbox) {
            cc.push('<input type="checkbox" name="' + field + '" value="' + (value != undefined ? value : '') + '">');
          } else if (col.expander) {
            //cc.push('<div style="text-align:center;width:16px;height:16px;">');
            cc.push('<span class="datagrid-row-expander datagrid-row-expand" style="display:inline-block;width:16px;height:16px;cursor:pointer;" />');
            //cc.push('</div>');
          } else if (col.formatter) {
            cc.push(col.formatter(value, rowData, rowIndex));
          } else {
            cc.push(value);
          }

          cc.push('</div>');
          cc.push('</td>');
        }
      }
      return cc.join('');
    },

    bindEvents: function (target) {
      var state = $.data(target, 'datagrid');
      var dc = state.dc;
      var opts = state.options;
      var body = dc.body1.add(dc.body2);
      var clickHandler = ($.data(body[0], 'events') || $._data(body[0], 'events')).click[0].handler;
      body.unbind('click').bind('click', function (e) {
        var tt = $(e.target);
        var tr = tt.closest('tr.datagrid-row');
        if (!tr.length) {
          return
        }
        if (tt.hasClass('datagrid-row-expander')) {
          var rowIndex = parseInt(tr.attr('datagrid-row-index'));
          if (tt.hasClass('datagrid-row-expand')) {
            $(target).datagrid('expandRow', rowIndex);
          } else {
            $(target).datagrid('collapseRow', rowIndex);
          }
          $(target).datagrid('fixRowHeight');

        } else {
          clickHandler(e);
        }
        e.stopPropagation();
      });
    },

    onBeforeRender: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      var view = this;

      opts._emptyMsg = opts.emptyMsg; // store the emptyMsg value
      opts.emptyMsg = ''; // erase it to prevent from displaying it
      state.data.firstRows = state.data.rows;
      state.data.rows = [];

      dc.body1.add(dc.body2).empty();
      this.rows = []; // the rows to be rendered
      this.r1 = this.r2 = []; // the first part and last part of rows

      init();
      createHeaderExpander();

      function init() {
        opts.rowHeight = $(target).datagrid('getRowHeight');
        var pager = $(target).datagrid('getPager');
        pager.each(function () {
          $(this).pagination('options').onSelectPage = function (pageNum, pageSize) {
            opts.pageNumber = pageNum || 1;
            opts.pageSize = pageSize;
            pager.pagination('refresh', {
              pageNumber: pageNum,
              pageSize: pageSize
            });
            $(target).datagrid('gotoPage', opts.pageNumber);
          };
        });
        // erase the onLoadSuccess event, make sure it can't be triggered
        state.onLoadSuccess = opts.onLoadSuccess;
        opts.onLoadSuccess = function () {
        };
        if (!opts.remoteSort) {
          var onBeforeSortColumn = opts.onBeforeSortColumn;
          opts.onBeforeSortColumn = function (name, order) {
            var result = onBeforeSortColumn.call(this, name, order);
            if (result == false) {
              return false;
            }
            state.data.rows = state.data.firstRows;
          }
        }
        dc.body2.unbind('.datagrid');
        setTimeout(function () {
          dc.body2.unbind('.datagrid').bind('scroll.datagrid', function (e) {
            if (state.onLoadSuccess) {
              opts.onLoadSuccess = state.onLoadSuccess; // restore the onLoadSuccess event
              state.onLoadSuccess = undefined;
              state.originalRows = $.extend(true, [], state.data.firstRows);
            }
            if (view.scrollTimer) {
              clearTimeout(view.scrollTimer);
            }
            view.scrollTimer = setTimeout(function () {
              view.scrolling.call(view, target);
            }, 50);
          });
          dc.body2.triggerHandler('scroll.datagrid');
        }, 0);
      }

      function createHeaderExpander() {
        if (!opts.detailFormatter) {
          return
        }

        var t = $(target);
        var hasExpander = false;
        var fields = t.datagrid('getColumnFields', true).concat(t.datagrid('getColumnFields'));
        for (var i = 0; i < fields.length; i++) {
          var col = t.datagrid('getColumnOption', fields[i]);
          if (col.expander) {
            hasExpander = true;
            break;
          }
        }
        if (!hasExpander) {
          if (opts.frozenColumns && opts.frozenColumns.length) {
            opts.frozenColumns[0].splice(0, 0, {
              field: '_expander',
              expander: true,
              width: 24,
              resizable: false,
              fixed: true
            });
          } else {
            opts.frozenColumns = [
              [{
                field: '_expander',
                expander: true,
                width: 24,
                resizable: false,
                fixed: true
              }]
            ];
          }

          var t = dc.view1.children('div.datagrid-header').find('table');
          var td = $('<td rowspan="' + opts.frozenColumns.length + '"><div class="datagrid-header-expander" style="width:24px;"></div></td>');
          if ($('tr', t).length == 0) {
            td.wrap('<tr></tr>').parent().appendTo($('tbody', t));
          } else if (opts.rownumbers) {
            td.insertAfter(t.find('td:has(div.datagrid-header-rownumber)'));
          } else {
            td.prependTo(t.find('tr:first'));
          }
        }

        setTimeout(function () {
          view.bindEvents(target);
        }, 0);
      }
    },

    onAfterRender: function (target) {
      $.fn.datagrid.defaults.view.onAfterRender.call(this, target);
      var dc = $.data(target, 'datagrid').dc;
      var footer = dc.footer1.add(dc.footer2);
      footer.find('span.datagrid-row-expander').css('visibility', 'hidden');
    },

    scrolling: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      if (!opts.finder.getRows(target).length) {
        this.reload.call(this, target);
      } else {
        if (!dc.body2.is(':visible')) {
          return
        }
        var headerHeight = dc.view2.children('div.datagrid-header').outerHeight();

        var topDiv = dc.body2.children('div.datagrid-btable-top');
        var bottomDiv = dc.body2.children('div.datagrid-btable-bottom');
        if (!topDiv.length || !bottomDiv.length) {
          return;
        }
        var top = topDiv.position().top + topDiv._outerHeight() - headerHeight;
        var bottom = bottomDiv.position().top - headerHeight;
        top = Math.floor(top);
        bottom = Math.floor(bottom);

        if (top > dc.body2.height() || bottom < 0) {
          this.reload.call(this, target);
        } else if (top > 0) {
          var page = Math.floor(this.index / opts.pageSize);
          this.getRows.call(this, target, page, function (rows) {
            this.page = page;
            this.r2 = this.r1;
            this.r1 = rows;
            this.index = (page - 1) * opts.pageSize;
            this.rows = this.r1.concat(this.r2);
            this.populate.call(this, target);
          });
        } else if (bottom < dc.body2.height()) {
          if (state.data.rows.length + this.index >= state.data.total) {
            return;
          }
          var page = Math.floor(this.index / opts.pageSize) + 2;
          if (this.r2.length) {
            page++;
          }
          this.getRows.call(this, target, page, function (rows) {
            this.page = page;
            if (!this.r2.length) {
              this.r2 = rows;
            } else {
              this.r1 = this.r2;
              this.r2 = rows;
              this.index += opts.pageSize;
            }
            this.rows = this.r1.concat(this.r2);
            this.populate.call(this, target);
          });
        }
      }
    },
    reload: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      var top = $(dc.body2).scrollTop() + opts.deltaTopHeight;
      var index = Math.floor(top / opts.rowHeight);
      var page = Math.floor(index / opts.pageSize) + 1;

      this.getRows.call(this, target, page, function (rows) {
        this.page = page;
        this.index = (page - 1) * opts.pageSize;
        this.rows = rows;
        this.r1 = rows;
        this.r2 = [];
        this.populate.call(this, target);
        dc.body2.triggerHandler('scroll.datagrid');
      });
    },

    getRows: function (target, page, callback) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var index = (page - 1) * opts.pageSize;

      // if possible display the empty message
      opts.emptyMsg = opts._emptyMsg;
      if (this.setEmptyMsg) {
        this.setEmptyMsg(target);
      }

      if (index < 0) {
        return
      }
      if (opts.onBeforeFetch.call(target, page) == false) {
        return;
      }

      var rows = state.data.firstRows.slice(index, index + opts.pageSize);
      if (rows.length && (rows.length == opts.pageSize || index + rows.length == state.data.total)) {
        opts.onFetch.call(target, page, rows);
        callback.call(this, rows);
      } else {
        var param = $.extend({}, opts.queryParams, {
          page: page,
          rows: opts.pageSize
        });
        if (opts.sortName) {
          $.extend(param, {
            sort: opts.sortName,
            order: opts.sortOrder
          });
        }
        if (opts.onBeforeLoad.call(target, param) == false) return;

        $(target).datagrid('loading');
        var result = opts.loader.call(target, param, function (data) {
          $(target).datagrid('loaded');
          var data = opts.loadFilter.call(target, data);
          opts.onFetch.call(target, page, data.rows);
          if (data.rows && data.rows.length) {
            callback.call(opts.view, data.rows);
          } else {
            opts.onLoadSuccess.call(target, data);
          }
        }, function () {
          $(target).datagrid('loaded');
          opts.onLoadError.apply(target, arguments);
        });
        if (result == false) {
          $(target).datagrid('loaded');
          if (!state.data.firstRows.length) {
            opts.onFetch.call(target, page, state.data.firstRows);
            opts.onLoadSuccess.call(target, state.data);
          }
        }
      }
    },

    populate: function (target) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var dc = state.dc;
      var rowHeight = opts.rowHeight;
      var maxHeight = opts.maxDivHeight;

      if (this.rows.length) {
        opts.view.render.call(opts.view, target, dc.body2, false);
        opts.view.render.call(opts.view, target, dc.body1, true);

        var body = dc.body1.add(dc.body2);
        var topDiv = body.children('div.datagrid-btable-top');
        var bottomDiv = body.children('div.datagrid-btable-bottom');
        var topHeight = this.index * rowHeight;
        var bottomHeight = state.data.total * rowHeight - this.rows.length * rowHeight - topHeight;
        fillHeight(topDiv, topHeight);
        fillHeight(bottomDiv, bottomHeight);

        state.data.rows = this.rows;

        var spos = dc.body2.scrollTop() + opts.deltaTopHeight;
        if (topHeight > opts.maxVisibleHeight) {
          opts.deltaTopHeight = topHeight - opts.maxVisibleHeight;
          fillHeight(topDiv, topHeight - opts.deltaTopHeight);
        } else {
          opts.deltaTopHeight = 0;
        }
        if (bottomHeight > opts.maxVisibleHeight) {
          fillHeight(bottomDiv, opts.maxVisibleHeight);
        } else if (bottomHeight == 0) {
          var lastCount = state.data.total % opts.pageSize;
          if (lastCount) {
            fillHeight(bottomDiv, dc.body2.height() - lastCount * rowHeight);
          }
        }

        $(target).datagrid('setSelectionState');
        dc.body2.scrollTop(spos - opts.deltaTopHeight);

        opts.pageNumber = this.page;
        var pager = $(target).datagrid('getPager');
        if (pager.length) {
          var popts = pager.pagination('options');
          var displayMsg = popts.displayMsg;
          var msg = displayMsg.replace(/{from}/, this.index + 1);
          msg = msg.replace(/{to}/, this.index + this.rows.length);
          pager.pagination('refresh', {
            pageNumber: this.page,
            displayMsg: msg
          });
          popts.displayMsg = displayMsg;
        }
        if (this.setEmptyMsg) {
          this.setEmptyMsg(target);
        }

        opts.onLoadSuccess.call(target, {
          total: state.data.total,
          rows: this.rows
        });
      }

      function fillHeight(div, height) {
        var count = Math.floor(height / maxHeight);
        var leftHeight = height - maxHeight * count;
        if (height < 0) {
          leftHeight = 0;
        }
        var cc = [];
        for (var i = 0; i < count; i++) {
          cc.push('<div style="height:' + maxHeight + 'px"></div>');
        }
        cc.push('<div style="height:' + leftHeight + 'px"></div>');
        $(div).html(cc.join(''));
      }
    },

    updateRow: function (target, rowIndex, row) {
      var opts = $.data(target, 'datagrid').options;
      var rows = $(target).datagrid('getRows');
      var rowData = opts.finder.getRow(target, rowIndex);
      var oldStyle = _getRowStyle(rowIndex);
      $.extend(rowData, row);
      var newStyle = _getRowStyle(rowIndex);
      var oldClassValue = oldStyle.c;
      var styleValue = newStyle.s;
      var classValue = 'datagrid-row ' + (rowIndex % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + newStyle.c;

      function _getRowStyle(rowIndex) {
        var css = opts.rowStyler ? opts.rowStyler.call(target, rowIndex, rowData) : '';
        var classValue = '';
        var styleValue = '';
        if (typeof css == 'string') {
          styleValue = css;
        } else if (css) {
          classValue = css['class'] || '';
          styleValue = css['style'] || '';
        }
        return {
          c: classValue,
          s: styleValue
        };
      }

      function _update(frozen) {
        var fields = $(target).datagrid('getColumnFields', frozen);
        var tr = opts.finder.getTr(target, rowIndex, 'body', (frozen ? 1 : 2));
        var checked = tr.find('div.datagrid-cell-check input[type=checkbox]').is(':checked');
        tr.html(this.renderRow.call(this, target, fields, frozen, rowIndex, rowData));
        tr.attr('style', styleValue).removeClass(oldClassValue).addClass(classValue);
        if (checked) {
          tr.find('div.datagrid-cell-check input[type=checkbox]')._propAttr('checked', true);
        }
      }

      _update.call(this, true);
      _update.call(this, false);
      $(target).datagrid('fixRowHeight', rowIndex);
    },

    // insertRow: function(target, index, row){
    // 	var state = $.data(target, 'datagrid');
    // 	var data = state.data;

    // 	if (index == undefined || index == null) index = data.rows.length;
    // 	if (index > data.rows.length) index = data.rows.length;
    // 	$.fn.datagrid.defaults.view.insertRow.call(this, target, index, row);
    // 	if (data.firstRows && index <= data.firstRows.length){
    // 		data.firstRows.splice(index, 0, row);
    // 	}
    // },
    insertRow: function (target, index, row) {
      var state = $.data(target, 'datagrid');
      var opts = state.options;
      var data = state.data;

      var total = $(target).datagrid('getData').total;
      if (index == null) {
        index = total;
      }
      if (index > total) {
        index = total;
      }
      if (data.firstRows && index <= data.firstRows.length) {
        data.firstRows.splice(index, 0, row);
      }
      data.total++;

      var rows = this.r1.concat(this.r2);
      if (index < this.index) {
        this.reload.call(this, target);
      } else if (index <= this.index + rows.length) {
        rows.splice(index - this.index, 0, row);
        this.r1 = rows.splice(0, opts.pageSize);
        if (this.r2.length) {
          this.r2 = rows.splice(0, opts.pageSize);
        }
        this.rows = this.r1.concat(this.r2);
        this.populate.call(this, target);
        state.dc.body2.triggerHandler('scroll.datagrid');
      }
    },

    // deleteRow: function(target, index){
    // 	var data = $(target).datagrid('getData');
    // 	$.fn.datagrid.defaults.view.deleteRow.call(this, target, index);
    // 	if (data.firstRows){
    // 		data.firstRows.splice(index, 1);
    // 	}
    // },
    deleteRow: function (target, index) {
      var state = $.data(target, 'datagrid');
      var data = state.data;
      var opts = state.options;
      data.total--;
      if (data.firstRows) {
        if (index < data.firstRows.length) {
          data.firstRows.splice(index, 1);
          if (data.total) {
            this.reload.call(this, target);
          } else {
            // $(target).datagrid('loadData', [])
            state.data.rows = [];
            $(state.dc.body1).empty();
            $(state.dc.body2).empty();
            if (this.setEmptyMsg) {
              this.setEmptyMsg.call(this, target);
            }
          }
          //this.reload.call(this, target);
          return;
        }
      }

      var rows = this.r1.concat(this.r2);
      if (index < this.index) {
        this.reload.call(this, target);
      } else if (index < this.index + rows.length) {
        rows.splice(index - this.index, 1);
        this.r1 = rows.splice(0, opts.pageSize);
        if (this.r1.length < opts.pageSize) {
          this.reload.call(this, target);
        } else {
          this.r2 = [];
          this.rows = this.r1.concat(this.r2);
          this.populate.call(this, target);
          state.dc.body2.triggerHandler('scroll.datagrid');
        }
      }
    }
  }),
});

module.exports = extension;
