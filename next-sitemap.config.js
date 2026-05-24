/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.SITE_URL || "https://inwooleeme.vercel.app",
  generateRobotsTxt: true,
};
