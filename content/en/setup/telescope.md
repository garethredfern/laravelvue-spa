---
title: "Test API Endpoints with Telescope"
description: "Testing your API endpoints to see what is returned is an essential part of building a Laravel API, here's how to use Telescope."
position: 5
category: "Getting Started"
menuTitle: "Telescope"
---

Laravel has a first party package called [Telescope](https://laravel.com/docs/9.x/telescope). It provides insight into the requests coming into your application, exceptions, log entries, and a lot more. For any Laravel development you will find it an essential tool to have in your belt.

### Installing Telescope

You can use Composer to install Telescope into your Laravel project. Don’t forget we are using Sail, if you are not, then swap `sail` for `php`.

```bash
composer require laravel/telescope
```

After installing Telescope, publish its assets using the telescope:install Artisan command. After installing Telescope, you should also run the migrate command in order to create the tables needed to store Telescope's data. Don’t forget we are using Sail, if you are not, then swap `sail` for `php`).

```bash
sail artisan telescope:install

sail artisan migrate
```

Once you have installed Telescope visit the API url `/telescope`, if you have set your site up following the setup instructions using Sail then visit `http://localhost/telescope` in your browser. You will now be able to use it in parallel with [Insomnia or Postman](/setup/tooling). Every request that goes into your API will be recorded and you can see useful information to help with debugging. Here's and example of viewing a request and its associated response in the telescope control panel.

![](https://res.cloudinary.com/redfern-web/image/upload/v1610184996/laravelvue-spa/telescope.gif)

For further reading on what telescope can do take a look at the [documentation](https://laravel.com/docs/9.x/telescope).
