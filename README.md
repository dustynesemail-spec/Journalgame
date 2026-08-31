# The Lost Helicopter Journal — v0.1.10

[Play the game](https://dustynesemail-spec.github.io/Journalgame/?v=0.1.7)

A cooperative island adventure for 1–4 people sharing one phone, tablet, or computer. All four characters are always in play.

## Named multiplayer setup
Choose 1, 2, 3, or 4 people, enter names, and assign all four characters. Defaults split characters evenly; assignments can be changed. Every person must control at least one character. Each character keeps its own three-action turn and once-per-turn ability.

Names appear on character tiles, cards, and turn announcements. Consecutive characters controlled by the same person show Keep the device. Use Journal → Players & Character Assignments to make changes without restarting. Names and ownership are saved locally; older saves ask for setup and retain their progress. This is shared-device pass-and-play, not network multiplayer.

## Island circuit and exploration
The outer route is Beach ↔ Forest ↔ Cave ↔ Ice ↔ Desert ↔ Beach. Both directions work; the Centre remains locked until all parts are found. Visible trails and large destination buttons show legal moves.

Exploration zooms into the current terrain and springs the discovery into view. Collect when ready; animation never blocks input. Pending discoveries survive reloads without duplicate rewards.

## Turn-flow fix
- After three actions, the game automatically passes to the next player.
- Pending discoveries, Explorer second moves, and Builder second crafts finish first.
- Animated player handoffs show the turn order, with an always-accessible Start button.
- Existing saves with zero actions continue into the next turn.

## This release
- Gentle clouds, waves, and snow bring the island to life.
- Gathered resources fly toward the supplies counter; healing and crafting have short effects.
- Kitty has a storybook portrait, discovery reveal, and identifying artwork on her owner's card and roster.
- Opening story, player turn announcements, and once-per-turn abilities remain intact.
- Automatic saving offers Continue Adventure after reopening or refreshing. Pending exploration and the second steps of Explorer/Builder abilities are preserved.
- Use Journal to see save status, replay the opening, or start a new adventure with confirmation.
- Motion: reduced stops decorative animation. System reduced-motion settings are respected.

## Saving
One adventure is saved locally on the same browser and device. No account, cloud sync, or server is involved. Clearing browser/site data removes the save. Private browsing or blocked storage may prevent saving; check the Journal message. Older releases did not save progress. Hosting is required; use the Play link, not a phone file preview.

## Game rules
Three actions per player turn. Each special ability is usable once per turn and costs one action. Explorer travels up to two connected regions; Hunter gathers two local materials; Builder crafts up to two items and pays both recipes; Medic restores up to three Hearts to one survivor in the same region. Supplies and items are shared. Friends remain companions without separate health or powers.

## Files and artwork
Serve index.html with the assets folder beside it. GitHub Pages publishes from main at the repository root. No build process or external libraries are required. The original island/player images and Kitty were generated with built-in Imagegen; artwork prompts are included in the downloadable project.
