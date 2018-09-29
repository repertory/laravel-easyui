<div class="easyui-panel" fit="true" border="false">
    <div class="easyui-dialog" title="用户登录" style="width: 100%;max-width: 360px;">
        <form method="post">
            <dl style="margin: 24px 0;">
                <dd style="margin: 16px">
                    <input class="easyui-textbox" name="email" type="email"
                           label="邮箱"
                           labelWidth="48"
                           required="true"
                           data-options="{validType: {email: true, remote: ['{{ module_url('laravel/easyui/exist', ['type' => 'email']) }}', 'email']}}"
                           style="width: 100%;">
                </dd>
                <dd style="margin: 16px;">
                    <input class="easyui-passwordbox" name="password"
                           label="密码"
                           labelWidth="48"
                           required="true"
                           data-options="{validType: {length: [6, 32]}}"
                           style="width: 100%">
                </dd>
                <dd style="margin: 16px;">
                    <label>
                        <input type="checkbox" name="remember">
                        记住我
                    </label>
                </dd>
            </dl>
        </form>
    </div>
</div>

<script type="text/javascript">
    $(':module').options({
        dialog: $('.easyui-dialog', ':module'),
        form: $('form', ':module'),
        init: function () {
            var self = this;
            this.dialog.dialog({
                iconCls: 'fa fa-user',
                closed: false,
                closable: false,
                constrain: true,
                buttons: [
                    {
                        text: '登录',
                        handler: function () {
                            self.login.call(self);
                        }
                    }@if(module_config('url.register')),
                    {
                        text: '注册',
                        handler: function () {
                            self.register.call(self);
                        }
                    }
                    @endif
                ],
                onOpen: function () {
                    // 解决dialog中form没有被初始化的问题
                    $.parser.parse(this);

                    // 回车提交表单
                    self.form.on('keyup', function (event) {
                        if (event.keyCode == 13) self.login.call(self);
                    });
                }
            });
        },
        login: function () {
            this.form.form('ajax', {
                progressbar: '用户身份验证中...',
                url: '{{ module_url(module_config('url.login')) }}',
                onSubmit: function () {
                    return $(this).form('validate');
                },
                success: function () {
                    window.location.href = '{{ module_url('laravel/easyui') }}';
                },
                error: '登录失败'
            });
        },
        register: function () {
            window.location.href = '{{ module_url('laravel/easyui/register') }}';
        }
    }).init();
</script>
