---
title: "Pagination Example"
description: "Here is an example on building a Vue pagination component with Vuex, that fetches data from a Laravel API."
position: 15
category: "Examples"
menuTitle: "Pagination"
---

In the [API Resources documentation](/api-resources-overview#pagination) we set up a `UserResource` using the paginate method to return a JSON structure which looks like this:

```js
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

To make use of this data within Vue there are few stages we need to work through.

### Add a Users Route

Create a `Users` component in /src/components/views, for now, you can leave it blank. In the /src/router/index.js file add the following route:

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

For a full explanation on what this route is doing make sure to check out the [Protecting Routes](/authorization/laravel-basic-authorization#protecting-routes-based-on-isadmin) guide.

### User Service

Set up a /src/services/UserService.js file that will manage the endpoints used to fetch user data. Add the following endpoints:

```js
import * as API from "@/services/API";

export default {
  getUsers(page) {
    return API.apiClient.get(`/users/?page=${page}`);
  },
  paginateUsers(link) {
    return API.apiClient.get(link);
  },
};
```

### User Vuex Store

Once the API has sent back the request, we will add it to a `User` Vuex store. Create the following file /src/store/User.js adding the following:

```js
import { getError } from "@/utils/helpers";
import UserService from "@/services/UserService";

export const namespaced = true;

export const state = {};

export const mutations = {};

export const actions = {};

export const getters = {};
```

In the state object add a users array property, along with the other state properties we will need:

```js
export const state = {
  users: [],
  meta: null,
  links: null,
  loading: false,
  error: null,
};
```

Next lets set up the mutations which will update the state:

```js
export const mutations = {
  SET_USERS(state, users) {
    state.users = users;
  },
  SET_META(state, meta) {
    state.meta = meta;
  },
  SET_LINKS(state, links) {
    state.links = links;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};
```

Set up the action that will be called to initially fetch the first page of users, and pass them to the mutation:

```js
export const actions = {
  getUsers({ commit }, page) {
    commit("SET_LOADING", true);
    UserService.getUsers(page)
      .then((response) => {
        setPaginatedUsers(commit, response);
      })
      .catch((error) => {
        commit("SET_LOADING", false);
        commit("SET_ERROR", getError(error));
      });
  },
};
```

Because the `getUsers` action and proceeding `paginateUsers` action both have similar functionality we can pull the logic out into a single `setPaginatedUsers` method. Place this at the top of the /src/store/User.js file.

```js
function setPaginatedUsers(commit, response) {
  commit("SET_USERS", response.data.data);
  commit("SET_META", response.data.meta);
  commit("SET_LINKS", response.data.links);
  commit("SET_LOADING", false);
}
```

Set up another action that will fetch the paginated users based on the link which is passed in:

```js
export const actions = {
  //...
  paginateUsers({ commit }, link) {
    commit("SET_LOADING", true);
    UserService.paginateUsers(link)
      .then((response) => {
        setPaginatedUsers(commit, response);
      })
      .catch((error) => {
        commit("SET_LOADING", false);
        commit("SET_ERROR", getError(error));
      });
  },
};
```

Finally, let’s add the getters so that we can have access to the state:

```js
export const getters = {
  users: (state) => {
    return state.users;
  },
  meta: (state) => {
    return state.meta;
  },
  links: (state) => {
    return state.links;
  },
  loading: (state) => {
    return state.loading;
  },
  error: (state) => {
    return state.error;
  },
};
```

You should now have a Vuex store for managing the user state. Take a look at the complete file in the demo application’s [GitHub repo](https://github.com/garethredfern/laravel-vue/blob/v1.3.4/src/store/modules/User.js). Don’t forget to include your new `User` store in the /src/store/index.js file:

```js
import * as user from "@/store/modules/User";

export default new Vuex.Store({
  modules: {
    //...
    user,
  },
});
```

### Users View

The `users` view will display a list of the first page of users when they load. To fetch the users before the page loads we will use the `beforeRouteEnter` Vue hook:

```js
beforeRouteEnter(to, from, next) {
  const currentPage = parseInt(to.query.page) || 1;
  store.dispatch("user/getUsers", currentPage).then(() => {
    to.params.page = currentPage;
    next();
  });
}
```

Inside the `beforeRouteEnter` hook we get the current page number from the query string, or set it to 1 if it doesn’t exist. Then we dispatch the `getUsers` action we created before. The current page number is passed into the `getUsers` action.

With this in place, when the view loads the first page of users will be added into the Vuex store, and they can then be looped though within the Users template.

Take a look at the complete template code [on GitHub](https://github.com/garethredfern/laravel-vue/blob/v1.3.6/src/views/Users.vue).

### Paginate Component

The final part of the paginated `Users` template is to create the navigation to paginate between pages of users. To achieve this, we will create a `BasePagination` component. This component will be re-usable and not specific to just paginating users. It can be used to paginate any paginated list we get back from the Laravel API.

The complete `BasePagination` component can be seen [on GitHub](https://github.com/garethredfern/laravel-vue/blob/v1.3.6/src/components/BasePagination.vue).
First, pass in the props:

- `action`: is the Vuex action we want to call (`user/paginateUsers` in this example).
- `path`: is the route path for the view (/users in this example).
- `meta`: the API meta data passed from the `UserResource` paginate method.
- `links`: the API links data passed from the `UserResource` paginate method.

At the top of the template we display the page we are on and the number of pages:

```js
Page {{ meta.current_page }} of {{ meta.last_page }}
```

Each pagination button is then displayed:

```js
<button
  rel="first"
  type="button"
  @click="firstPage"
  v-if="links.prev"
>
  First
</button>
```

There are four buttons in total (first, previous, next, last), they all follow the same format except for the method they call and the conditional for displaying the button. The method for the `firstPage` button looks like this:

```js
 methods: {
  firstPage() {
    this.$store.dispatch(this.action, this.links.first).then(() => {
      this.$router.push({
        path: this.path,
        query: { page: 1 },
      });
    });
  }
  //...
}
```

When the user clicks on the first page button the action prop is called (`user/paginateUsers`) the action is passed the link that the Laravel API gives us for the first page using `this.links.first`. Finally, the router then updates the page with a query parameter `?page=1`. A similar process is followed for the other pagination links. Take a look at the full component [on GitHub](https://github.com/garethredfern/laravel-vue/blob/v1.3.6/src/components/BasePagination.vue).

### Conclusion

With the above examples complete you should have pagination set up for the users who are registered. Don’t forget the /users route is protected using the flag `isAdmin`. Have a look at the page on [Authorization](https://laravelvuespa.com/authorization/laravel-basic-authorization) for more details. To see the list of users, make sure you have set yourself to admin in the Laravel API database. You can reuse the pagination component anywhere you need to paginate lists of data from the API.
