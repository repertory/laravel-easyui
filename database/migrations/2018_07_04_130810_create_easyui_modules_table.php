<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEasyuiModulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('easyui_modules', function (Blueprint $table) {
            $table->increments('id');
            $table->string('group')->comment('分组')->nullable(false);
            $table->string('name')->comment('名称')->nullable(false);
            $table->string('icon')->comment('图标')->nullable(true);
            $table->string('url')->comment('链接')->nullable(false);
            $table->boolean('menu')->comment('启用菜单')->default(true);
            $table->json('acl')->comment('权限');
            $table->string('module_group')->comment('分组')->nullable(false);
            $table->string('module_module')->comment('模块')->nullable(false);
            $table->string('module_alias')->comment('别名')->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('easyui_modules');
    }
}
