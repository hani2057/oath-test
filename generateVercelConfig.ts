import * as fs from "fs";

const INSTAGRAM_API_BASE_URL = "https://graph.instagram.com/v21.0";
const INSTAGRAM_USER_ID = localStorage.getItem("instagram_user_id");

const vercelConfig = {
  rewrites: [
    {
      source: "/instagram-short",
      destination: "https://api.instagram.com/oauth/access_token",
    },
    {
      source: "/instagram-long",
      destination: "https://graph.instagram.com/access_token",
    },
    {
      source: "/instagram-media-init",
      destination: `${INSTAGRAM_API_BASE_URL}/${INSTAGRAM_USER_ID}/media`,
    },
    {
      source: "/instagram-media-publish",
      destination: `${INSTAGRAM_API_BASE_URL}/${INSTAGRAM_USER_ID}/media_publish`,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};

fs.writeFileSync("vercel.json", JSON.stringify(vercelConfig, null, 2));
