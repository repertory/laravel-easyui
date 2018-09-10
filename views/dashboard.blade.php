<div class="easyui-panel" title="仪表盘" fit="true" border="false" iconCls="fa fa-dashboard">

    <div class="easyui-portal">
        @foreach(module_config('dashboard', []) as $region)
            <div style="width: {{ array_get($region, 'width', 'auto') }};">
                @foreach(array_get($region, 'panels', []) as $panel)
                    <div data-options='{!! json_encode($panel) !!}'></div>
                @endforeach
            </div>
        @endforeach
    </div>
</div>

<script type="text/javascript">
    $(':module').options({
        init: function () {
            var self = this;
            $('.easyui-panel:first', ':module').panel({onResize: self.onResize});
        },
        onResize: function () {
            $('.easyui-portal', this).portal({
                fit: true,
                border: false
            });
        }
    }).init();
</script>
