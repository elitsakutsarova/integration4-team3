import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.jsx"),
  route("login", "routes/login.jsx"),
  route("register", "routes/register.jsx"),
  route("discover", "routes/discover.jsx"),
  route("discover/happening-now", "routes/discover.happening-now.jsx"),
  route("discover/upcoming", "routes/discover.upcoming.jsx"),
  route("discover/places", "routes/discover.places.jsx"),
  route("discover/event/:id", "routes/discover.event.$id.jsx"),
  route("discover/place/:id", "routes/discover.place.$id.jsx"),
  route("collect", "routes/collect.jsx"),
  route("profile", "routes/profile.jsx"),
  route("stickers", "routes/stickers.jsx"),
  route("demo-stickers", "routes/demo-stickers.jsx"),
  route("connect", "routes/connect.jsx"),
  route("diary/:id", "routes/diary.$id.jsx"),
  route("location", "routes/location._index.jsx"),
  route("location/:osmType/:osmId", "routes/location.$osmType.$osmId.jsx"),
  route("api/stickers", "routes/api.stickers.js"),
  route("api/location-search", "routes/api.location-search.js"),
];
