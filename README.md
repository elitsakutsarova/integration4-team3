# integration4-team3

# Team 3 - MemoMe
- Elitsa - Completer/Finisher, Monitor/Evaluator, Specialist
- Irina - **Project manager**, Coordinator, Implementer, The shaper
- Liviu - Plant, Resorce Investigator, Teamworker
- Renet - Teamworker, Resorce Investigator, Monitor/Evaluator

## Deployed website: https://memomeantwerp.vercel.app/logged-out

## Figma Links
FigJam w/ process: https://www.figma.com/board/IEKmtM7v4p5qi0Z23wdyeG/Integration4-FigJam?node-id=0-1&t=Nwge7l5S4S5yKP4O-1
Wireframes and Microsite: https://www.figma.com/design/EqHZaGIVXoGFLQ3pnyekZU/Integration4-Design?node-id=0-1&t=JFDmu4sJO09YME8p-1
Marketing Assets: https://www.figma.com/design/agSUYTN2Y7ejtu8fRBVCqh/Integration4_marketingAssets?node-id=0-1&t=rmwax1ImsP9hwb4o-1
App Design (w/ VD process): https://www.figma.com/design/agSUYTN2Y7ejtu8fRBVCqh/Integration4_marketingAssets?node-id=117-579&t=rmwax1ImsP9hwb4o-1
GitHub: https://github.com/elitsakutsarova/integration4-team3

# Tests

## Test 1 (Make map, add pins to the map)

Add pins to the map with text. Try to add both memory pins and event pins. When you click on them, there should be text and maybe photos.

### Description of code changes
I already had the map functionality drafted in html + js. I then used it, this time inside React + React Router v7. In this branch I created two types of pins -> a memory pin and an event/festival pin. When the user clicks on an event pin, a pop up shows above the event pin. When they click on a memory pin, there is a popup in the middle of the page. Then I added the menu for the mobile and constrainted the map only to Antwerp. When the user clicks on the map, it adds a pin with a plus sign on it. When the user clicks on the plus (the pin), it opens a submit form, and then the user can submit/add their own memory pin. The memory pin is not stored yet and it disappears if you refresh the browser.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used a mix of Sonnet 4.6 and Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to implement my html map functionality into React, utilizing React's working flow. I also asked it to help me create two different types of pins and its pop ups based on our UX design wireframes. Then I asked it to add a menu for the mobile and constraint the map to Antwerp. I asked it to add a pin with a plus sign on it when the user clicks on the map, and open a form when the user clicks on the plus (we have the form from our UX design wireframes), and then the user can submit/add their own memory pin.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced a pretty good good output - it pretty much did exactly what I asked it to.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to make some changes to the AI's output -> I removed the tailwind css it was using, and told it to keep the styling responsive going forward. I fixed the lack of padding on the memory pop up and removed the close sign because we don't need it. The pop up is supposed to close when the user clicks off it/on the map. I also fixed the proportions of the pin because they were off.

### Did you learn anything new from the AI's output?

I learnt how to convert pure html, css and js into React with React Router v7.



## Test 2 (Profile page, Travel Diary, Draggable stickers, Sharing feature)

- Create the profile page. 
- Create the Travel Diary
- Create the Draggable stickers menu
- Create the sharing functionality (the user can share the Travel Diary)

### Description of code changes

I created the profile page. There the user can click on the Travel Diary that already exists, and it takes them to the detail page of that travel diary. This is the idea behind it: once your trip in Antwerp has ended and you are out of Antwerp (based on location tracking, but for now we are not taking that criteria into account), the web app automatically creates a Travel Diary with all the memos (memory pins) the user created while they were in Antwerp. The Travel Diary gets created the moment they create their first memo. The user can flip the pages of the diary by clicking on the left or right side of it or dragging it to the left/right. Every page shows one memo. The bottom bar shows the user's stickers - they can drag them to decorate the album and they have an unlimited number of them.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to create the profile page. I also asked it to create the Travel Diary functionality and a "mockup" of the sharing functionality of the Travel Diary. So far it works by downloading the pages as png and you can airdrop them.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produces pretty much what I asked it to, and I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to play around with the way the sharing works, but so far it's not perfect. I also had to tell the AI to use GSAP for the dragging of the stickers because it initially used just java script. And I had to change the way it was handling dropping off the stickers.

### Did you learn anything new from the AI's output?

