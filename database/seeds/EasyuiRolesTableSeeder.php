<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EasyuiRolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 添加默认的管理员角色
        if (!DB::table('easyui_roles')->where('role', 'root')->exists()) {
            $role = DB::table('easyui_roles')->insert([
                'role' => 'root',
                'name' => '管理员',
                'parent' => 0,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }
        // 设置第一个用户为管理员
        $role = DB::table('easyui_roles')->where('role', 'root')->first();
        if (!DB::table('easyui_role_user')->where('role_id', $role->id)->where('user_id', 1)->exists()) {
            DB::table('easyui_role_user')->insert([
                'role_id' => $role->id,
                'user_id' => 1,
            ]);
        }
    }
}
