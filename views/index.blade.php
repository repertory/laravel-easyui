@extends('module::layout')

@section('head')
    <title>{{ module_config('name') }}</title>
@endsection

@section('content')

    {{--顶部区域--}}
    @if(module_config('url.north'))
        <div region="north"
            title="{{ module_config('title.north') }}"
            href="{{ module_url(module_config('url.north')) }}"
            height="auto"
            split="false"
            border="true"
            collapsible="true"
            data-options="{
                hideCollapsedContent:false,
                onLoad:function() {
                    $('body').layout({fit: true});
                }
            }">
        </div>
    @endif

    {{--左侧区域--}}
    @if(module_config('url.west'))
        <div region="west"
            title="{{ module_config('title.west') }}"
            href="{{ module_url(module_config('url.west')) }}"
            width="240"
            split="true"
            data-options="{
                hideCollapsedContent:false
            }">
        </div>
    @endif

    {{--内容区域--}}
    <div region="center">
        <div class="easyui-tabs" tabPosition="bottom" fit="true" border="false" plain="false">
            @if(module_config('url.dashboard'))
                <div title="{{ module_config('title.dashboard') }}"
                    href="{{ module_url(module_config('url.dashboard')) }}"
                    iconCls="fa fa-home"
                    cache="true">
                </div>
            @endif
        </div>
    </div>

    {{--右侧区域--}}
    @if(module_config('url.east'))
        <div region="east"
            title="{{ module_config('title.east') }}"
            href="{{ module_url(module_config('url.east')) }}"
            width="240"
            split="true"
            data-options="{
                hideCollapsedContent:false
            }">
        </div>
    @endif

    {{--底部区域--}}
    @if(module_config('url.south'))
        <div region="south"
            title="{{ module_config('title.south') }}"
            href="{{ module_url(module_config('url.south')) }}"
            split="false"
            border="true"
            height="auto"
            data-options="{
                hideCollapsedContent:false,
                onLoad:function() {
                    $('body').layout({fit: true});
                }
            }"></div>
    @endif

@endsection

@section('foot')
    <script type="text/javascript">
        $.ajaxSetup({
            statusCode: {
                401: function () {
                    window.location.href = '{{ module_url('laravel/easyui/login') }}';
                }
            }
        });
        $(document).ready(function () {
            // 小屏设备自动隐藏左侧导航
            if ($('body').width() <= 768) {
                setTimeout(function(){
                    try {
                        $('body').layout('collapse', 'west');
                    } catch (e) {
                    }
                }, 150);
            }
        });
    </script>
@endsection
