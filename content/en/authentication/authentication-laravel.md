---
title: "Authentication - Laravel API"
description: "How to set up full authentication using Laravel Sanctum & Fortify in a Vue SPA. Laravel API documentation."
category: Authentication
position: 1
menuTitle: "Laravel"
---

### Setting Up CORS

If you don’t get CORS set up correctly, it can be the cause (pardon the pun) of great frustration. The first thing to remember is that your SPA and API need to be running on the same top-level domain. However, they may be placed on different subdomains. Running locally (using Sail) the API will run on `http://localhost` and the SPA using the Vue CLI will normally run on `http://localhost:8080` (the port may vary but that is OK).

With this in place we just need to add the routes which will be allowed via CORS. Most of the API endpoints will be via `api/*` but Fortify has a number of endpoints you need to add along with the fetching of `'sanctum/csrf-cookie'` add the following in your config/cors.php file:

```php
'paths' => [
  'api/*',
  'login',
  'logout',
  'register',
  'user/password',
  'forgot-password',
  'reset-password',
  'sanctum/csrf-cookie',
  'email/verification-notification',
],
```

While you are in the config/cors.php file set the following:

```php
'supports_credentials' => true,
```

The above ensures you have the `Access-Control-Allow-Credentials` header with a value of `True` set. You can read more about this in the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials). We will be passing this header via the SPA but [more on that when we move to set it up](/articles/authentication-vue-spa-with-laravel-sanctum-fortify).

### Setting Up Fortify

Fortify also has a config file (config/fortify.php) which will need some changes. First set the `home` variable to point at the SPA URL, this can be done via the .env variable. This is where the API redirects to during authentication or password reset when the operations are successful and the user is authenticated.

```php
'home' => env('SPA_URL') . '/dashboard',
```

Next switch off using any Laravel views for the authentication features, the SPA is handling all of this.

```php
'views' => false,
```

Finally, turn on the authentication features you would like to use:

```php
'features' => [
  Features::registration(),
  Features::resetPasswords(),
  Features::emailVerification(),
  Features::updateProfileInformation(),
  Features::updatePasswords(),
],
```

### Redirecting If Authenticated

Laravel provides a `RedirectIfAuthenticated` middleware which out of the box will try and redirect you to the home view if you are already authenticated. For the SPA to work you can add the following which will simply send back a 200 success message in a JSON response. We will then handle redirecting to the home page of the SPA using VueJS routing.

```php
foreach ($guards as $guard) {
    if (Auth::guard($guard)->check()) {
      if ($request->expectsJson()) {
        return response()->json(['error' => 'Already authenticated.'], 200);
      }
      return redirect(RouteServiceProvider::HOME);
    }
}
```

### Email Verification

Laravel can handle email verification as it normally would but with one small adjustment to the `Authenticate` middleware. First. Let’s make sure your `App\Models\User` implements the `MustVerifyEmail` contract:

```php
class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    // ...
}
```

In the `Authenticate` Middleware change the `redirectTo` method to redirect to the SPA URL rather than a Laravel view:

```php
protected function redirectTo($request)
{
    if (! $request->expectsJson()) {
        return url(env('SPA_URL') . '/login');
    }
}
```

With this is in place Laravel will now send out the verification email and when a user clicks on the verification link it will do the necessary security checks and redirect back to your SPA’s URL.

### Reset Password

Setting up the reset password functionality in the API is as simple as following the [official docs](https://laravel.com/docs/8.x/passwords#reset-link-customization). For reference here is what you need to do.

Add the following at the top of `App\Providers\AuthServiceProvider`

```php
use Illuminate\Auth\Notifications\ResetPassword;
```

Add the following in the `AuthServiceProvider` boot method, this will create the URL which is used in the SPA with a generated token:

```php
ResetPassword::createUrlUsing(function ($user, string $token) {
	return env('SPA_URL') . '/reset-password?token=' . $token;
});
```

To make this all work we will need to have a reset-password view in the SPA which handles the token and passes back the users new password. This is explained in [the creating of the SPA article](/articles/authentication-vue-spa-with-laravel-sanctum-fortify), you can review the code on [Github](https://github.com/garethredfern/laravel-vue/blob/main/src/views/ResetPassword.vue).

### API Routes

Once you have all the authentication in place, any protected routes will need to use the `auth:sanctum` middleware guard. This will ensure that the user has been authenticated before they can view the requested data from the API. Here is a simple example of what those endpoints would look like.

```php
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/users/{user}', function (Request $request) {
    return $request->user();
});
```
