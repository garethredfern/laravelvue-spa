---
title: Setup Vue SPA
description: "How to set up a Vue SPA that uses Laravel as an API."
position: 3
category: "Getting Started"
menuTitle: "Setup Vue"
fullscreen: true
---

It is assumed you have some experience working with VueJS, its router and state management package Vuex. You can install the Vue CLI using:

<code-group>
<code-block label="NPM">

```bash
npm install -g @vue/cli @vue/cli-service-global
```

</code-block>
<code-block label="Yarn" active>

```bash
yarn global add @vue/cli @vue/cli-service-global
```

</code-block>
</code-group>

Using the Vue CLI create a project, the example used is called `laravel-vue`:

```bash
vue create laravel-vue
```

When asked, install the following packages:

- [Vue Router](https://router.vuejs.org/)
- [Vuex](https://vuex.vuejs.org/)
- [Axios](https://github.com/axios/axios)

- [Tailwind CSS](https://tailwindcss.com/)
