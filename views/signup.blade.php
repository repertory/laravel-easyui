<div class="easyui-panel" fit="true" border="false">
    <div class="easyui-dialog" title="用户注册" style="width: 100%;max-width: 360px;">
        <form method="post">
            <dl style="margin: 24px 0;">
                <dd style="margin: 16px">
                    <input class="easyui-textbox" name="name"
                           label="姓名"
                           labelWidth="48"
                           required="true"
                           data-options="{validType: {length: [2, 24]}}"
                           style="width: 100%;">
                </dd>
                <dd style="margin: 16px">
                    <input class="easyui-textbox" name="email" type="email"
                           label="邮箱"
                           labelWidth="48"
                           required="true"
                           data-options="{validType: {email: true, remote: ['{{ module_url('laravel/easyui/exist', ['type' => 'email','reverse' => true]) }}', 'email']}}"
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
                        text: '注册',
                        handler: function () {
                            self.register.call(self);
                        }
                    },
                    {
                        text: '登录',
                        handler: function () {
                            self.login.call(self);
                        }
                    }
                ],
                onOpen: function () {
                    // 解决dialog中form没有被初始化的问题
                    $.parser.parse(this);

                    // 回车提交表单
                    self.form.on('keyup', function (event) {
                        if (event.keyCode == 13) self.register.call(self);
                    });
                }
            });
        },
        register: function () {
            this.form.form('ajax', {
                progressbar: '用户注册中...',
                url: '{{ module_url(module_config('url.register')) }}',
                onSubmit: function () {
                    return $(this).form('validate');
                },
                success: function () {
                    window.location.href = '{{ module_url('laravel/easyui') }}';
                },
                error: {
                    title: '注册失败',
                    status: {
                        404: '注册失败！'
                    }
                }
            });
        },
        login: function () {
            window.location.href = '{{ module_url('laravel/easyui/login') }}';
        }
    }).init();
</script>
