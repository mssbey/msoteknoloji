<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $fillable = ['name', 'slug', 'logo', 'description', 'website', 'is_active', 'is_featured'];

    protected $casts = ['is_active' => 'boolean', 'is_featured' => 'boolean'];

    public function products() { return $this->hasMany(Product::class); }
}
