import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("profile", "routes/profile.jsx"),
  route("diary/:id", "routes/diary.$id.jsx"),
];
