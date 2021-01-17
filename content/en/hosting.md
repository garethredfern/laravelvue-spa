---
title: "Hosting & Going Live"
description: "An overview of what is needed to publish your Vue Spa on Netlify and host the API via Laravel Forge."
position: 14
category: "Hosting"
menuTitle: "Hosting Set up"
---

Once you are ready to go live with your site, there are a few steps you will need to follow. Choosing the right host is important. Here we will look at hosting the Laravel API through [Laravel Forge](https://forge.laravel.com/) on [Digital Ocean](https://www.digitalocean.com/) and the Vue SPA on [Netlify](https://www.netlify.com/). The reason for choosing Forge and Netlify is because of how they offer one of the lowest barriers to entry for managing servers. This page doesn’t cover everything you need to do for setting up your hosting as it assumes basic knowledge of DNS and server admin.

### Forge

Create a new server in the admin panel of Forge and make sure you have added your SSH key for your local machine. Once a server is provisioned, you will want to delete the default site and create a new site called `api.yourappname.com`. As an example, the demo site for this site is called `api.laravelvuespa.app`. Hook it up to deploy from your Github account and make sure to select Let’s Encrypt to add the SSL certificate so that the domain runs on https.

### Configure Environment Variables

In your Forge .env file (editable via the control panel) make sure to add/change the following variables. Obviously, change out the url to your own.

**It’s critical you add these otherwise sessions and Sanctum will not work.** Also note the period `.laravelvuespa.app` before the domain name, this allows for the API to run on a subdomain and still have sessions work.

```bash
SANCTUM_STATEFUL_DOMAINS=laravelvuespa.app
SESSION_DOMAIN=.laravelvuespa.app
SPA_URL=https://laravelvuespa.app
```

While you are in the .env file add a mail provider, here is an example of setting up [Mailgun](https://www.mailgun.com/).

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.eu.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=addyourusername
MAIL_PASSWORD=addyourpassword
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=info@laravelvuespa.app
MAIL_FROM_NAME="${APP_NAME}"
```

### View Database with Table Plus

If you have your SSH key set up in Forge and added to your server you can connect to your database using a GUI such as Table Plus. Here are the details you need to add in the Table Plus config:

![](https://res.cloudinary.com/redfern-web/image/upload/v1610315300/laravelvue-spa/table-plus.png)

### Netlify

Netlify will be used to host the main SPA and control the DNS for both the API and SPA. It’s free to set up an account and host a starter project. Once you are logged in click on the “New site from Git” button and link up your repository from Github. Follow the 3 step on screen instructions and when you get to the basic build settings make sure you click on “show advanced”, add a new variable:

![](https://res.cloudinary.com/redfern-web/image/upload/v1610348790/laravelvue-spa/netlify-env.png)

With the above in place you can go ahead and deploy your app. Once it’s deployed you can visit the app using the Netlify provided URL. The next thing to do will be to use Netlify for your DNS. Before you do, add a netlify.toml file in the root of your project.

In the netlify.toml file add the following config. It will stop your SPA going to a Netlify 404 when the user refreshes their browser, read more in [the docs](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps). Once you have done this, redeploy your app.

```bash
[build]
  publish = "dist"
  command = "npm run build"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### DNS Set up

While your app can be viewed at yoursite.netlify.app, you need it to be routed to your domain. On the far right-hand side of the top menu click on site settings.

![](https://res.cloudinary.com/redfern-web/image/upload/v1610349523/laravelvue-spa/netlify-menu.png)

Then on the left-hand menu click on Domain management. On this page you will set up Netlify as your DNS provider and once your domain is pointing at Netlify you can add an SSL certificate using the Let’s Encrypt option.

The final set up required is to add your subdomain for the API as a `A` record which points to the server you provisioned in Laravel Forge. Make sure to also add the details from your malign account so that mail can be sent. Here is the full list from the demo app for reference:

![](https://res.cloudinary.com/redfern-web/image/upload/v1610349935/laravelvue-spa/netlify-dns.png)

This should be everything set up and your app should now be live. The next thing to do is add a user via the register form and check that you receive a verification email. Once verified, you can log in and start testing.
