---
title: "File Uploads Laravel"
description: "Set-up the ability to upload a users avatar to Digital Ocean Spaces, using the Flysystem in Laravel."
position: 10
category: "File Uploads"
menuTitle: "File Uploads Laravel"
---

File uploads in Laravel are processed using the Flysystem package. To get started, add using composer, at **version 1 for Laravel 8.0** (version 2 will be available for Laravel 9).

```bash
sail composer require league/flysystem-aws-s3-v3 ^1.0
```

### Digital Ocean Spaces

The example project will use [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces/) to upload the user’s avatar. You can set-up an account for free to test this out. There are a few credentials required that you add in your .env file.

1. You will need your key & add to DO_SPACES_KEY
2. You will need your secret & add to DO_SPACES_SECRET
3. The endpoint will look similar to this [https://fra1.digitaloceanspaces.com](https://fra1.digitaloceanspaces.com) depending on the region you have chosen (DO_SPACES_ENDPOINT).
4. The region in this example is `fra1` (DO_SPACES_REGION).
5. Finally the bucket is the unique name you create when you set-up the space (DO_SPACES_BUCKET).

Laravel doesn’t come with Digital Ocean configuration out of the box, you can add it into your config/filesystem.php file:

```php
'disks' => [
	//...
	'spaces' => [
	  'driver' => 's3',
	  'key' => env('DO_SPACES_KEY'),
	  'secret' => env('DO_SPACES_SECRET'),
	  'endpoint' => env('DO_SPACES_ENDPOINT'),
	  'region' => env('DO_SPACES_REGION'),
	  'bucket' => env('DO_SPACES_BUCKET'),
	]
]
```

### Database Set-up

We need to add a column to the users table for the avatar. In the users migration file, within the `up` method add the following:

```php
Schema::create('users', function (Blueprint $table) {
	//...
	$table->string('avatar')->nullable();
});
```

Set the column to fillable in the User model:

```php
protected $fillable = [
  'name',
  'email',
  'avatar',
  'password',
 ];
```

Run the migrations (don’t forget we are using sail, if you are not then swap `sail` for `php`).

```php
sail artisan migrate:fresh --seed
```

### AvatarController Controller

Add an AvatarController controller using the Artisan command:

```php
sail artisan make:controller AvatarController
```

Add a `store` method to the AvatarController. This method first gets the authenticated user and creates a file path using the `Storage` helper.

The first parameter to the `Storage` method creates a string path where you want to save the file. Digital Ocean will build a folder structure from this `avatars/user-1` as an example. Next the file is retrieved from the request and we set the url to be `public` so that it can be viewed in our application. Finally the full URL to the avatar is saved against the user in the avatar column. Note how we use the `DO_SPACES_PUBLIC` environment variable with the file path.

To return the user’s data back in a formatted json response we create a `UserResource`, you can review how resources work [here](https://laravel.com/docs/8.x/eloquent-resources#introduction).

```php
namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    public function store(Request $request)
    {
      try {
          $user = Auth::user();
          $filePath = Storage::disk('spaces')
              ->putFile('avatars/user-'.$user->id, $request->file, 'public');
          $user->avatar = env('DO_SPACES_PUBLIC').$filePath;
          $user->save();
      } catch (Exception $exception) {
          return response()->json(['message' => $exception->getMessage()], 409);
      }
          return new UserResource($user);
    }
}
```

### UserResource

Add an avatar field to the UserResource:

```php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
		  //...
          'avatar' => $this->avatar,
        ];
    }
}
```

### API Endpoint

Add the avatar upload endpoint within the sanctum middleware group of your routes/api.php file:

```php
Route::middleware(['auth:sanctum'])->group(function () {
    //...
	Route::post('/users/auth/avatar', [AvatarController::class, 'store']);
});
```

With all this set-up complete you should be able to [upload an image from your Vue SPA](/file-uploads/single-file-upload-vue) and see it in your Digital Ocean admin area.
