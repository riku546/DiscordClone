<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Channels extends Model
{
    use HasFactory;

    protected $table = 'channels';

    protected $fillable = ['id', 'name', 'server_id'];
}
