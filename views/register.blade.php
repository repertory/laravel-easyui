@extends('module::layout')

@section('head')
    <title>{{ module_config('title.register') }} | {{ module_config('name') }}</title>
@endsection

@section('content')
    {{--内容区域--}}
    @if(module_config('url.register'))
        <div region="center" href="{{ module_url(module_config('url.register')) }}"></div>
    @endif
@endsection
