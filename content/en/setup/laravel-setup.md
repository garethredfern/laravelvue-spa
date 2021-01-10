---
title: Setup Laravel API
description: "How to set up Laravel Sanctum and Fortify for use as a headless API."
position: 2
category: "Getting Started"
menuTitle: "Setup Laravel"
---

First, set up the Laravel API as you normally would. Here we are using [Laravel Sail](https://laravel.com/docs/8.x/sail). If you choose to run Laravel via Sail, your API will be accessible via `http://localhost`.

Make sure you change the following in your .env file:

```bash
DB_HOST=127.0.0.1
```

To this:

```bash
DB_HOST=mysql
```

Add a sender address in the `.env` so that email can be sent.

```bash
MAIL_FROM_ADDRESS=test@test.com
```

### Running Artisan Commands

You need to use the sail command to enable artisan to run within the Docker container.

Example of running a migration:

```bash
sail artisan migrate
```

### Install Sanctum

The full documentation can be found on the [Laravel website](https://laravel.com/docs/8.x/sanctum).

```bash
sail composer require laravel/sanctum

sail artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Sanctum needs some specific set up to enable it to work with a separate SPA. First lets add the following in your .env file:

```bash
SANCTUM_STATEFUL_DOMAINS=localhost:8080
SPA_URL=http://localhost:8080
SESSION_DOMAIN=localhost
```

The stateful domain tells Sanctum which domain you are using for the SPA. You can find the full notes and config for this in the config/sanctum.php file. As we are using cookies and sessions for authentication you need to add a session domain. This determines which domain the cookie is available to in your application. Full notes can be found in the config/session.php file and the [official documentation](https://laravel.com/docs/8.x/sanctum#spa-authentication).

Add Sanctum's middleware to your api middleware group within your application's app/Http/Kernel.php file:

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### Install Fortify

The full documentation can be found on the [Laravel website](https://laravel.com/docs/8.x/fortify).

```bash
sail composer require laravel/fortify

sail artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

Ensure the FortifyServiceProvider class is registered within the providers array of your application's config/app.php file.

```php
/*
 * Application Service Providers...
 */

App\Providers\FortifyServiceProvider::class,
```

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
