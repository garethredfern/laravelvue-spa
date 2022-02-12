---
title: "Test API Endpoints with Insomnia or Postman"
description: "Testing your API endpoints to see what is returned is an essential part of building a Laravel API, here's how to use Insomnia or Postman."
position: 4
category: "Getting Started"
menuTitle: "Tooling"
---

To test the API whilst building all its endpoints and data fetching functionality, you can use either [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/). Both tools allow you to interact with your API endpoints whilst saving the necessary authentication token.

Both Insomnia and Postman should enable you to interact with Sanctum using cookies and sessions in the same way as the SPA does. However, it is much simpler to create a token endpoint, which returns a Bearer token to use whilst interacting with the API locally. **Do not use this method authenticating your SPA** cookies and sessions are the preferred and more secure method in production. For testing locally a Bearer token is nice and simple and works well.

### Add HasApiTokens Trait to User Model

To begin issuing tokens for users, your User model should use the `LaravelSanctumHasApiTokens` trait:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

### Token Controller

Create a `TokenController` either using the artisan command or by creating the file manually. The code to generate the token is adapted from the [Sanctum documentation](https://laravel.com/docs/9.x/sanctum#issuing-mobile-api-tokens) accept returning a json response with the token set in a token variable.

```php
namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TokenController extends Controller
{
  public function __invoke(Request $request)
  {
    $request->validate([
      'email' => 'required|email',
      'password' => 'required',
      'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
      throw ValidationException::withMessages([
        'email' => ['The provided credentials are incorrect.'],
      ]);
    }

    $token = $user->createToken($request->device_name)->plainTextToken;

    return response()->json(['token' => $token], 200);
  }
}
```

### Token API Endpoint & Controller

In your api routes file add the endpoint used to fetch a token:

```php
use App\Http\Controllers\TokenController;

Route::post('/sanctum/token', TokenController::class);
```

### Basic API Route & Controller
Add the following to your api routes file:
```php
use App\Http\Controllers\AuthController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users/auth', AuthController::class);
});
```

Create an `AuthController` which will include the following code:
```php
namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __invoke()
    {
        return new UserResource(Auth::user());
    }
}
```
The AuthController uses a `UserResource` this is just a handy way to send json in the format you require, for more information review the [API resources](/api-resources-overview) section.

To log in and receive a token you will need to send your login details and device name in a request using Insomnia or Postman:

```json
{
  "email": "luke@jedi.com",
  "password": "password",
  "device_name": "insomnia"
}
```

Once you have successfully logged in, you will need to send the Bearer token with every request to the API. You can save the Bearer token in an environment variable for convenience. [Here’s how to do it with Insomnia](https://stackoverflow.com/questions/54925915/insomnia-using-oath2-0-how-do-i-pull-the-access-token-into-a-variable).

### Test Endpoints & Request Headers

Make sure to send the `Bearer` token and `Accept: Application JSON` in the header for each request. Access the authenticated users details by sending a GET request:

```bash
http://localhost/api/users/auth
```

If everything has worked, you should receive a response like this:

```json
{
  "id": 1,
  "name": "Luke Skywalker",
  "email": "luke@jedi.com",
  "email_verified_at": "2020-12-30T08:38:13.000000Z",
  "two_factor_secret": null,
  "two_factor_recovery_codes": null,
  "created_at": "2020-12-27T07:54:43.000000Z",
  "updated_at": "2021-01-07T07:10:42.000000Z"
}
```

Additional endpoints can be built then tested similarly.

### Useful Links

- [Saving Environment Variables Insomnia](https://stackoverflow.com/questions/54925915/insomnia-using-oath2-0-how-do-i-pull-the-access-token-into-a-variable)
- [Laravel Sanctum with Postman](https://blog.codecourse.com/laravel-sanctum-airlock-with-postman/)
