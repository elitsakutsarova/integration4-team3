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
- figure out the sticker system (users scan the physical QR code stickers and receive a random collectible digital sticker) -> save it in the localStorage if the user doesn't have a profile, and then add it to the table once they create an account
- a user shouldn't get a repeating sticker until they've collected all the available stickers

Notes on Sticker system:
- One QR per place/location, not per digital sticker -> so it can be actually randomized
- All stickers at the same spot share one **locationId**. The “randomness” happens per user when they scan, not per printed sheet.
- All the digital stickers we create should be in the table **digital_stickers** with its id, label, src (path to image in our app). We also need matching entries in public/digitalStickers/manifest.json (UI / diary tray), the actual png/svg files under public/digitalStickers/
- The table is a catalog of possible awards. It does not mean every user gets all 20 — it means the system knows what each ID looks like when assigned.
