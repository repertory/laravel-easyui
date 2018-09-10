<?php

namespace Module\Laravel\Easyui;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Session\Middleware\StartSession;

class Middleware extends StartSession
{

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

        $this->sessionHandled = true;

        // If a session driver has been configured, we will need to start the session here
        // so that the data is ready for an application. Note that the Laravel sessions
        // do not make use of PHP "native" sessions in any way since they are crappy.
        if ($this->sessionConfigured()) {
            $request->setLaravelSession(
                $session = $this->startSession($request)
            );

            $this->collectGarbage($session);
        }

        $current = array_get($module, 'composer.extra.laravel-easyui');
        // 登录验证(整个模块)
        if (array_get($current, 'module.auth', true) === false) {
            return $this->next($request, $next, $session);
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
            return $this->next($request, $next, $session);
        }

        if (Auth::guest()) {
            return $request->ajax() ? abort(401, '请先登录！') : redirect(module_url('laravel/easyui/login', ['next' => $request->path()]));
        }

        $acl = array_get($current, 'acl', []);
        if (array_get($acl, $alias, true) === false) {
            return $this->next($request, $next, $session);
        }

        // 权限验证
        $group = array_get($module, 'group');
        $module = array_get($module, 'module');
        $ACL = new Model\Acl();
        if (!$ACL->check($group, $module, $alias)) {
            return abort('403', '抱歉，你无权访问该页面！');
        }

        return $this->next($request, $next, $session);
    }

    protected function next($request, $next, $session)
    {
        $response = $next($request);

        // Again, if the session has been configured we will need to close out the session
        // so that the attributes may be persisted to some storage medium. We will also
        // add the session identifier cookie to the application response headers now.
        if ($this->sessionConfigured()) {
            $this->storeCurrentUrl($request, $session);

            $this->addCookieToResponse($response, $session);
        }

        return $response;
    }

}
