# The Lost Helicopter Journal

Cooperative island adventure — digital prototype v0.1.5.

## Play

[Play the game](https://dustynesemail-spec.github.io/Journalgame/) in Safari or another modern browser. No download or installation is needed.

- Pass the device when the large player announcement appears. The next player taps START TURN when ready.
- Each turn gives three actions. Action pop-ups explain what to do and the cost before you continue. Going back spends nothing.
- Tap MOVE, read the guide, then choose a region marked MOVE. A reminder stays above the map while choosing.
- Explore, gather supplies, craft equipment, help teammates and check the Journal.
- Find all three Teleporter parts, build at the Centre, and bring everyone there for the final escape.
- END TURN asks for confirmation and warns when actions remain.
- Refreshing starts a new game; progress is not saved between sessions.

## Hosting

`index.html` includes all game styles and logic; the `assets/` folder contains the five illustrations. No dependencies or build command are needed. GitHub Pages publishes the `main` branch from `/ (root)` over HTTPS.

## v0.1.2

Adds action instructions, explicit player handoffs (including the first turn), a highlighted active-player label and pawn, and persistent movement guidance. Pop-ups support keyboard focus and prevent actions behind them. Exploration cards must be resolved before continuing. Turn selection skips a player knocked out during the island phase.

Based on the original `lost_helicopter_v011.html` prototype. Existing action costs, recipes, abilities and win conditions are retained.

## v0.1.3

Friends now introduce themselves with a description card and belong to the player who discovers them. Kitty (🐱), Fred (🎨), and Bla Bla (💜) appear beneath their owner in the player row. Repeat discoveries keep the original owner and do not add duplicates.

Tap a player name to view health, location, status, actions, ability, eye marks, current friends, and shared items and supplies. Friends have no separate health or usable abilities yet; inventory remains shared. The phone layout keeps the map and controls onscreen.

## v0.1.4 — Special abilities

Each player can use their special ability once on their turn, spending 1 of their 3 actions. The button shows ABILITY USED after success and resets on that player's next turn. Cancelling before the first successful step costs nothing.

- Explorer — TRAILBLAZE: move through up to two connected regions for 1 action. The second step is free; stopping after the first step does not refund the action.
- Hunter (formerly Scavenger) — HUNT: gather 2 local materials. A Tool still adds one extra and is consumed. Normal Gather collects 1, with no random Hunter bonus.
- Builder — DOUBLE CRAFT: craft up to two items for 1 action, paying the material cost of each. The second item costs no extra action, including when the first used the final action. May finish after one item.
- Medic — CARE: choose self or one teammate in the same region and restore up to 3 Hearts, capped at 5. Can rescue a knocked-out survivor with 3 Hearts. No valid target means no cost.

Normal movement, crafting and Help remain available as separate actions. Updated guides and player cards describe the new abilities.

## v0.1.5 — First illustrated release

- Illustrated island based on Rouge's original map geography, with tappable HTML region labels.
- Four illustrated player pieces slide between regions. Tap a piece or player name to open their card.
- Matching portraits on player cards and turn announcements.
- Brief card entrances, resource/healing feedback, and an active-portal glow.
- Motion: reduced disables decorative and movement animations; the system reduced-motion preference is respected.
- The board scales as a square without cropping; gameplay, friend ownership and once-per-turn abilities are retained.

First artwork download is approximately 7.3 MB. No videos or external image host are used. Friend and monster artwork remains a later pass; their current indicators still work.
