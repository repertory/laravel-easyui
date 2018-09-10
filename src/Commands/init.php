<?php

namespace Module\Laravel\Easyui\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use ReflectionClass;
use ReflectionMethod;

class Init extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'laravel.easyui:init {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '初始化其他模块';

    protected $files;

    public function __construct(Filesystem $files)
    {
        parent::__construct();

        $this->files = $files;
    }

    protected function getNameInput()
    {
        return trim($this->argument('name'));
    }

    public function handle()
    {
        if (!preg_match("#^[a-z]+(_?[a-z]+[0-9]{0,}){0,}\/[a-z]+(_?[a-z]+[0-9]{0,}){0,}$#", $this->getNameInput())) {
            $this->error('Module name error! FORMAT: [group/module | group_name/module_name]');
            return false;
        }

        $module = module($this->getNameInput());

        if (!$module) {
            $this->call('module:init', $this->arguments());
            $module = module($this->getNameInput());
        }

        $composer = array_get($module, 'composer');
        if (!array_has($composer, 'extra.laravel-easyui')) {
            $controller = new ReflectionClass(array_get($module, 'controller'));
            $alias = collect($controller->getMethods(ReflectionMethod::IS_PUBLIC))
                ->filter(function ($method) {
                    return starts_with(ltrim($method->class, '\\'), 'Module\\');
                })
                ->values()
                ->groupBy('name')
                ->map(function () {
                    return '查看';
                });

            array_set($composer, 'extra.laravel-module.middleware', ['Module\Laravel\Easyui\Middleware']);
            array_set($composer, 'extra.laravel-easyui', [
                'module' => [
                    'group' => array_get($module, 'group'),
                    'name' => array_get($module, 'module'),
                    'icon' => 'fa fa-puzzle-piece',
                    'menu' => true,
                    'auth' => true,
                    'acl' => true
                ],
                'alias' => $alias,
                'auth' => [
                    '查看' => true
                ],
                'acl' => [
                    '查看' => true
                ]
            ]);
            $path = realpath(array_get($module, 'path') . '/composer.json');
            $this->files->put($path, json_encode($composer, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }

        @exec('php artisan db:seed --class=EasyuiModulesTableSeeder');
        // $this->call('db:seed', ['--class' => 'EasyuiModulesTableSeeder']);
        $this->info('模块初始化成功');
    }

}
