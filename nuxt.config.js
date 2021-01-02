import theme from "@nuxt/content-theme-docs";

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
});
