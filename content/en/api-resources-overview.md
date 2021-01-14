---
title: "API Resources - Overview"
description: "Laravel API resources provide a way to shape the response you send back when a call is made to your API. Let's see how they can be used to serve data to a Vue SPA."
position: 12
category: "API"
menuTitle: "API Resources"
---

Laravel API resources provide a way to shape the response you send back when a call is made to your API. They give you fine grain control over which attributes are returned and even allow you to include relationship data. You can think of API resources as the data layer between your SPA and API. The response that is sent back follows the [JSON API spec](https://jsonapi.org/) which is a convention that is used throughout the industry. Let’s take a look at how we can use them.

### Creating a Resource

Laravel provides the handy artisan command (don’t forget we are using Sail, if you are not, then swap `sail` for `php`).

```bash
sail artisan make:resource UserResource
```

The created resource will be placed in the app/Http/Resources directory of your application. Within the return statement you can add the model fields that you would like to be converted to JSON. Let’s take a look at the [UserResource](https://github.com/garethredfern/laravel-api/blob/v1.1/app/Http/Resources/UserResource.php) class.

```php
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
          'id' => $this->id,
          'name' => $this->name,
          'email' => $this->email,
          'avatar' => $this->avatar,
          'emailVerified' => $this->email_verified_at,
        ];
    }
}
```

The above will send back the user data in the following JSON format:

```json
{
  "data": {
    "id": 1,
    "name": "Luke Skywalker",
    "email": "luke@jedi.com",
    "avatar": "https://imageurls.com/image",
    "emailVerified": null
  }
}
```

The Laravel automatically wraps the user data in a data object, which is what the JSON spec suggests. To return the above JSON response you need to new up a UserResource and pass a user model into it.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function ($id) {
    return new UserResource(User::findOrFail($id));
});
```

### Resource Collections

If you are returning a collection of resources or a paginated response, you should use the `collection` method provided by your resource class when creating the resource instance in your route or controller:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

### Pagination

Laravel provides a handy paginate helper which you can use to paginate a resource collection. You can specify the number of records you would like to display (2 in this example) for each page. Alternatively leave the paginate method empty, and it will default to 15.

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return new UserResource(User::paginate(2));
});
```

The JSON output from the paginate method will look like this:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Luke Skywalker",
      "email": "luke@jedi.com"
    },
    {
      "id": 2,
      "name": "Ben Kenobi",
      "email": "ben@jedi.com"
    }
  ],
  "links": {
    "first": "http://example.com/pagination?page=1",
    "last": "http://example.com/pagination?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "http://example.com/pagination",
    "per_page": 15,
    "to": 10,
    "total": 10
  }
}
```

As you can see the JSON output has a `links` object for the first, last, previous and next pages so that you can fetch page data. The `meta` object can be used for displaying useful link information in your pagination navigation.

The above examples have been taken from the Laravel documentation to get you started but there are a lot more features you can use. Take a look at the [full documentation](https://laravel.com/docs/8.x/eloquent-resources) for further reading.