I learn how to save elements in the localStorage of the browser. I've already used it in the past but I wasn't sure how to implement it here. Now the diary stickers are saved in the browser's localStorage, under the key "memome_sticker_layouts" with its position. This is handled in app/utils/stickerTracker.js. Every time the user drops or moves a sticker, the array for that page is written back to localStorage. On load/refresh, loadPageStickers() reads it back, which is why the positions can "survive" a browser refresh.

## Test 3 (Supabase setup)

- Create a Supabase Users database
- Connect React app to Supabase
- Use Authentification

### Description of code changes

I created a new branch mock-create-account. The idea was to quickly test Supabase - how it works, how to make a table and how to connect it to our react app. So far it works - It logs the account data into Supabase inside Authentification/Users - UID and e-mail. There are still different issues to fix like e-mail authentification, some invalid paths and saving the username. Later I added a confirmation e-mail authentification when creating an account for the first time.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 inside Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me connect the Supabase to our existing test3 React + React Router app folder. I used the official prompt copypasta Supabase provides once you specify the framework you're using (for us that's React Router). I also installed the official Supabase agent AI that uses their documentation.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced a mockup login based on our wireframes, and also helped set the connection between Supabase and our project. I am satisfied with the output, but there is a lot more to work on and small edits to fix and build on.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to fix a few broken/non-existing paths and also copy the correct project URL and API keys from Supabase. At first I got confused and was copying the needed files for Next.js before I realized I need to switch to React-Router.

### Did you learn anything new from the AI's output?

I learnt how to use Supabase, but I still have much more to learn about it.

## Test 4 (Sticker logic)
- Figure out the sticker system (users scan the physical QR code stickers and receive a random collectible digital sticker) -> save it in the localStorage if the user doesn't have a profile, and then add it to the table once they create an account
- A user shouldn't get a repeating sticker until they've collected all the available stickers

Notes on Sticker system:

- One QR per place/location, not per digital sticker -> so it can be actually randomized
- All stickers at the same spot share one locationId. The “randomness” happens per user when they scan, not per printed sheet.
- All the digital stickers we create should be in the table digital_stickers with its id, label, src (path to image in our app). We also need matching entries in public/digitalStickers/manifest.json (UI / diary tray), the actual png/svg files under public/digitalStickers/
- The table is a catalog of possible awards. It does not mean every user gets all 20 — it means the system knows what each ID looks like when assigned.

### Description of code changes

This code defines the sticker system and assigns random stickers from a small pool of stickers to a location. It creates a central sticker API at app/utils/collectibleStore.js. Collected stickers then are added to the travel diary sticker "tray" the user can decorate their diary with. I added a Dev / LAN infrastructure + WebRTC signaling for a more realistic scan testing of the stickers' QR codes and further mobile testing.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked AI to help me make the stickers save properly, the second sticker vanished on refresh, and some QR codes showed “Unknown location.” AI traced that through collectibleStore.js, Supabase SQL, and the collect route.
It added demo locations (Grote Markt, MAS, Central Station), a local fallback when Supabase wasn’t seeded yet, and fixed merge logic so failed DB writes no longer wiped pending claims. I also helped me overall with most of my requirements.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced the WebRTC structure and after a few tweaks and testings, I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to make a few changes to the AI's output -> I had to ask it to change the "Collected stickers" component in the profile to a sticker collection-card with the number of the stickers the user has, and when the user clicks on it, it takes them to a separate page with all their stickers. Then the new QR added stickers weren't being saved to the travel diary and the travel diary tray of stickers + the sharing preview, so I had to fix that. There were some missing path issues I added. After those changes, the default stickers disappeared and I brought them back. I also asked AI to add a QR code for the device sharing, along with the copy urls.

### Did you learn anything new from the AI's output?

I understood the idea behind how the different tables should be connected (logically and technically), but I am still confused by the WebRTC keys and certificates.

## Test 5 (Cluster pins at Zoom out)
- Create a cluster functionality - once the pins are over a certain number and too close to each other as a location/on the map, when the user zooms out, they should be clustered into 1 big pin

### Description of code changes

I created a cluster functionality - once the pins are over a certain number and too close to each other as a location/on the map, when the user zooms out, they get clustered into 1 big pin with the number of smaller pins written on top.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me with the cluster functionality.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI helped me produce the cluster functionality pretty efficiently, I am satisfied with the outcome.

### Did you have to make any changes to the AI's output? If so, what were they?

