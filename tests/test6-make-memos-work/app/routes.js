import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("login", "routes/login.jsx"),
  route("register", "routes/register.jsx"),
  route("collect", "routes/collect.jsx"),
  route("profile", "routes/profile.jsx"),
  route("stickers", "routes/stickers.jsx"),
  route("demo-stickers", "routes/demo-stickers.jsx"),
  route("connect", "routes/connect.jsx"),
  route("diary/:id", "routes/diary.$id.jsx"),
  route("api/stickers", "routes/api.stickers.js"),
];
