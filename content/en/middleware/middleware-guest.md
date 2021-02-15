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
  const storageItem = window.localStorage.getItem("guest");
  if (storageItem === "isNotGuest" && !store.getters["auth/authUser"]) {
    store.dispatch("auth/getAuthUser").then(() => {
      if (store.getters["auth/authUser"]) {
        next({ name: "dashboard" });
      } else {
        store.dispatch("auth/setGuest", { value: "isGuest" });
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
import guest from "@/middleware/guest";
```

Finally add the guest method as a middleware router parameter on the meta property:

```js
{
  path: "/login",
  name: "login",
  meta: { middleware: [guest] },
  component: () =>
    import(/* webpackChunkName: "login" */ "../views/Login"),
}
```
