<div class="easyui-panel" title="密码修改" fit="true" border="false" iconCls="fa fa-edit">
    <div class="datagrid-toolbar">
        <a class="easyui-linkbutton" plain="true" iconCls="fa fa-save" method="save">保存</a>
        <a class="easyui-linkbutton" plain="true" iconCls="fa fa-undo" method="reset">重置</a>
    </div>

    <form method="post">
        <dl>
            <dd>
                <input class="easyui-passwordbox"
                    label="密码"
                    labelWidth="48"
                    required="true"
                    data-options="{validType: {length: [6, 32], remote: ['{{ module_url('laravel/easyui/exist', ['type' => 'password']) }}', 'password']}}"
                    style="width: 100%">
            </dd>
            <dd>
                <input class="easyui-passwordbox" name="password"
                    label="新密码"
                    labelWidth="48"
                    required="true"
                    data-options="{validType: {length: [6, 32]}}"
                    style="width: 100%">
            </dd>
        </dl>
    </form>
</div>

<style type="text/css">
:module dl {
    margin: 24px 0;
}
:module dl dd {
    margin: 16px;
    max-width: 360px;
}
</style>

<script type="text/javascript">
    $(':module').options({
        form: $('form', ':module'),
        init: function () {
            this.event();
        },
        event: function () {
            var self = this;
            $('[method]', ':module').on('click', function () {
                var method = $(this).attr('method');
                typeof self[method] === 'function' && self[method].call(self, this);
            });
        },
        save: function (e) {
            this.form.form('ajax', {
                progressbar: '保存中，请稍后...',
                url: '{{ module_url('laravel/easyui/password') }}',
                onSubmit: function () {
                    return $(this).form('validate');
                },
                success: function (data) {
                    $.messager.success('操作提示', '保存成功');
                },
                error: '保存失败'
            });
        },
        reset: function() {
            this.form.form('reset');
        }
    }).init();
</script>
