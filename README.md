# The Lost Helicopter Journal

Cooperative island adventure — digital prototype v0.1.2.

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

`index.html` includes all game styles and logic. No dependencies or build command are needed. GitHub Pages publishes the `main` branch from `/ (root)` over HTTPS.

## v0.1.2

Adds action instructions, explicit player handoffs (including the first turn), a highlighted active-player label and pawn, and persistent movement guidance. Pop-ups support keyboard focus and prevent actions behind them. Exploration cards must be resolved before continuing. Turn selection skips a player knocked out during the island phase.

Based on the original `lost_helicopter_v011.html` prototype. Existing action costs, recipes, abilities and win conditions are retained.
