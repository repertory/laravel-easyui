<?php

namespace Module\Laravel\Easyui\Model;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

class Acl extends Model
{
    protected $table = 'easyui_acls';

    public $timestamps = true;

    /**
     * @param string $group
     * @param string $module
     * @param string $alias
     * @param object|null $user
     * @return bool
     */
    public function check($group, $module, $alias, $user = null)
    {
        // 获取所有符合条件的数据
        $rows = $this->select(['user_id', 'role_id'])
            ->whereIn('group', [$group, '*'])
            ->whereIn('module', [$module, '*'])
            ->whereIn('alias', [$alias, '*'])
            ->get();

        if (!$rows->count()) {
            return false;
        }

        // 支持指定用户验证
        if (!$user) {
            $user = Auth::user();
        }

        // 先判断用户权限
        if ($rows->contains('user_id', $user->id)) {
            return true;
        }

        // 当前角色
        $roles = $user
            ->belongsToMany('Module\Laravel\Easyui\Model\Role', 'easyui_role_user')
            ->get();

        // 判断当前角色权限
        $currentRole = $roles->contains(function ($role, $key) use ($rows) {
            if(!is_object($role)) {
                $role = $key; // 兼容5.2之前的版本
            }
            return $rows->contains(function ($row, $key) use ($role) {
                if(!is_object($row)) {
                    $row = $key; // 兼容5.2之前的版本
                }
                return $row->role_id == $role->id;
            });
        });
        if ($currentRole) {
            return true;
        }

        // 判断子角色权限
        return $roles
            ->map(function ($role) {
                return $role->withChildren(false)->get();
            })
            ->collapse()
            ->contains(function ($role, $key) use ($rows) {
                if(!is_object($role)) {
                    $role = $key; // 兼容5.2之前的版本
                }
                return $rows->contains(function ($row, $key) use ($role) {
                    if(!is_object($row)) {
                        $row = $key; // 兼容5.2之前的版本
                    }
                    return $row->role_id == $role->id;
                });
            });
    }

    /**
     * 获取用户相关的权限
     * @param null $user
     * @return mixed
     */
    public function whereUser($user = null)
    {
        if (!$user) {
            $user = Auth::user();
        }
        $roles = $user->belongsToMany('Module\Laravel\Easyui\Model\Role', 'easyui_role_user')
            ->get()
            ->map(function ($role) {
                return $role->withChildren()->get();
            })
            ->collapse()
            ->pluck('id');
        return $this->whereIn('role_id', $roles)->orWhere('user_id', $user->id);
    }

    /**
     * 获取用户相关的模块菜单
     * @param null $user
     * @return mixed
     */
    public function menus($user = null)
    {
        // 去重处理后的权限列表
        $acls = $this->whereUser($user)
            ->select(['group', 'module', 'alias'])
            ->get()
            ->unique(function ($acl) {
                return implode('-', [$acl->group, $acl->module, $acl->alias]);
            });

        // 支持通配符*
        return Module::where('menu', true)
            ->orderBy('id', 'asc')
            ->get()
            ->filter(function ($row) use ($acls) {
                return $acls->contains(function ($acl, $key) use ($row) {
                    if(!is_object($acl)) {
                        $acl = $key; // 兼容5.2之前的版本
                    }
                    return in_array($acl->group, [$row->module_group, '*']) &&
                        in_array($acl->module, [$row->module_module, '*']) &&
                        in_array($acl->alias, [$row->module_alias, '*']);
                });
            })
            ->values();
    }
}