I only had to change the shape of the cluster from circle to a pin.

### Did you learn anything new from the AI's output?

I learnt how to create clusters on zoom out.

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

### Description of code changes

Removed unnecessary database tables to simplify the sticker logic -> now there are only three tables; users, digital_stickers and user_collected_stickers. I also updated all routes to use loaders and actions, and to be generally optimized to the standards of react router v7. I added explanation comments wherever it was helpful. I removed confirmation email logic and the option to register with google from login.jsx. I added a duplication check for the collectible stickers and removed unused functions. I cleaned up the digital stickers manifest.js and SQL insert statements by removing redundant entries.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

Composer 2.5 in Cursor + Claude.ai for review/testing

### What did you ask the AI to do? Describe or give the prompt you used.

I asked Claude to look through every route page and check if it's over-engineered, or if it can be (safely) optimized/simplified.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

Claude helped me optimize some routes and functions, and helped me find functions that were declared but unused, or weren't needed anymore, so I am satisfied.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to introduce the modern standards of React Router v7, because in the previous tests the AI had used old methods of fetching data (like useEffect).

### Did you learn anything new from the AI's output?

I learnt that I should always test the code AI gives me, I should test task by task instead of letting large code snippets load up and tie together unchecked - and I should check manually if the code is up to most recent standards, and if it's optimized.

## Test 6 (Add a memory)
- create a feature that lets the user add memos, and the memos should be saved across different logged user accounts, as well as inside the database
- let users upload media to the memos - photos and videos with 10MB upload constraint
- use OSM (Open Street Map) and  Photon (open Source geocoder for name and address search) built for OSM to let the users pick real spots on the map

### Description of code changes

I created a feature that lets the user add memos, and the memos can be saved across different logged user accounts, as well as inside the database. The users can upload media to the memos - photos and videos with 10MB upload constraint. I also used OSM (Open Street Map) and Photon to let the users pick real spots on the map to tag their memos with. I also added filtering to the map that filters pins based on the tags the user tagged them with (food, nightlife, etc). I also tried a small design iteration for the homepage just to see how easy the integration of design will be based on wireframes.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked AI to help me save the users' memos in Supabase, and also asked it to research possible open - source APIs I can use to fetch real locations in Antwerp, instead of hard coding them or paying for the Google Maps API.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced satisfactory results, but I had to make certain iterations.

### Did you have to make any changes to the AI's output? If so, what were they?

A few functions in MapView.jsx were using React Router v6 methods and I had to modernize the code, as well as fix and remove some repetitive code. I had to fix some issues with long loading time (6 seconds) when fetching from Nominatim. That's when I researched and saw that it will be better to use Photon Komoot (Photon AI) as a search proxy for the locations. I also had to check if the code was respecting the rules of Open Street Map's fair use policy.

### Did you learn anything new from the AI's output?

I learnt different ways to fetch data from third party open source APIs.

## Test 7 (Discover page)

- add discover section -> search, category filters, and sections for Happening Now, Upcoming, and Places, plus “View all” list pages and event/place detail screens
- save / favourites — working heart buttons on map memos and discover items + saved data (Supabase + local guest storage) for memos, events, and places for the user(s)
- profile collections — split into Created Memos (/profile/memos) and Favourites (/profile/favourites/memos, /spots, /events) with tag/category filters and a live count
- persistent map shell — map stays mounted in a main-shell layout while you browse Discover and Profile, so switching tabs does not remount the map
- memo archive at spots — event/place/location detail pages show featured memos and a “View more” link to a full memo archive per location
- map + location safety — event pins on the map tied to discover; memory popup anchored to the clicked pin; location links validated via Photon so only real, in-bounds spots are navigable and users can't create non-existent locations through the url
- auth & routing polish — client auth middleware, protected-route redirects, type-safe path helpers, and a dedicated /api/memos endpoint for publishing (instead of posting to home)

### Description of code changes

