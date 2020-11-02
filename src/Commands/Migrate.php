<?php

namespace Module\Laravel\Easyui\Commands;

use Illuminate\Console\Command;

class Migrate extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'laravel.easyui:migrate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '初始化数据';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->call('migrate', ['--seed' => true]);
        $this->call('db:seed', ['--class' => 'EasyuiModulesTableSeeder']);
        $this->call('db:seed', ['--class' => 'EasyuiRolesTableSeeder']);
        $this->call('db:seed', ['--class' => 'EasyuiAclsTableSeeder']);
        $this->info('初始化成功');
    }

}
