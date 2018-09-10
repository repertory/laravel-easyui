<?php

namespace Module\Laravel\Easyui;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use LaravelModule\Controllers\Controller as BaseController;

class Controller extends BaseController
{

    public function getIndex()
    {
        return view('module::index');
    }

    public function getNorth(Request $request)
    {
        return view('module::north', [
            'user' => $request->user()
        ]);
    }

    public function getWest(Model\Acl $acl)
    {
        $data = $acl->menus()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'text' => $row->name,
                    'iconCls' => $row->icon,
                    'href' => module_url($row->url),
                    'group' => $row->group,
                ];
            })
            ->groupBy('group')
            ->map(function ($children, $group) {
                return [
                    'text' => $group,
                    'children' => $children,
                ];
            })
            ->values();

        return view('module::west', [
            'data' => $data
        ]);
    }

    public function getSouth()
    {
        return view('module::south');
    }

    public function getDashboard(Request $request)
    {
        return view('module::dashboard', [
            'user' => $request->user()
        ]);
    }

    public function getLogin()
    {
        return view('module::login');
    }

    public function getRegister()
    {
        return view('module::register');
    }

    public function getLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        return redirect(module_url('laravel/easyui/login'));
    }

    public function getSignIn()
    {
        return view('module::signin');
    }

    public function postSignIn(Request $request)
    {
        if (Auth::attempt($request->only(['email', 'password']), $request->has('remember'))) {
            $request->session()->regenerate();
            return [
                'status' => 'success',
                'message' => '登录成功',
            ];
        }
        abort(422, trans('auth.failed'));
    }

    public function getSignUp()
    {
        return view('module::signup');
    }

    public function postSignUp(Request $request)
    {
        $user = User::insert([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'created_at' => date('c'),
            'updated_at' => date('c'),
        ]);
        return $this->postSignIn($request);
    }

    public function getProfile(Request $request)
    {
        return view('module::profile', [
            'user' => $request->user()
        ]);
    }

    public function postProfile(Request $request)
    {
        $request->user()->update($request->only(['name', 'email']));
        return 'success';
    }

    public function getPassword(Request $request)
    {
        return view('module::password', [
            'user' => $request->user()
        ]);
    }

    public function postPassword(Request $request)
    {
        $request->user()->update([
            'password' => Hash::make($request->input('password')),
        ]);
        return 'success';
    }

    public function postExist(Request $request)
    {
        $reverse = $request->input('reverse', false);
        $exist = false;
        $except = $request->input('except', null);

        switch ($request->input('type', 'email')) {
            case 'email':
                $email = $request->input('email', '');
                if ($except == $email) {
                    $exist = false;
                } else {
                    $exist = User::where('email', $email)->count();
                }
                break;
            case 'password':
                if (Auth::check()) {
                    $user = $request->user();
                    $password = $request->input('password', '');
                    $exist = Auth::once(['email' => $user->email, 'password' => $password]);
                } else {
                    $exist = false;
                }
                break;
        }
        return var_export($exist && !$reverse || !$exist && $reverse, true);
    }

}
