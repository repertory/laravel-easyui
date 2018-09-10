<div class="easyui-panel" fit="true" border="false">
    <div class="datagrid-toolbar" style="border: none;">
        <a class="easyui-menubutton" data-menu=".account">账号</a>
        <a class="easyui-menubutton" data-menu=".tool">工具</a>
        <a class="easyui-menubutton" data-menu=".theme">主题</a>
        <a class="easyui-menubutton" data-menu=".help">帮助</a>
    </div>

    <div class="menu" style="display: none">
        <div class="account">
            <div iconCls="fa fa-user-circle-o">{{ $user->name }}</div>
            <div class="menu-sep"></div>
            <div class="action-open"
                 iconCls="fa fa-address-card-o"
                 url="{{ module_url(module_config('url.profile')) }}">
                个人资料
            </div>
            <div class="action-open" iconCls="fa fa-edit" url="{{ module_url(module_config('url.password')) }}">
                密码修改
            </div>
            <div class="menu-sep"></div>
            <div class="action-logout" iconCls="fa fa-sign-out" url="{{ module_url(module_config('url.logout')) }}">
                退出登录
            </div>
        </div>

        <div class="tool">
            <div class="action-refresh-west" iconCls="fa fa-refresh">刷新导航</div>
        </div>

        <div class="theme">
            @foreach(module_config('themes') as $theme=>$path)
                @if( module_config('theme', 'metro') == $theme)
                    <div class="item" iconCls="fa fa-check-square-o" theme="{{ $theme }}">{{ $theme }}</div>
                @else
                    <div class="item" iconCls="fa fa-square-o" theme="{{ $theme }}">{{ $theme }}</div>
                @endif
            @endforeach
        </div>

        <div class="help">
            <div iconCls="fa fa-question-circle">
                <span>关于</span>
                <div class="menu-content" style="padding:10px 20px">
                    <b style="font-size: 28px">{{ module_config('name') }}</b>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(':module').options({
        // 初始化方法
        init: function () {
            // 先初始化事件监听
            this.event();

            // 初始化下拉菜单
            $('.easyui-menubutton', ':module').each(function () {
                var menu = $('.menu', ':module').find($(this).data('menu'));
                menu && $(this).menubutton({menu: menu})
            });
        },
        // 事件监听
        event: function () {
            var self = this;

            $('.account', ':module').on('click', '.action-open', function () {
                self.open($.extend({href: $(this).attr('url')}, $(this).menu('getItem', this)));
            });

            $('.account', ':module').on('click', '.action-logout', function () {
                var url = $(this).attr('url');
                $.messager.confirm('系统提示', '确定要退出登录吗？', function (res) {
                    if (res) window.location.href = url;
                });
            });

            // 工具栏操作
            $('.tool', ':module').on('click', '.action-refresh-west', function () {
                $('body').layout('panel', 'west').panel('refresh');
            });

            // 切换主题
            $('.theme', ':module').on('click', '.item', function () {
                self.theme($(this).attr('theme'));
                $(this).menu('setIcon', {target: this, iconCls: 'fa fa-check-square-o'});
                $(this).siblings().each(function () {
                    $(this).hasClass('menu-item') && $(this).menu('setIcon', {
                        target: this,
                        iconCls: 'fa fa-square-o'
                    });
                });
            });
        },
        // 打开页面
        open: function (node) {
            if (!node.href || !node.text) {
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
        },
        // 切换主题
        theme: function (theme) {
            $('link[theme="' + theme + '"]').prop('disabled', false).siblings().each(function () {
                if ($(this).attr('theme')) {
                    $(this).prop('disabled', true);
                }
            });
        }
    }).init();
</script>
