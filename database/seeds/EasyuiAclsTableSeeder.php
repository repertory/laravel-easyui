<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EasyuiAclsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $root = DB::table('easyui_roles')->where('role', 'root')->first();
        if ($root && !DB::table('easyui_acls')->where('group', '*')->where('module', '*')->where('alias', '*')->where('role_id', $root->id)->exists()) {
            DB::table('easyui_acls')->insert([
                'group' => '*',
                'module' => '*',
                'alias' => '*',
                'user_id' => 0,
                'role_id' => $root->id,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }
    }
}
