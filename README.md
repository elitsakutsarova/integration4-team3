# integration4-team3

## Team 3
- Elitsa - Completer/Finisher, Monitor/Evaluator, Specialist
- Irina - **Project manager**, Coordinator, Implementer, The shaper
- Liviu - Plant, Resorce Investigator, Teamworker
- Renet - Teamworker, Resorce Investigator, Monitor/Evaluator

## Figma Links
FigJam: https://www.figma.com/board/IEKmtM7v4p5qi0Z23wdyeG/Integration4-FigJam?node-id=0-1&t=Nwge7l5S4S5yKP4O-1
Design: https://www.figma.com/design/EqHZaGIVXoGFLQ3pnyekZU/Integration4-Design?node-id=0-1&t=JFDmu4sJO09YME8p-1

## Agreements
sth

first commit

## Test 1 (Make map, add pins to the map)

Add pins to the map with text. Try to add both memory pins and event pins. When you click on them, there should be text and maybe photos.

## Test 2 (Profile page, Travel Diary, Draggable stickers, Sharing feature)

- Create the profile page. 
- Create the Travel Diary
- Create the Draggable stickers menu
- Create the sharing functionality (the user can share the Travel Diary)

## Test 3 (Supabase setup)
- Create a Supabase Users database
- Connect React app to Supabase
- Use Authentification

## Test 4 (Sticker logic)
Figure out the sticker system (users scan the physical QR code stickers and receive a random collectible digital sticker) -> save it in the localStorage if the user doesn't have a profile, and then add it to the table once they create an account
a user shouldn't get a repeating sticker until they've collected all the available stickers
Notes on Sticker system:

One QR per place/location, not per digital sticker -> so it can be actually randomized
All stickers at the same spot share one locationId. The “randomness” happens per user when they scan, not per printed sheet.
All the digital stickers we create should be in the table digital_stickers with its id, label, src (path to image in our app). We also need matching entries in public/digitalStickers/manifest.json (UI / diary tray), the actual png/svg files under public/digitalStickers/
The table is a catalog of possible awards. It does not mean every user gets all 20 — it means the system knows what each ID looks like when assigned.

## Test 5 (Cluster pins at Zoom out)
Create a cluster functionality - once the pins are over a certain number and too close to each other as a location/on the map, when the user zooms out, they should be clustered into 1 big pin

## Optimization + changes -> 10/06/2026

After our consult, I changed a lot of things in test5 like:
- removed unnecessary database tables to simplify the sticker logic -> now there are only three tables; users, digital_stickers and user_collected_stickers. 
- updated all routes to use loaders and actions, and to be generally optimized to the standards of react router v7
- optimized root.jsx
- optimized home.jsx and everything connected to it
- added explanation comments for the map logic
- optimized login.jsx 
- removed confirmation email logic and the option to register with google from login.jsx
- added explanation comments to login.jsx
- optimized register.jsx
- removed auth.callback.jsx since I removed the option to sign in with Google account
- in collect.jsx: replaced claimStatus, claimMessage, and claimTitle with a single call returning status, title and message
- added explanation comments to collect.js
- added duplication check for the collectible stickers
- removed unused resetSupabaseBrowserClient function and added comments for clarity in various utility files tied to collect.jsx
- simplified the upsert logic in collectibleStore.js and added sessionStorage caching utility for scanned stickers
- cleaned up the digital stickers manifest.js and SQL insert statements by removing redundant entries
- refactored comments and imports in CollectedStickersContext, profile, and stickers routes for clarity and organization
- simplified state management in StickersGallery by removing unused state and replacing button with Link for navigation
- removed unused useCallback from demo-stickers.jsx


## Test 6 (Add a memory)
- create a feature that lets the user add memos, and the memos should be saved across different logged user accounts, as well as inside the database
- let users upload media to the memos - photos and videos with 10MB upload constraint
- use OSM (Open Street Map) and  Photon (open Source geocoder for name and address search) built for OSM to let the users pick real spots on the map

## Test 7 (Discover page)

- add discover section -> search, category filters, and sections for Happening Now, Upcoming, and Places, plus “View all” list pages and event/place detail screens
- save / favourites — working heart buttons on map memos and discover items + saved data (Supabase + local guest storage) for memos, events, and places for the user(s)
- profile collections — split into Created Memos (/profile/memos) and Favourites (/profile/favourites/memos, /spots, /events) with tag/category filters and a live count
- persistent map shell — map stays mounted in a main-shell layout while you browse Discover and Profile, so switching tabs does not remount the map
- memo archive at spots — event/place/location detail pages show featured memos and a “View more” link to a full memo archive per location
- map + location safety — event pins on the map tied to discover; memory popup anchored to the clicked pin; location links validated via Photon so only real, in-bounds spots are navigable and users can't create non-existent locations through the url
- auth & routing polish — client auth middleware, protected-route redirects, type-safe path helpers, and a dedicated /api/memos endpoint for publishing (instead of posting to home)

## Test 8 (Security, Settings, Journal) — 13/06/2026

### Security (implemented)

- **Row Level Security (RLS)** — Supabase SQL policies in `tests/test8-security-settings-journal/supabase/` for `users`, `memos`, stickers, saved collections, and memo-media storage. Data scoped per user via `auth_id`; public read where intended (map memos, sticker catalog).
- **Input validation** — Shared `app/utils/validators.js` used in route actions, stores, and forms. Server-side checks for auth (email, password strength, username format, role whitelist), memo creation (quote length, Antwerp bounds, tag whitelist, MIME types), URL display names, favourites IDs, connect room/messages, and search queries.
- **XSS hardening** — User content rendered as React text; map popups use `escapeHtml()`; media/image URLs restricted to safe `http:`/`https:` schemes.
- **URL / open-redirect safety** — Location routes validate OSM params, coords, and Photon lookup; login `redirectTo` limited to same-origin relative paths.
- **API rate limiting** — Per-IP fixed-window limits in `app/utils/rateLimit.server.js`: location search (30/min), stickers (60/min), memo create (10/min). Returns HTTP 429 when exceeded.
- **Secrets hygiene** — No `service_role` or hardcoded keys in source; `.env` / `.env.local` gitignored. Only Supabase publishable/anon key in client (expected; protected by RLS).
- **SQL injection** — All DB access via Supabase client (parameterized queries); no raw SQL in app code.

