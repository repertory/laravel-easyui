@extends('module::layout')

@section('head')
    <title>{{ module_config('title.login') }} | {{ module_config('name') }}</title>
@endsection

@section('content')
    {{--内容区域--}}
    @if(module_config('url.login'))
        <div region="center" href="{{ module_url(module_config('url.login')) }}"></div>
    @endif
@endsection
