<ul class="easyui-tree" fit="true" border="false" animate="true" lines="true"
    data-options='data: {!! $data->toJson() !!}'></ul>

<script type="text/javascript">
    $(':module').options({
        init: function () {
            this.onClick();
            this.onSelect();
        },
        onClick: function () {
            $('.easyui-tree', ':module').tree({
                onClick: function (node) {
                    if (!node.href || !node.text || (node.children && node.children.length)) {
                        return;
                    }

                    var $tabs = $('body').layout('panel', 'center').find('.easyui-tabs:first');
                    var exists = $tabs.tabs('tabs')
                        .map(function (tab, index) {
                            return {
                                tab: tab,
                                index: index
                            };
                        })
                        .filter(function (item) {
                            var panel = item.tab.panel('options');
                            return !!panel.iframe == !!node.iframe &&
                                panel.href == node.href &&
                                panel.title == node.text &&
                                panel.iconCls == node.iconCls;
                        });

                    // 选中已存在标签，否则添加新标签
                    if (exists.length) {
                        $tabs.tabs('select', exists.pop().index);
                    } else {
                        $tabs.tabs('add', $.extend({title: node.text, closable: true, iframe: false}, node));
                    }
                }
            });
        },
        onSelect: function () {
            var self = this;
            var $tabs = $('body').layout('panel', 'center').find('.easyui-tabs:first');
            if ($tabs) {
                $tabs.tabs({
                    onSelect: function (title, index) {
                        self.checkOnSmall();

                        var tab = $(this).tabs('getSelected').panel('options');
                        if (tab.id) {
                            var $tree = $('.easyui-tree', ':module');
                            var node = $tree.tree('find', tab.id);
                            $tree.tree('expandTo', node.target).tree('select', node.target);
                        }
                    }
                });
            }
        },
        checkOnSmall: function () {
            // 小屏设备自动隐藏左侧导航
            if ($('body').width() <= 768) {
                $('body').layout('collapse', 'west');
            }
        }
    }).init();

</script>
