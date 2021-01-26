---
title: "Handling Errors"
description: "How to safely handle errors in a Vue SPA using Laravel as an API. Laravel API Errors and Exceptions: How to Return Responses."
position: 14
category: "Errors"
menuTitle: "Handling Errors"
---

### Handling Errors

As users interact with your app, there will be various errors generated which need to be displayed to the user and logged for developers. These errors can come in a few different formats depending on if they are data validation errors or server generated errors. If the server is down or there is a problem with the code. Let’s have a look at the errors which may occur and how to handle them.

All errors will need to be “caught” in the SPA so that the error can be handled. Lots of examples are throughout the demo app but here is a reminder when working with promises of one way to handle it:

```js
AuthService.updatePassword(payload)
  .then(() => (this.message = "Password updated."))
  .catch((error) => (this.error = getError(error)));
```

The above code returns a promise via the `AuthService` if that promise has an error attached to it the catch statement passes the error to a helper function `getError`. We will take a look at the `getError` helper method in a minute, but it’s helpful to understand the properties that can be on the error object. The first one is the response property.

```js
error.response;
```

The `response` property can be `undefined` if an API route that doesn’t exist is being hit or the API server is down. Generally, there will be a response retuned and on that, there are a few useful properties.

```js
error.response.status;
```

The `status` property will give the HTTP status code `200` etc.

```js
error.response.headers;
```

The `headers` property provides any headers sent back with the response.

```js
error.response.data;
```

Finally, the data property will provide details about the error usually with a message.

When a user fills out a form in the SPA, there is the option to server side validate the data that is sent in the API. While SPA validation arguably gives a better user experience, it’s still important to handle validation errors server side. Laravel’s validation errors will be sent in the following format:

```js
error.response.data.errors = {
  current_password: [
    "The current password field is required.",
    "The provided password does not match your current password.",
  ],
  password: ["The password field is required."],
};
```

Laravel might also send 404 or 500 error if the SPA code is trying to access a route that doesn’t exist or the API server is down. To handle all the possible errors let’s look at the `getError` helper method /utils/helpers.js in the Vue SPA.

```js
export const getError = (error) => {
  const errorMessage = "API Error, please try again.";

  if (!error.response) {
    console.error(`API ${error.config.url} not found`);
    return errorMessage;
  }
  if (process.env.NODE_ENV === "development") {
    console.error(error.response.data);
    console.error(error.response.status);
    console.error(error.response.headers);
  }
  if (error.response.data && error.response.data.errors) {
    return error.response.data.errors;
  }

  return errorMessage;
};
```

The first condition checks for no response on the error object e.g. it’s `undefined` this usually indicates there is a 404 error. The API endpoint is logged to the console and the error message is returned.

The second condition logs useful error date to the console if the App is in development mode.

The last condition checks for errors attached to the data object on the response. These will be the Laravel validation errors.

### Displaying Errors

To display any errors or messages there is a `FlashMessage` component. The component takes either a message or error as props. Let’s look at the methods and computed properties first:

```js
<script>
export default {
  name: "FlashMessage",
  props: {
    message: {
      type: String,
      default: null,
    },
    error: {
      type: [Object, String],
      default: null,
    },
  },
  computed: {
    errorKeys() {
      if (!this.error || this.getType(this.error) === "string") {
        return null;
      }
      return Object.keys(this.error);
    },
  },
  methods: {
    getErrors(key) {
      return this.error[key];
    },
    getType(obj) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    },
  },
  filters: {
    titleCase(value) {
      return value.replace("_", " ");
    },
  },
};
</script>

```

The computed property `errorKeys` will check if there is an error and that the error is not a simple string. If it’s an object it returns the objects keys as an array. These keys will be looped over to get the title of each error, they are normally the Laravel API column names where the error occurred:

- current_password
- password

The `errorKeys` are then looped over in the template and two things happen.

1. The Keys are passed into the `getErrors` method to display each of the errors against that key:

```js
current_password: [
  "The current password field is required.",
  "The provided password does not match your current password."
],
```

2. The key is title cased using the filter `titleCase` to make it look like a heading and remove any underscores from the key name.

The last method `getType` is used to safely get the type in JavaScript. It’s used for checking if the error is an object or string.

```js
getType(obj) {
  return Object.prototype.toString
	.call(obj)
	.slice(8, -1)
	.toLowerCase();
}
```

Here is the template code for the `FlashMessage` component (css classes removed to simplify things). Depending on whether the error is a string or object, the errors are looped through and displayed under each error heading.

```js
<template>
  <div>
    <p v-if="message" key="message">
      {{ message }}
    </p>
    <p
      v-if="error && getType(error) === 'string'"
      key="error"
     >
      {{ error }}
    </p>
    <ul
      v-if="getType(error) === 'object'"
      key="error-list"
    >
      <li v-for="key in errorKeys" :key="key">
        <b>{{ key | titleCase }}</b>
        <ul>
          <li v-for="(item, index) in getErrors(key)" :key="`${index}-error`">
            {{ item }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
```
