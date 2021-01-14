---
title: "File Uploads Vue"
description: "Using vue as an SPA. Set up the ability to upload a users avatar to Digital Ocean Spaces, using the Flysystem in Laravel."
position: 11
category: "File Uploads"
menuTitle: "File Uploads Vue"
---

To upload a single file in our application we will create a generic `FileUpload` component that can be reused. The component will accept props for the file types and API endpoint that the file will be uploaded to. In this example we will use the `FileUpload` component to upload a user's avatar to [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces/) using the Laravel API.

### FileService

Create a FileService.js file in the services folder and add the following uploadFile method:

```js
import * as API from "@/services/API";

export default {
  async uploadFile(payload) {
    await API.apiClient.post(payload.endpoint, payload.file);
  },
};
```

Create a FileUpload component that can be used to upload any single file. The full component can be found in the [Github repo](https://github.com/garethredfern/laravel-vue/blob/v1.2.1/src/components/FileUpload.vue), let’s break it down.

### File Input

The template will have an input field which has a type of `file` and the `accept` attribute value is a string that defines the file types, see further details [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept). The `fileTypes` are passed into the component as a prop.

```js
<input type="file" :accept="fileTypes" @change="fileChange" />
```

### Data Object

The data object just has three properties. The `file` property will hold the file object when it’s selected. The `message` and `error` properties hold the success and error messages that get displayed.

```js
data() {
  return {
    file: null,
    message: null,
    error: null,
  };
}
```

### Methods

The clearMessage method is simply used to clear any messages or errors each time a new file is uploaded.

```js
clearMessage() {
  this.error = null;
  this.message = null;
}
```

The fileChange method runs every time a file is selected, and it sets the `file` data property to the `event.target.files[0]` which will be a [File object](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#getting_information_on_selected_files).

```js
fileChange(event) {
  this.clearMessage();
  this.file = event.target.files[0];
}
```

The `uploadFile` method will create a payload to pass through to the `FileService`. To send the file through in the correct format we need to new up an instance of the `FormData` object. The `FormData` object has an `append` method where the file is passed in. See more information how this works over on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/FormData). The payload also has an `endpoint` property which is used to accept the API endpoint that the file will be sent to. We do this so that the `FileUpload` component can be reusable for uploading different files to different API endpoints.

```js
uploadFile() {
  const payload = {};
  const formData = new FormData();
  formData.append("file", this.file);
  payload.file = formData;
  payload.endpoint = this.endpoint;
  this.clearMessage();
  FileService.uploadFile(payload)
    .then(() => (this.message = "File uploaded."))
    .catch((error) => (this.error = getError(error)));
}
```

With the `FileUpload` component built all that's left to do is add it into the [User view](https://github.com/garethredfern/laravel-vue/blob/v1.2.1/src/views/User.vue) we previously created.

```js
<template>
  //...
  <FileUpload
    label="Upload Avatar"
    :fileTypes="['image/*']"
    endpoint="/users/auth/avatar"
    class="p-5 bg-white border rounded shadow"
  />
</template>
<script>
  import FlashMessage from "@/components/FlashMessage";
  export default {
    //...
    components: {
      FlashMessage,
    }
  }
</script>
```

With this in place and the [Laravel API functionality](/file-uploads/single-file-upload-laravel) built, you should be able to login to your application and upload a file to your Digital Ocean Spaces account.
