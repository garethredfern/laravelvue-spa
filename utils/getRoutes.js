export default async () => {
  const { $content } = require("@nuxt/content");
  const authentication = await $content("en/authentication")
    .only(["path"])
    .fetch();
  const setup = await $content("en/setup")
    .only(["path"])
    .fetch();
  const en = await $content("en")
    .only(["path"])
    .fetch();

  // Map and concatenate the routes and return the array.
  return []
    .concat(...authentication.map((x) => x.path.substring(3)))
    .concat(...setup.map((x) => x.path.substring(3)))
    .concat(
      ...en.map((x) => x.path.substring(3)).filter((x) => x !== "/index")
    );
};
