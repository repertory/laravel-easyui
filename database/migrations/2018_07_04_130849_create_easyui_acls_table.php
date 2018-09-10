<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEasyuiAclsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('easyui_acls', function (Blueprint $table) {
            $table->increments('id');
            $table->string('group')->comment('分组')->nullable(false);
            $table->string('module')->comment('模块')->nullable(false);
            $table->string('alias')->comment('别名')->nullable(false);
            $table->unsignedInteger('role_id')->comment('角色ID')->default(0);
            $table->unsignedInteger('user_id')->comment('用户ID')->default(0);
            $table->timestamps();
            $table->index(['group', 'module', 'alias']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('easyui_acls');
    }
}