I created the Discover page and added search, category filters, Happening Now, Upcoming, and Places sections, along with dedicated list and detail pages for events and locations. I implemented a full favourites system for memos, events, and places with support for both authenticated users (Supabase) and guests (local storage), reorganized profile collections into separate Created Memos and Favourites sections with filters and live counts, and introduced a persistent map shell so the map remains loaded while navigating the app. I also added memo archives to location pages, improved map interactions with event pins and anchored memory popups, validated locations through Photon geocoding to prevent invalid URLs, and strengthened the app's architecture with authentication middleware, protected routes, type-safe path helpers, and a dedicated API endpoint for publishing memos.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I explained the routing logic to the AI and asked it to help me implement it. With AI I initially tried to use a third party API to fetch data for the events in Antwerp, but all the options needed a paid yearly subscription, so eventually I settled for hard-coded mock databases with data about the events and spots in Discover.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced a pretty good routing system and I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to change a few small issues along the way - some pages were "flashing" in-between navigations, some paths were broken, one action was leading to no-where and broke the memo form at some point so it had to be fixed. I also checked most components before pushing the changes, whether they were up to React Router v7's standards, or whether they needed to be optimized. I cleaned "dead code" and tried to re-factor repetitive functions into utility functions when it made sense to do so.

### Did you learn anything new from the AI's output?

