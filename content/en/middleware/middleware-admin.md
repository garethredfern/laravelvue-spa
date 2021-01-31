---
title: "Middleware Admin"
description: "A Vue middleware to check if the authenticated user is an admin. If they are not then the route redirects to a 404 view."
position: 19
category: "Middleware"
menuTitle: "Admin"
---

A middleware to check if the authenticated user is an admin. If they are not then the route redirects to a 404 view.

```js
export default function admin({ next, store }) {
  if (store.getters["auth/isAdmin"]) next();
  else next({ name: "notFound" });
}
```

To add this middleware to any route simply import it into your router/index.js file:

```js
import admin from "@/middleware/admin";
```

Finally add the admin method as a middleware router parameter on the meta property:

```js
{
  path: "/users",
  name: "users",
  meta: { middleware: [auth, admin] },
  component: () =>
    import(/* webpackChunkName: "users" */ "../views/Users"),
}
```
