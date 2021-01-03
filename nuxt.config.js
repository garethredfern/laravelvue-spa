import theme from "@nuxt/content-theme-docs";
import getRoutes from "./utils/getRoutes";

export default theme({
  docs: {
    primaryColor: "#d53f8c",
  },
  head: {
    script: [
      {
        async: true,
        defer: true,
        "data-domain": "laravelvuespa.com",
        src: "https://plausible.io/js/plausible.js",
      },
    ],
  },
  buildModules: ["@nuxtjs/sitemap"],
  sitemap: {
    hostname: process.env.BASE_URL,
    routes() {
      return getRoutes();
    },
  },
});