### Settings page

- Add account details page
- Add option to change password and email -> should reflect in the database
- Add language preference option (demo, not functional) -> eng, fr, nl
- Add privacy toggles page 
- Add a feedback form page (Support & Help) 
- Add confirmation modals for logging out and deleting the user's account
- Add a success modal  for changing the avatar in account details
- Implement server-backed account/feedback actions, and client-side preferences for language, privacy, and avatars

### Test 9:

## Create Journals page:

## A) Journals page
- Create the Journals page ✔️ 
- Implement an empty state for users who haven’t added memos yet ✔️
- If the user clicks on “New Travel Diary” -> create a page “Create Journal” ✔️
- If the user clicks on “Add memos” -> create a page “Add memories”; the top right blue element keeps count ✔️
- Add a warning message when the user tries to leave the page without saving their journal ✔️


## B) Journal page (when an user clicks on a specific journal)

- Create a Journal (overview) page with all the memos the user has created during their (specific) trip -> the stickers should be some default stickers + collected stickers + achievement stickers ✔️
- If the user clicks on “Edit journal” -> create an edit page where the Users can edit the title in real time, add a description, add and remove memos, or choose to delete the journal entirely. They can also delete the description once they have added it. When they add memos, it sends them to the journals page -> Add memories page ✔️
- If the user clicks on “Create recap” -> send them to a “Select memos” page where they can select up to 9 memos. When they click on “Select x memos (out of 9)” -> send them to “Choose recap” page where they can choose between 3 different styles for their recap ✔️
- Implement option to share the recap ✔️
- Show success message when a recap has been successfully shared ✔️

## Test 10:

## Implement guest UX when user has no account:

* No account + user scans a sticker:
- First the user sees the “New sticker unlocked” screen ✔️
- If they click on “View in collection” -> it takes them to screen “Stickers-collection-locked” (they can check the collection and achievement stickers but they are locked) ✔️
- If they click on “Close” it shows them the map (no account map screen) ✔️
- If they click on Profile, it shows them the profile (no account profile screen) ✔️
- If they click on Journal, it shows them the journal page (no account journal page screen) ✔️

## Add sharing (of memos, [journals] -> done, events, spots...)
- Implement option to share an event ✔️
- Implement option to share a spot ✔️
- Implement option to share a location ✔️
- Show success message when an event has been successfully shared ✔️
- Show success message when a spot has been successfully shared ✔️
- Show success message when a location has been successfully shared ✔️
- Implement option to share a memo ✔️
- Show success message when a memo has been successfully shared ✔️
- When the user clicks on the share button on the journal -> it goes to Create recap page ✔️

## Fix search bar

- Add the microphone feature to the search bar
- Implement special screen for “no-results” on search when there are no results ✔️
- In the search bar, show how many results were found (on top) ✔️
- In the event detail page when you click on the detail you can add it to your calendar ✔️


## Test 11 -> Update Profile/Account 
* From now on we are working only in the folder memome_app -> that folder is the one being deployed to Vercel

- Change the Account page to have the design ✔️
- Add featured memos instead of the journal under the collection ✔️
- Implement the empty state for users who haven’t added any memos yet inside the Account page ✔️
- Implement option to share a memo ✔️
- Show success message when a memo has been successfully shared ✔️
- Implement the empty state for users who haven’t added any memos yet inside Created memos ✔️
- Implement the empty state for users who haven’t added any memos/events/spots to Favourites yet ✔️
- Add the correct digital stickers to account stickers ✔️
- Add the correct achievement stickers to account achievement stickers ✔️

## Test 12 -> Update the "Add a memo" form

- Re-design the form ✔️
- Re-design the “Choose location” page ✔️
- Add the microphone feature ✔️
- Show success message when an user successfully posts a memo ✔️
- Add a filter against bad words in the description ✔️
- If the user chooses to edit a memo they’ve created -> create a “Edit memo” page where they can edit the details of the memo. ✔️
- If a user tries to leave the page while editing a memo, send a warning message “Are you sure you want to close this page without saving your edits?” ✔️
- If a user tries to leave the page while posting a memo, send a warning message “Are you sure you want to close this page without saving your edits?” ✔️
- Show a success message when an user successfully edits a memo (same format as the post one) ✔️
- When the guest/no-account user tries to add a memo through the map or clicks the Add memo button from the bottomNav on the map, it doesn’t let them - but if they try to add a memo through the Add memo button from the bottomNav inside Discover, Journals or Profile, it sends them to the add memo form. That’s not correct, from all possible pages they should be navigated to the “Create account or log in to add memories” page either way ✔️

## Test 13 -> Update the "Create account" and "Log in" screen

- Re-design “Create Account page” with the new design ✔️
- Re-design the Log-in-page with the new design
- Let a user reset their password when they click on “Forgot password?”
- When a user request a link, give them a pop up ux message “Link requested successfully” and navigate them/send them to “Reset password” screen
- Once they change/reset their password, they should be sent to a “Success” screen with the button to sign-in which signs them into the web-app
- The user shouldn’t be able to register twice with the same e-mail or username


## Deployment