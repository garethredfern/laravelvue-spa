---
title: "Middleware Guest"
description: "A Vue middleware which checks if the current user is logged in and stops them seeing guest pages such as login."
position: 18
category: "Middleware"
menuTitle: "Guest"
---

A middleware which checks if the current user is logged in and stops them seeing guest pages such as login. If you are logged in then it makes no sense to be able to view the login view, the user gets redirected to the dashboard instead.

```js
export default function guest({ next, store }) {
  if (!store.getters["auth/guest"] && !store.getters["auth/authUser"]) {
    store.dispatch("auth/getAuthUser").then(() => {
      if (store.getters["auth/authUser"]) {
        next({ name: "dashboard" });
      } else {
        store.dispatch("auth/setGuest", { value: true });
        next();
      }
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
  path: "/login",
  name: "login",
  meta: { middleware: [guest] },
  component: () =>
    import(/* webpackChunkName: "login" */ "../views/Login"),
}
```
