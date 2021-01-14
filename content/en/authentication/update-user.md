---
title: "Update the Authenticated User Details"
description: "How to update a users details in a Vue Spa with a Laravel API using Fortify."
category: Authentication
position: 9
menuTitle: "Update User"
---

Using the Laravel Fortify action `UpdateUserProfileInformation` we can allow a user to update their details. This requires us to send a `PUT` request to the `/user/profile-information` endpoint.

### Setting Up Laravel

There isn’t much set up required on the Laravel side, just make sure that the `'user/profile-information'` endpoint is added in the paths array of the config/cors.php file.

```js
'paths' => [
  'user/profile-information',
  //...
],
```

With the above in place we should be able to send a request with the updated user details and Laravel will validate and update them.

### Setting Up the Auth Service Endpoint

In the services/AuthService.js file add the following endpoint:

```js
async updateUser(payload) {
  await authClient.put("/user/profile-information", payload);
},
```

The above will be used to send the user details to the Laravel API.

### The AuthUserForm Component

[View file on Github](https://github.com/garethredfern/laravel-vue/blob/v1.1.2/src/components/AuthUserForm.vue)

Now let’s focus on the form for updating a users details, starting with the template. We have two input fields, one for the name and one for the email. The input field is actually made from a `BaseInput` component. This component doesn’t do anything different to a normal HTML input field, but it provides a way to keep all the styling consistent and in one place.

```js
<template>
  <form @submit.prevent="updateUser">
    <BaseInput
      type="text"
      label="Name"
      name="name"
      v-model="name"
      class="mb-2"
    />
    <BaseInput
      type="email"
      label="Email"
      name="email"
      v-model="email"
      autocomplete="email"
      placeholder="luke@jedi.com"
      class="mb-4"
    />
    <BaseBtn type="submit" text="Update" />
    <FlashMessage :message="message" :error="error" />
  </form>
</template>
```

When the form is submitted, it fires the `updateUser` method. Let’s take a look at the code required to send the user details through to the Laravel API.

```js
export default {
  //...
  data() {
    return {
      name: null,
      email: null,
      error: null,
      message: null,
    };
  },
  computed: {
    ...mapGetters("auth", ["authUser"]),
  },
  methods: {
    updateUser() {
      this.error = null;
      this.message = null;
      const payload = {
        name: this.name,
        email: this.email,
      };
      AuthService.updateUser(payload)
        .then(() => this.$store.dispatch("auth/getAuthUser"))
        .then(() => (this.message = "User updated."))
        .catch((error) => (this.error = getError(error)));
    },
  },
  mounted() {
    this.name = this.authUser.name;
    this.email = this.authUser.email;
  },
};
```

The `AuthUserForm` component fetches the authenticated user’s details when it is mounted to the DOM. These details come from the Vuex auth store using a getter `authUser` and populate the `name` and `email` data object. With these data properties populated the user can change their details locally in the form and submit them using the `updateUser` method.

The updateUser method will send the details as a payload through the `AuthService.updateUser` method to the Laravel API. If there are any errors they are sent back and the error data property is populated. Errors and message are displayed via the `FlashMessage` component. If the changes were successful then the user is fetched using an action `auth/getAuthUser`. We do this to enable the new user details to be updated in the Vuex store, across the application these changes will be visible. Finally, a success message is shown to the user.
