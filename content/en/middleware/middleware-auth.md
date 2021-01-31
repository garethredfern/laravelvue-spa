---
title: "Middleware Auth"
description: "A Vue middleware to check if a user is authenticated before displaying the protected route. If the authentication fails the user is redirected to the login page."
position: 17
category: "Middleware"
menuTitle: "Auth"
---

A middleware to check if a user is authenticated before displaying the protected route. If the authentication fails the user is redirected to the login page.

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

To add this middleware to any route simply import it into your router/index.js file:

```js
import auth from "@/middleware/auth";
```

Finally add the auth method as a middleware router parameter on the meta property:

```js
{
  path: "/dashboard",
  name: "dashboard",
  meta: { middleware: [auth] },
  component: () =>
    import(/* webpackChunkName: "dashboard" */ "../views/Dashboard"),
}
```
