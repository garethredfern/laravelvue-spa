---
title: Setup Laravel API
description: "How to set up Laravel Sanctum and Fortify for use as a headless API."
position: 2
category: "Getting Started"
menuTitle: "Setup Laravel"
---

First, set up the Laravel API as you normally would. Here we are using [Laravel Sail](https://laravel.com/docs/9.x/sail). If you choose to run Laravel via Sail, your API will be accessible via `http://localhost`.

Add a sender address in the `.env` so that email can be sent.

```bash
MAIL_FROM_ADDRESS=test@test.com
```

### Running Artisan Commands

You need to use the sail command to enable artisan to run within the Docker container.

Example of running a migration:

```bash
sail up -d
sail artisan migrate
```

### Install Laravel Breeze

Laravel Breeze can scaffold an authentication API that is ready to authenticate modern JavaScript applications. To get started, specify the api stack as your desired stack when executing the breeze:install Artisan command:

```bash
composer require laravel/breeze --dev

sail artisan breeze:install api

sail artisan migrate
```

Breeze needs some specific set up to enable it to work with a separate SPA. First lets add the following in your .env file:

```bash
SANCTUM_STATEFUL_DOMAINS=localhost:8080
SESSION_DOMAIN=localhost
```

During installation, Breeze will add a FRONTEND_URL environment variable to your application's `.env` file. This URL should be the URL of your JavaScript application. This will typically be `http://localhost:3000` during local development. In addition, you should ensure that your `APP_URL` is set to `http://localhost`, which is the default URL used by Sail for the Laravel API.

### Database Seeding

Set up a seed for adding a test user, in the DatabaseSeeder.php file add the following:

```php
\App\Models\User::factory(1)->create(
	[
		'name' => 'Luke Skywalker',
		'email' => 'luke@jedi.com',
		'email_verified_at' => null,
	]
);
```

Run the migrations:

```bash
sail artisan migrate --seed
```