I learnt how to plan routing ahead of time (I didn't realize several pages could be routed through a layout) so I can minimize path issues in the long-run, and how to research third-party API options when I need access to public data. Unfortunately most of them are paid, and often those that open source have limited data, or data that gets updated rarely.

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

### Description of code changes

#### Security 

I implemented row level security through the Supabase SQL policies, and mostly checked which ones were already in places, and which ones were missing. I added input validation through shared functions in the app/utils/validators.js used in route actions, stores, and forms. I added server-side checks for authentification (email, password strength, username format, role whitelist...), memo creation (quote length, Antwerp bounds, tag whitelist...), URL display names, favourites IDs, connect room/messages, and search queries. In order to protect our web against XSS (Cross-Site Scripting), the user content is rendered as React text; map popups use escapeHtml() and media/image URLs are restricted to http:/https: schemes. The location routes validate through OSM (Open Street Map) params, coordinates, and Photon lookup; the login redirectTo was limited to same-origin relative paths. I implemented API rate limiting for location search (30/min), stickers (60/min), memory creation (10/min), which returns error https 429 when exceeded.
I checked whether there the "service_role" or any private API keys were hard-coded in on the client side code, whether the ".env" and ".env.local" were actually gitignored. I made sure only Supabase publishable/anon keys are in the client-side code, but that's expected browser behavior protected by RLS. All the database accessing is done via Supabase client (parameterized queries), no raw SQL in app code to prevent SQL injections.

#### Settings page

- Settings page
- Added an account details page
- Added option to change password and email -> should reflect in the database
- Added language preference option (demo, not functional) -> eng, fr, nl
- Added privacy toggles page
- Added a feedback form page (Support & Help)
- Added confirmation modals for logging out and deleting the user's account
- Added a success modal for changing the avatar in account details
- Implemented server-backed account/feedback actions, and client-side preferences for language, privacy, and avatars

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 and Sonnet 4.6 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

Initially I asked the AI to help me look for security vulnerabilities in the code (to basically run an audit), and help me implement fixes in the security gaps. I also asked it to explain to me how to implement the Supabase RLS in the most efficient way after I checked the Supabase advisors and saw the warnings and risks it had found in our database. When I was half-way done with the features, I asked Sonnet 4.6 to analyze my utility functions for over-engineering, logic gaps, anti-DRY patterns or anti-React Router v7 patterns. I implemented the fixes and changes it suggested to me.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced a lot of very helpful code, and I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to make some changes here and there. After adding API rate limits, there were some issues with logging in or submitting some of the forms (especially the "add a memo" form was very problematic due to earlier adding strict rate limits on the Photon locations fetcher/lookup), but I fixed it. I also had to fix different design issues, but there is still a lot more to be fixed, changed or iterated. There was a lot of outdated code that needed to be removed and repetitive code that had to be split into re-usable utility helper functions. I also had issues with the password and email changing - with the validation and submitting the form. At some point the server was changing the password/email, but the client side wasn't syncing in at the same time ( the app signs in through the browser Supabase client) and the user wouldn't be able to log-in with the new password/email because the browser/cookies weren't in sync. I ended up fixing that by making the updates run in the browser via a clientAction through the authStore (same path as login basically), so the Supabase session cookies would update correctly.

### Did you learn anything new from the AI's output?

I learnt the work-flow/steps to validating, sanitizing and protecting a website, how to authorize different actions (the users shouldn't see other users' data), as well as the steps to (safely) allow a user to change their log-in credentials.

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

### Description of code changes 

I built the Journals page and everything connected to it - journal overview (/diary/:id), added the sticker dock, a page to edit the journal, a feature that lets you share the journal, a recap flow with a template that shows specific memos from the journal the users have selected, together with success messages at successful sharing.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me translate recap layouts, share sheet and the success popups from Figma to code via the Figma MCP (there will be design re-touches later in the development stage, now we are focusing on the app foundation). AI (specifically Sonnet 4.6) helped me debug an issue I had with the QR link ( we had a auth middleware, LAN networking, Supabase 400s errors) and recap bugs (preview vs export mismatch, wrong memos in grid). It helped me iterate the design and functionality of the page much faster - it helped me implement the carousel UX, direct download, and public /collect route without re-writing unrelated journal code.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced a lot of working code and I am fairly satisfied with the output, but it needed a lot of editing and re-touching.

### Did you have to make any changes to the AI's output? If so, what were they?

I made a lot of design changes because the AI is pretty bad at css. There were also certain gaps in the entire journal logic that I had to fix.

### Did you learn anything new from the AI's output?

I learnt that preview and export should share one code path, otherwise the preview and the downloaded PNG will drift apart, so you need to generate real pngs for the carousel. I found out dev networking is very problematic - keeping track of the VITE_APP_ORIGIN, self-signed HTTPS, and Wi‑Fi isolation can all affect the mobile QR testing which was an issue I was fighting for a while. I am still working on producing good React Router v7 patterns - client loaders, route-level states, and keeping selection order when building the recap was a good exercise.

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

### Description of code changes 

I added different page screens for guest users/users who don't have an account; it's meant for the users who scan the physical sticker and go on the web app through the link. The pages offer limited access to the web app, with consistent calls to action to create an account or log-in to unlock more features.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me implement the designs quickly (because the overall logic was already in place), using the Figma MCP to code feature.

### Outcome/findings

What did the AI produce? Were you satisfied with the output?
The AI produced good results, and I am satisfied.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to fix the css and responsiveness in some of the pages. There was also an initial problem with navigation and if conditionals that had to be fixed (the guests kept being sent to the normal profile page).

### Did you learn anything new from the AI's output?

I learnt that you can re-use the same app shell and routes with different data sources in order to offer different experiences to different users (guests vs logged in users).

# Working on final app code files

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

### Description of code changes 

I updated several things in the Account page - I implemented the foundation of our design system, added featured memos under the collections, implementede empty states for users who haven’t added any memos, or anything to Favourites, and also added the option to share a memo, together with a success message. Then I added the correct (final) version of the digital stickers and achievement stickers inside Stickers.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 inside Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to implement the design via the Figma MCP and asked it to apply the empty state reusable component when it was needed.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced the necessary design and structural changes I asked it to produce, I am satisfied with the outcome.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to change some of the css because it wasn't fully optimized, and I also had to explain the criteria for receiving the different achievement stickers.

### Did you learn anything new from the AI's output?

I learnt that the different achievement stickers criteria logic works best as pure functions over a context object, not as scattered if statements in components, which makes bugs easier to fix.

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

### Description of code changes 

I re-designed the Add-memo form and the location picker page within it. I made the microphone feature functional (on both Android and iOS). I created an Edit memo page where the user can edit a memo they've already created, and added success messages when the user successfully posts or edits a memo, as well as warning messages against leaving the page/form in the middle of posting or editing a memo. I also added a profanity filter in the description of the add-memo form. Finally, I fixed an issue where a guest user had free access to add a memo through the bottom navigation menu, which is incorrect for our logic flow.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me implement our new Add memo form design through the Figma MCP - I also needed some help with the microphone feature and the profanity filter.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced the functionalities and routes I asked it to produced, I am pretty satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I caught layout, scroll (in the form) and media UX issues, which I fixed. I also had to add a specific query in Supabase to make a table permit data editing and migration.

### Did you learn anything new from the AI's output?

I realized that the guest blocking on the map (GuestAddMemoLocked) was not enough since the BottomNav is shared across layouts, so gating has to be centralized. Basically, every entry point to a feature needs the same auth check, not just the primary screen. I also learnt that there are specific desktop and mobile differences when it comes to speech recognition and rapid API calls - especially on iPhone.

## Test 13 -> Update the "Create account" and "Log in" screen

- Re-design “Create Account page” with the new design ✔️
- Re-design the Log-in-page with the new design ✔️
- Let a user reset their password when they click on “Forgot password?” ✔️
- When a user request a link, give them a pop up ux message “Link requested successfully” and navigate them/send them to “Reset password” screen ✔️
- Once they change/reset their password, they should be sent to a “Success” screen with the button to sign-in which signs them into the web-app ✔️
- The user shouldn’t be able to register twice with the same e-mail or username ✔️

### Description of code changes 

I re-designed the “Create Account" page and the Log-in page. Then I added an option on the log in screen to let the user reset their password when they click on “Forgot password?”. I added a pop up message “Link requested successfully” when the user requests a link for password reset (but the link/confirmation itself is mocked, we don't have a system for confirming e-mails). I also added “success” screen when the user resets their password successfully.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me implement the 2 new styles, and to debug some errors with the updating of the password at the reset.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI did a good job at implementing the design (although the two screens weren't too complicated), but it got very confused during the reset password logic and created a lot of bugs and logic gaps.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to fix a navigation issue that was causing the user to be sent to the log-in screen after a successful "password reset", but in reality the password wasn't updated at all.

### Did you learn anything new from the AI's output?

I learnt that login errors are a product problem, not just an API problem. After a long time of trying to fix the reset password bug, I found out that the working flow is 1. form posts to same route (/reset-password), 2. clientAction validates → return serverAction(), 3. server admin update + canSignInWithPassword verify, 4. clearBrowserAuthSession() before login. The password reset in production needs the service role (or a proper email token flow, but we decided against using e-mail/google email confirmations), not only anon client.

## Test 14 -> Onboarding

- Implement Onboarding Screen 1 + micro-animations ✔️
- Implement Onboarding Screen 2 + micro-animations ✔️
- Implement Onboarding Screen 3 + micro-animations ✔️

### Description of code changes 

In this branch I will add and apply styles to the three screens of the our Onboarding process.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to recreate our Figma designs through the Figma MCP.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI laid the foundation for our Onboarding design.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to manually fix most of the css, because our Onboarding design is very decorative and contains small loose/non-structural elements.

### Did you learn anything new from the AI's output?

Not really, because this branch is mostly focused on design/css.

## Test 15 -> Homepage - improve/fix design

- Add the missing tags in Homepage ✔️
- After the user posts a memo, they should be taken (zoomed into) their memo on the map ✔️
- Fix design -> memos, events, icons… ✔️
- Live event card always opens the first time you launch app - it shouldn’t; fix it ✔️
- The users who are already logged in and keep scanning QR codes -> the stickers should show up on the Map (like the guest ones, but without the create account CTA) ✔️
- show a success message when an user successfully adds a memo to favourites ✔️

### Description of code changes 

In this branch I was focusing on fixing the design of the homepage and getting it as close as possible to our original wireframes. In short, I added the missing tags in the homepage, fixed the design of the memos, events and sticker symbols, and of their pop ups. I stopped the live event card popup from always opening the first time the user opens the web app. I also fixed the inconsistent screen showing the map with a received sticker after scanning - the screen was different for guests and logged-in users, now it's the same. And I also added a success message when the user successfully adds a memo from the map to their favourites.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I used the AI for several things on this branch, like to help polish the homepage design (mostly using the Figma MCP),
point me out to where I can update the missing tags on the homepage, add and re-design the “memo hearted” success message on the map, and to help me find a way to add the web app to the home screen of the user - but that idea was later abandoned due to browser resctrictions. I also needed some help with fixing the guest user map flow.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

It produced for the design foundations for the memos, events, success message and other pop ups, so I am fairly satisfied.

### The AI produced

### Did you have to make any changes to the AI's output? If so, what were they?

I had to fix several things - during the process of adding the "Add to home screen" feature, I had to fix a broken export and remove a navigator.share(). I also needed to fix some bugs that arised while working on the map, and I also had to fix the css in some places.

### Did you learn anything new from the AI's output?

I learnt that iOS doesn’t allow true “one tap add to home screen” from a web app, only Safari’s share system can. Chrome on iPhone can’t install progressive web apps the same way. I also found our navigator.share() is not the same as Add to Home Screen, it just opens a generic share sheet.

## Test 16 -> Profile - improve/fix issues + design
- Memos/events/places can be added to favourites even if the user is not logged in - they shouldn’t be able to ✔️
- Implement the right screen for when the user logs out ✔️
- You can’t log in with username (even though it says you can) -> fix it ✔️
- Make design fit the wireframe for guest profile ✔️
- Fix profile created memos -> should look like the wireframes (same as map ones) ✔️
- Fix favourites/memos -> should look like the wireframes (same as map ones) ✔️

### Description of code changes 

In this branch I was mostly fixing stuff in the profile. I made it so a guest user can't favourite/save memos, events or places. II implemented the right screen for when the user logs out. I fixed a bug where the user couldn't log in with username, only with e-mail, and I also fixed the design of the profile for the guest flow. I fixed the created memos and the favourites/memos pages inside the profile.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me implement our Figma designs, and also to help me fix the bugs.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced good code and css this time, I am satisfied.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to fix some of the css.

### Did you learn anything new from the AI's output?

In this branch, not really.

## Test 17 -> Stickers - improve/fix issues + design
- If the user is a guest, do not show sticker counter ✔️
- Fix wrong sticker counter logic ✔️
- Add 5 basic stickers so that the user can decorate the diary straight away ✔️
- Make design fit the wireframes ✔️

### Description of code changes 

I improved and re-designed the code in the stickers' pages, both for a logged-in user and a guest. I removed the sticker counter for guests, and fixed the wrong sticker counter calculation logic. I added initial basic stickers to the sticker collection every user gets upon signing in, and overall made the design of the stickers' pages resemble our original wireframes more closely.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me turn the wireframes into design via the Figma MCP.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced most of the design changes, I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to change some of the css, because some things were off, or used positioning over a flexbox or grid.

### Did you learn anything new from the AI's output?

In this branch, not really - since it was mostly working with css.

## Test 18 -> Log-in improvement
- Add terms & privacy policy page (both links lead to one page) ✔️

## Test 19 -> Fix search bar(s):
- When a guest types in the search bar in the Homepage and Discover, they get redirected to the log-in page -> fix ✔️
- If the user doesn’t allow microphone, the browser should ask for permission every time, and if the access is denied, the user should get a popup that they need to allow microphone access ✔️
- When the user clicks on the suggested search words (Festival, Grote Market… etc), on the spot it shows “0 results found” until they type in more words or an empty space, it doesn’t immediately filter the search -> fix it ✔️
- When the user stops speaking to the microphone, the microphone should automatically stop and already start filtering/showing results, instead of the user having to click on the microphone again ✔️
- Add “Use current position” button on the add-memo location search ✔️

### Description of code changes 

I fixed some bugs and issues happening in the search bars across the app. When a guest types in the search bar in the Homepage and Discover, they'd get redirected to the log-in page, so I fixed that. I added a popup that tells the user they need to allow microphone access if they want to use the microphone to search. When the user clicked on a suggested search word(Festival, Grote Market… etc), or typed something in the search bar, on the spot it'd show “0 results found” until they typed in more words or an empty space, so I made it filter the search results immediately. I also fixed the microphone search to automatically stop and start filtering/showing results when the user stops talking instead of the user having to click on the microphone again.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me fix the bugs/issues.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI helped me fix most of the issues on the first try.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to make sure one of the implemented solutions AI used was up to React Router v7 standards - it was using useEffect instead of a fetcher state with an API query (for the location search in Add-memo), so I had to fix that.

### Did you learn anything new from the AI's output?

For “loading / empty / results”, (for the search bar) it's best to compute from (query, fetcher.state, fetcher.data, etc) instead of toggling extra boolean state in effects. Also user typing "enough to search” doesn't mean that the search is finished, and mixing those causes was causing flashe of wrong empty states.

## Test 20 -> fixed issues in Add a memo
- Add memo back button always takes you to map page, not the page you came from -> fix that ✔️
- There should already be a default tag selected when the form is open to avoid an error ✔️
- In choose location, the map should always be visible ✔️
- When clicking on map to add memo, the form opens and the user has to manually choose a location - make it so the map already has their coordinates, and the user can choose to change them if they want ✔️
- You can’t add video from “Open camera” on laptop and overall can’t add video on phone -> fix it ✔️

### Description of code changes 

I fixed some issues in the Add memo form. The back button in "Add memo" back aways took the user to the map page, now it takes them to the actual page they came from. I added a default selected tag to the form to avoid an error. Now in "Choose location" the map is always visible, unless the user clicks on the search bar. When the user clicks on the map to add memo, when the form opens, the map now has their coordinates already, and the user can choose to change them if they want. I also fixed an issue where the user wasn't able to add video from “Open camera” on laptop and overall couldn’t add video on phone.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me fix the bugs/issues in the Add memo form.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced a lot of good solutions to my issues, so I am satisfied.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to fix some css issues, and also make the search results visible, design-wise.

### Did you learn anything new from the AI's output?

I learnt that fonts that work on desktop can fail silently on mobile. For example, memo-form-title used Antwerpen via global h2 styles, but the Antwerpen font didn't have a @font-face in the global.css, which worked fine my machine with the font installed, but broken on my phone.

## Test 21 -> Settings page
- Add the FAQs page before the Feedback form ✔️

### Description of code changes 

I added the FAQs page before the Feedback form in Settings.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to turn our wireframe to code.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI created a very similar design to the original, so I am satisfied.

### Did you have to make any changes to the AI's output? If so, what were they?

No, this wireframe was fairly to design.

### Did you learn anything new from the AI's output?

Not really.

## Test 22 -> Discover page
- When a guest tries to add something to favourites, they should get a popup that they need an account for that ✔️

### Description of code changes 

When a guest tries to add something to favourites, they should get a popup that says they need an account in order to do that, so I added it.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to re-use the warning modal component we already had.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI re-used the component, I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

No, I didn't.

### Did you learn anything new from the AI's output?

In this case, not really.

## Test 23 -> Fix problems globally
- add alts to images ✔️
- add visually hidden titles to sections for semantic purposes ✔️
- make all px into rem ✔️
- check for buttons that are supposed to be links styled as buttons instead ✔️
- fix journal -> create recap -> select memos page ✔️
- fix useEffect hooks
- When the user clicks on an event on the map, it should center it in the viewpoint

### Description of code changes 

In this branch I tried to fix some global issues. I added alts to images and visually hidden titles to sections. I turned all the px values into rem. I checked for buttons that are supposed to be links styled as buttons instead, and changed the necessary ones. I fixed the select memos page journal -> create recap -> select memos page and add memos. I fixed problematic design and functionalities in journal, create recap, select memos and add memos pages.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me implement the changes, because some of them were quite tedious and repetitive. I also asked it to help me implement some of the design changes to the Journal/s pages.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced the changes I wanted, and I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to change some of the css.

### Did you learn anything new from the AI's output?

I learnt that I should always double-check the semantics and the overall html patterns, because sometimes AI follows outdated standards.

## Test 24 -> Desktop design
- Homepage ✔️
- Discover ✔️
- Journals ✔️
- Profile ✔️

# Fixes Test 24:

1. Make the guest flow responsive:
- Fix journal height ✔️
- Profile -> CTA should go to bottom ✔️
- Make Add-memo page responsive ✔️
- Make it so the user can navigate from Add-memo ✔️

2. General
- FAQs -> make all the drop-downs have the same font size/style ✔️
- When the user clicks on the map, it should only place the pin on the map, and the user should have to click a second time to open the add-memo form ✔️
- Make the pin the same style as the other pins ✔️

### Description of code changes

I designed the homepage for desktop. I made all the pages responsive for desktop. In this branch I also made the guest flow responsive - I fixed the journal height, the CTA height in the Profile, made the Add-memo guest page responsive and made it so the user can navigate from Add-memo to the other nav pages. When it comes to general bugs, in the settings in the FAQs I made all the drop-downs have the same font size. When the user clicks on the map, I made it so the user would hve to click a second time to open the add-memo form, and I made the pin the same style as the other pins on the map.

### Use of AI in this PR

### Prompt

### What tool/model did you use?

I used Composer 2.5 in Cursor.

### What did you ask the AI to do? Describe or give the prompt you used.

I asked the AI to help me implement the design via the Figma MCP.

### Outcome/findings

### What did the AI produce? Were you satisfied with the output?

The AI produced very good results, I am satisfied with the output.

### Did you have to make any changes to the AI's output? If so, what were they?

I had to change some of the css.

### Did you learn anything new from the AI's output?

No, it's mostly css.


# Last fixes Test 25:
- Make success messages disappear after 1.5 seconds ✔️
- fix browser errors and warnings ✔️
- fix unnessecary useEffect cases ✔️
- added warning for no java script users ✔️

# CSS

In the beginning, Figma MCP was used for initial designing. The code was not great, but was an ok start, just to not have to start from plain html. When styling the pages, I just looked at our final designs and recreated them as best as possible, using good practices for responsiveness and resizeability.

## Deployment

We used vercel to deploy. Here is the link: https://memomeantwerp.vercel.app/logged-out
