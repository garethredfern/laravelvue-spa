---
title: "Middleware Overview"
description: "Adding middleware to a Vue Spa will keep code clean and provide a way to have multiple functions run before the route loads."
position: 16
category: "Middleware"
menuTitle: "Overview"
---

As your app grows, you will need to have a way to control what happens before a route is loaded. An example of this is covered in [adding authentication](/authentication/vue-authentication#protecting-routes-and-maintaining-state). Using the `beforeEach` router hook we check if a route `requiresAuth`, if it does then the authentication logic is run. This works well if you are only checking authentication, but what happens if you need to add additional checks for admin routes? A user is checked to see if they are authenticated, then if they are going to view the /users route they also have to be an admin. See the [basic authorization](/authorization/laravel-basic-authorization) example for a refresher on this functionality.

### Refactoring Authentication for Middleware

To provide a solution for adding multiple checks on a route we can use the middleware design pattern. Making use of the `beforeEach` router hook we can chain multiple middleware functions together whilst keeping the router template code clean.

<alert>
Please note, this example is more advanced than the previous examples. There will be a number of changes made to the codebase. See the middleware release v1.5 on GitHub for more details.
</alert>

[Middleware release v1.5](https://github.com/garethredfern/laravel-vue/releases/tag/v1.5)

Previously we set a `meta` attribute of `requiresAuth` on any route which needed authentication:

```js
{
  path: "/dashboard",
  name: "dashboard",
  meta: { requiresAuth: true }
  //...
}
```

This can now be swapped out to pass an array of middleware functions that will be invoked before the route is entered:

```js
{
  path: "/dashboard",
  name: "dashboard",
  meta: { middleware: [auth] }
}
```

The middleware functions will be kept together in a new folder src/middleware. Let’s have a look at the `auth` function. It should look familiar because most of the code is cut from the original `beforeEach` method we created.

```js
export default function auth({ to, next, store }) {
  const loginQuery = { path: "/login", query: { redirect: to.fullPath } };

  if (!store.getters["auth/authUser"]) {
    store.dispatch("auth/getAuthUser").then(() => {
      if (!store.getters["auth/authUser"]) next(loginQuery);
      else next();
    });
  } else {
    next();
  }
}
```

See the [auth middleware page](/middleware/middleware-auth) for a detailed description of this method. For now, just focus on the pattern for a middleware function:

```js
export default function auth({ to, next, store }) {}
```

The function `auth` takes an object of parameters we require. This will usually be `to` and always be `next` which are passed in from the Vue router as `context`. Here we also require access to the Vuex store so that gets passed in too.

<alert>
Don’t forget to import any middleware into the router file at the top.
</alert>

Now let’s look at the new `beforeEach` router method and how we can then call the `auth` middleware method.

```js
router.beforeEach((to, from, next) => {
  const middleware = to.meta.middleware;
  const context = { to, from, next, store };

  // Check if no middlware on route
  if (!middleware) {
    return next();
  }

  middleware[0]({ ...context });
});
```

Middleware and context get stored as variables:

```js
const middleware = to.meta.middleware;
```

The `context` object holds any properties required in the middleware being called:

```js
const context = { to, from, next, store };
```

A check is performed to see if there is no middleware on the route being requested. If there isn’t, return `next` which allows the route to load as normal.

```js
if (!middleware) {
  return next();
}
```

Finally, call the first middleware function from the middleware array. Here we only have one `auth` to keep the example simple:

```js
return middleware[0]({ ...context });
```

### The Middleware Pipeline

So far, there has only been one middleware function called `auth`, let’s look at how we can call multiple middleware functions using a pipeline. On the /users route we need authentication and admin middleware:

```js
{
  path: "/users",
  name: "users",
  meta: { middleware: [auth, admin] }
}
```

You can review the `admin` middleware function in its [separate middleware page](/middleware/middleware-admin). Let’s look at how we can call both `auth` and `admin` middleware functions from with the `berforeEach` hook.

```js
router.beforeEach((to, from, next) => {
  const middleware = to.meta.middleware;
  const context = { to, from, next, store };

  if (!middleware) {
    return next();
  }

  middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1),
  });
});
```

The only difference with the above `beforeEach` method and the previous one is this line:

```js
next: middlewarePipeline(context, middleware, 1);
```

<alert>
Don’t forget to import the middlewarePipeline file at the top of the main router file.
</alert>

The `middlewarePipeline` method on the `next` property gets called recursively, passing in any context, middleware and the `index` for the next middleware array function to be called. Create a new file router/middlewarePipeline.js and add the following:

```js
export default function middlewarePipeline(context, middleware, index) {
  const nextMiddleware = middleware[index];

  if (!nextMiddleware) {
    return context.next;
  }

  return () => {
    nextMiddleware({
      ...context,
      next: middlewarePipeline(context, middleware, index + 1),
    });
  };
}
```

Breaking the `middlewarePipeline` function down:

1. The `context`, `middleware` array and current array `index` get passed in.
2. A variable is created which saves the next middleware to run. If there are two items in the middleware array `[auth, admin]` and `auth` has just run `nextMiddleware` will hold `admin`.
3. If there are no more items in the middleware array the condition `if (!nextMiddleware)` checks for it and returns `next`, so that the route will still load.
4. If there is a middleware to run then `nextMiddleware` gets returned (and then called) passing in the `context` and recursively calling the `middlewarePipeline` function with the `index` being **incremented by 1** so that the next middleware can be run (if it exists).

The middleware pipeline can take a bit of time to understand. Try to think of it as a helper method checking for any additional middleware to call pushing them through the pipeline until there are no more. Check out the full code by reviewing [Middleware release v1.5](https://github.com/garethredfern/laravel-vue/releases/tag/v1.5).
