<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ app('request')->session()->token() }}">
    <meta name="author" content="wangdong">
    <meta name="contact" content="mail@wangdong.io">
    @foreach(module_config('themes') as $theme=>$path)
        @if( module_config('theme', 'metro') == $theme)
            <link rel="stylesheet" href="{{ $path }}" type="text/css" theme="{{ $theme }}"/>
        @else
            <link rel="stylesheet" href="{{ $path }}" type="text/css" theme="{{ $theme }}" disabled/>
        @endif
    @endforeach
    <link rel="stylesheet" href="/css/laravel/easyui/app.css" type="text/css"/>
    @foreach(module_config('import.styles', []) as $style)
        <link rel="stylesheet" href="{{ $style }}" type="text/css"/>
    @endforeach
    @yield('head')
</head>
<body class="easyui-layout" fit="true">

    {{--加载效果--}}
    <div class="panel-loading preload"
        style="position:absolute;width:100%;height:100%;background-color:white;padding-top:7px;">
        Loading...
    </div>

    @yield('content')

    <script type="text/javascript" src="/js/laravel/easyui/app.js"></script>
    @foreach(module_config('import.scripts', []) as $script)
        <script type="text/javascript" src="{{ $script }}"></script>
    @endforeach
    <script type="text/javascript">
        $.ajaxSetup({headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}});
        $(document).ready(function () { $('.preload:first').remove(); });
    </script>

    @yield('foot')
</body>
</html>
