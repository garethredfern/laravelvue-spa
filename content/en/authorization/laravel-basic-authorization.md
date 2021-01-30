---
title: "Basic Authorization"
description: "How to set up basic authorization in a Laravel API, adding an is_admin field to a user model."
category: Authorization
position: 10
menuTitle: "Basic Authorization"
---

## Basic Authorization - Laravel API

While authentication determines if a user has access to your application, authorization determines what they can see when they are logged in. Authorization can be as simple or as complex as you need it to be. Often you will have user roles with permissions assigned to them. A role or maybe multiple roles are then assigned to a user.

### Add a Column to the User Table

To keep things nice and simple let’s start with assigning a user as an admin. Admins will be able to see extra content and perform additional tasks in the application. To set up this functionality we will add a boolean column to the users table of `is_admin`. Add the following to your user migration file in the Laravel API:

```php
public function up()
{
    Schema::create('users', function (Blueprint $table) {
        //...
        $table->boolean('is_admin')->default(false);
    });
}
```

Run the migrations (don’t forget we are using Sail, if you are not, then swap `sail` for `php`).

```bash
sail artisan migrate:fresh --seed
```

### Create a Helper Method on the User Model

With the new `is_admin` column in place on the users table it’s time to update the `User` model. First cast the `is_admin` column to a boolean:

```php
protected $casts = [
	//...
	'is_admin' => 'boolean',
];
```

Now add the following helper method to the `User` model:

```php
public function isAdmin(): bool
{
	return $this->is_admin;
}
```

This method will allow you to write very readable code when checking if a user is an admin for example:

```php
Auth::user()->isAdmin();
```

### Protecting a List of Users

Let’s put our new `isAdmin` method to good use. In our demo application we may want only admins to be able to see other users in the application. In the `UserController` `index` method we paginate a list of all the users. We protect this by checking if the authenticated user is an admin.

```php
public function index()
{
    if (Auth::user()->isAdmin()) {
        return UserResource::collection(User::paginate());
    }
    return  response()->json(["message" => "Forbidden"], 403);
}
```

With the above in place, when the API route GET method of /users is hit. Laravel will check a user is authenticated (logged in), then check if they are an admin. If the user is an admin, the paginated list of users is returned. If they are not an admin, a 403 HTTP status is returned (forbidden).

### Restricting Content and Functionality in Vue

In the SPA we already fetch the authenticated user’s details when they log in. Now we can send back whether the user is an admin by adding the field to the UserResource.

```php
public function toArray($request)
{
    return [
      //...
      'isAdmin' => $this->isAdmin(),
    ];
}
```

With the above code in place any time you want to check if a user is an admin in Vue you can access it from the `auth` Vuex store. Let’s add a getter to check for the isAdmin property. In your auth Vuex store add the following to your getters:

```js
export const getters = {
  //...
  isAdmin: (state) => {
    return state.user ? state.user.isAdmin : false;
  },
};
```

Now you can check in any component or page view if a user is an admin by using the getter:

```js
import { mapGetters } from "vuex";

export default {
  //...
  computed: {
    ...mapGetters("auth", ["isAdmin"]),
  },
};
```

### Protecting Routes based on isAdmin

You can protect a route in Vue by adding a [navigation guard](https://router.vuejs.org/guide/advanced/navigation-guards.html). We have already seen this in action when we check for an authenticated user before entering the application. To protect a single route you can add the`beforeEnter` check to a route you want to protect in your src/router.index.js file.

```js
const routes = [
  //...
  {
    path: "/users",
    name: "users",
    meta: { requiresAuth: true },
    component: () => import("../views/Users"),
    beforeEnter: (to, from, next) => {
      if (store.getters["auth/isAdmin"]) next();
      else next(false);
    }
  }
});
```

This will stop the route being accessed by anyone who doesn’t have the `isAuth` property set to `true` on their profile.

### Summary

This page provides a basic example of setting up authorization. With this alone, you can get quite far in a simple application. Often you will only have users who log in and see their data, while an admin might need to log in and see multiple users. For more complex applications you will probably need to set up roles with permissions.
