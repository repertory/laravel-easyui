<?php

namespace Module\Laravel\Easyui;

use Closure;
use DateInterval;
use DateTimeInterface;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Cookie;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Session\TokenMismatchException;

class Middleware
{

    protected $encrypter;

    protected $except = [];

    public function __construct(Encrypter $encrypter)
    {
        $this->encrypter = $encrypter;
    }

    /**
     * @param $request
     * @param Closure $next
     * @param string $guard
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector|mixed
     * @throws \ReflectionException
     */
    public function handle($request, Closure $next, $guard = 'web')
    {
        $module = module();
        if (!$module || !array_has($module, 'composer.extra.laravel-easyui')) {
            return $next($request);
        }

        Auth::shouldUse($guard);

        if (!$this->isReading($request) && !$this->inExceptArray($request) && !$this->tokensMatch($request)) {
            throw new TokenMismatchException;
        }

        $current = array_get($module, 'composer.extra.laravel-easyui');
        // 登录验证(整个模块)
        if (array_get($current, 'module.auth', true) === false) {
            return $this->addCookieToResponse($request, $next($request));
        }

        if (method_exists($request->route(), 'getActionMethod')) {
            $action = $request->route()->getActionMethod();
        } else {
            $action = explode('@', array_get($request->route(), '1.uses'))[1];
        }
        $alias = array_get($current, 'alias.' . $action, 'default');

        // 登录验证(当前请求)
        $auth = array_get($current, 'auth', []);
        if (array_get($auth, $alias, true) === false) {
            return $this->addCookieToResponse($request, $next($request));
        }

        if (Auth::guest()) {
            return $request->ajax() ? abort(401, '请先登录！') : redirect(module_url('laravel/easyui/login', ['next' => $request->path()]));
        }

        $acl = array_get($current, 'acl', []);
        if (array_get($acl, $alias, true) === false) {
            return $this->addCookieToResponse($request, $next($request));
        }

        // 权限验证
        $group = array_get($module, 'group');
        $module = array_get($module, 'module');
        $ACL = new Model\Acl();
        if (!$ACL->check($group, $module, $alias)) {
            return abort('403', '抱歉，你无权访问该页面！');
        }

        return $this->addCookieToResponse($request, $next($request));
    }

    protected function isReading($request)
    {
        return in_array($request->method(), ['HEAD', 'GET', 'OPTIONS']);
    }

    protected function inExceptArray($request)
    {
        foreach ($this->except as $except) {
            if ($except !== '/') {
                $except = trim($except, '/');
            }

            if ($request->fullUrlIs($except) || $request->is($except)) {
                return true;
            }
        }

        return false;
    }

    protected function tokensMatch($request)
    {
        $token = $this->getTokenFromRequest($request);

        return is_string($request->session()->token()) && is_string($token) && hash_equals($request->session()->token(), $token);
    }

    protected function getTokenFromRequest($request)
    {
        $token = $request->input('_token') ? : $request->header('X-CSRF-TOKEN');

        if (!$token && $header = $request->header('X-XSRF-TOKEN')) {
            $token = $this->encrypter->decrypt($header);
        }

        return $token;
    }

    protected function addCookieToResponse($request, $response)
    {
        $config = config('session');

        $response->headers->setCookie(
            new Cookie(
                'XSRF-TOKEN',
                $request->session()->token(),
                $this->availableAt(60 * $config['lifetime']),
                $config['path'],
                $config['domain'],
                $config['secure'],
                false,
                false,
                $config['same_site'] ?? null
            )
        );

        return $response;
    }

    protected function availableAt($delay = 0)
    {
        $delay = $this->parseDateInterval($delay);

        return $delay instanceof DateTimeInterface
            ? $delay->getTimestamp()
            : Carbon::now()->addSeconds($delay)->getTimestamp();
    }

    protected function parseDateInterval($delay)
    {
        if ($delay instanceof DateInterval) {
            $delay = Carbon::now()->add($delay);
        }

        return $delay;
    }

}
