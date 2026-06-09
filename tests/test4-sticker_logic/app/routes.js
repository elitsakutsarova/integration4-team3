import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("login", "routes/login.jsx"),
  route("register", "routes/register.jsx"),
  route("auth/callback", "routes/auth.callback.jsx"),
  route("collect/:locationId", "routes/collect.$locationId.jsx"),
  route("profile", "routes/profile.jsx"),
  route("stickers", "routes/stickers.jsx"),
  route("connect", "routes/connect.jsx"),
  route("diary/:id", "routes/diary.$id.jsx"),
  route("api/stickers", "routes/api.stickers.js"),
];
