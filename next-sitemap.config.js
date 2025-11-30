/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.SITE_URL ||
    "https://blog-git-main-inwooleemes-projects.vercel.app/",
  generateRobotsTxt: true,
};
