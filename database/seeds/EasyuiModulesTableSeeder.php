<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EasyuiModulesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('easyui_modules')->truncate();
        $this->rows()->each(function ($row, $index) {
            DB::table('easyui_modules')->insert([
                'group' => array_get($row, 'composer.extra.laravel-easyui.module.group'),
                'name' => array_get($row, 'composer.extra.laravel-easyui.module.name'),
                'icon' => array_get($row, 'composer.extra.laravel-easyui.module.icon'),
                'url' => array_get($row, 'route'),
                'menu' => array_get($row, 'composer.extra.laravel-easyui.module.menu'),
                'acl' => json_encode(array_get($row, 'composer.extra.laravel-easyui.acl', []), JSON_UNESCAPED_UNICODE),
                'module_group' => array_get($row, 'group'),
                'module_module' => array_get($row, 'module'),
                'module_alias' => array_first(array_get($row, 'composer.extra.laravel-easyui.alias')),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        });
    }

    private function rows()
    {
        return collect(require base_path('vendor/composer/autoload_classmap.php'))
            ->filter(function ($filename, $namespace) {
                return starts_with($namespace, 'Module\\') && ends_with($filename, 'Controller.php') && file_exists($filename);
            })
            ->map(function ($filename, $namespace) {
                $info = collect(explode('\\', $namespace));
                $module = implode('/', [snake_case($info->get(1)), snake_case($info->get(2))]);

                return module($module);
            })
            ->merge(
                collect(glob(base_path('module/*/*/composer.json')))
                    ->map(function ($file) {
                        $composer = json_decode(file_get_contents($file), true);
                        return module(array_get($composer, 'name'));
                    })
            )
            ->unique('name')
            ->filter(function ($module) {
                return !is_null($module) && array_has($module, 'composer.extra.laravel-easyui');
            })
            ->sortBy('name')
            ->sortBy(function ($module) {
                return array_get($module, 'composer.extra.laravel-easyui.module.sort', 9999);
            })
            ->keyBy('name')
            ->values();
    }
}
