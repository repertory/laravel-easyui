<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEasyuiRolesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('easyui_roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('role')->comment('标识')->nullable(false)->unique();
            $table->string('name')->comment('名称')->nullable(false);
            $table->unsignedInteger('parent')->comment('上级角色')->default(0);
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
        Schema::dropIfExists('easyui_roles');
    }
}
