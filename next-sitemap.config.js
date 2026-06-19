/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.SITE_URL || "https://inwooleeme.vercel.app",
  generateRobotsTxt: true,
  exclude: [
    "/opengraph-image",
    "/blog/*/opengraph-image",
    "/icon.png",
    "/search-index.json",
    "/feed.xml",
  ],
};
