<?php

namespace Module\Laravel\Easyui\Model;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $table = 'easyui_modules';

    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'parent', 'name', 'url', 'group', 'module', 'acl',
    ];

    public function setAclAttribute($value)
    {
        $this->attributes['acl'] = json_encode($value, JSON_UNESCAPED_UNICODE);
    }
}
