<?php

namespace Module\Laravel\Easyui\Model;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'easyui_roles';

    public $timestamps = true;

    /**
     * 获得此角色下的用户。
     */
    public function users()
    {
        return $this->belongsToMany(
            'App\User',
            'easyui_role_user',
            'role_id',
            'user_id'
        );
    }

    /**
     * 上下级关联
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function child()
    {
        return $this->hasMany('Module\Laravel\Easyui\Model\Role', 'parent', 'id');
    }

    /**
     * 递归查询
     * @return $this
     */
    public function children()
    {
        return $this->child()->with('children');
    }

    /**
     * 包含子节点操作
     * @param bool $withSelf
     * @return $this
     */
    public function withChildren($withSelf = true)
    {
        $ids = $withSelf ? [$this->id] : [0];

        // 遍历获取ID
        $children = $this->children;
        while ($children->count()) {
            $collect = collect([]);
            $children->each(function ($child) use (&$ids, &$collect) {
                array_push($ids, $child->id);
                $collect = $collect->merge($child->children);
            });
            $children = $collect;
        }

        return $this->whereIn('id', $ids);
    }

}
