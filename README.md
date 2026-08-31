# The Lost Helicopter Journal — v0.2.0

[Play the game](https://dustynesemail-spec.github.io/Journalgame/?v=0.2.0-ready)

A cooperative island adventure for 1–4 named people sharing one phone, tablet, or computer. All four characters are always in play. This is shared-device pass-and-play, not online multiplayer.

## Complete the story

The permanent **PORTAL** button shows captured parts and missing supplies. With all three parts, a standing character at the Centre can build the portal for **1 action, 2 Gold, 2 Wood, and 1 String**. Once all four survivors are standing at the Centre, select **ESCAPE TOGETHER** immediately—even with zero actions left. No waiting for another round is needed. If others are still travelling, they have three journey rounds to join the team.

Existing saves at the Centre can reopen the portal panel. The ending includes the whole team and their recruited friends, and the completed story is saved.

## Team battles

At the start of each character's journey turn outside the Centre, there is a 25% chance of meeting an enemy. Exploration can also reveal an enemy. Reloading does not reroll the same turn. Evil Kitty, the Wall of Eyes, and the One Who Watches have different health and damage; the Watcher joins random encounters from journey round four.

All four characters join a separate battle screen regardless of map location. Each standing character takes one combat action, then the enemy attacks its announced target. Map positions and journey actions stay unchanged during combat. Knocked-out characters skip their turns until revived.

- **Basic attack:** 2 damage, no weapon or ammunition required.
- **Weapon attack:** uses 1 matching ammo and applies the character's weapon specialty.
- **Guard:** block up to 2 damage from the next hit.
- **Medic Care:** heal or revive a teammate by up to 3 Hearts; uses the Medic's combat action.
- Defeating an enemy awards 1 Gold, 1 Food, and 2 ammo for the character whose journey turn started the battle. Loot is awarded once, including after a reload.

## Find character weapons

The first exploration in each listed region guarantees its missing weapon. Anyone can find it; it goes to the matching character and includes 3 ammo. Further exploration can uncover ammo caches, equipment, or supplies.

| Character | Weapon | Find in | Ammo | Specialty |
| --- | --- | --- | --- | --- |
| Explorer | Trailbow | Forest | Arrows | 3 damage; mark the enemy for +1 on the next attack |
| Hunter | Heavy Slingshot | Desert | Stones | 4 damage |
| Builder | Rivet Launcher | Cave | Bolts | 3 damage and gain 2 Guard |
| Medic | Spark Staff | Ice | Cells | 2 damage and heal the most injured standing teammate by 1 |

Open **PACK** or a character card to check weapons, ammo, and shared equipment.

## Items and healing

Healing Kits, Shock Bombs, Shield Packs, and ammunition can be found while exploring.

- **Healing Kit:** heal or revive a teammate by up to 3 Hearts. Crafting stores the kit for later. Outside combat, using one costs 1 journey action and requires a teammate in the same region.
- **Food:** restores 1 Heart during battle; cannot revive.
- **Shock Bomb:** 5 damage; craft with 2 Gold and 1 Ice.
- **Shield Pack:** give a standing teammate 4 Guard against the next hit; craft with 1 Wood and 1 Ice.
- **Armour:** automatically blocks one enemy hit after Guard is applied.

Items and healing each use one combat action. New adventures start with one Healing Kit. Existing saves retain their supplies.

## Journey and multiplayer

Choose 1–4 people, enter names, and assign all four characters. Every person controls at least one character. Names appear on cards, turns, and battles. Consecutive characters controlled by the same person show **Keep the device**. Change assignments through **Journal → Players & Character Assignments** without restarting.

Each character has three journey actions and one special ability use per journey turn: Explorer travels up to two connected regions; Hunter gathers two materials; Builder crafts up to two items while paying both recipes; Medic restores up to three Hearts to someone in the same region. Pending second moves, second crafts, and discoveries finish before the automatic handoff.

The outer route is Beach ↔ Forest ↔ Cave ↔ Ice ↔ Desert ↔ Beach, in both directions. The Centre unlocks after all three portal parts are found. Exploration includes terrain close-ups and reward reveals. Friends remain companions without separate health or powers.

## Saving and phones

Open the Play link in Safari or another browser; a downloaded HTML preview may not run the game. One adventure saves locally on the same browser and device. There is no account or cloud sync. Clearing site data removes the save; private browsing or blocked storage may prevent saving. Check save status in the Journal.

Saves include character ownership, pending discoveries, special-ability steps, weapons, ammo, the current combat turn, victory rewards, and the ending. Older saves are supported. Use **Continue Adventure** after refreshing. Motion controls and system reduced-motion preferences are respected.

## Files and verification

Serve **index.html**, **gameplay-v020.js**, and the **assets/** folder together. GitHub Pages publishes from main at the repository root. No build process or external libraries are required. Island, character, and Kitty illustrations were generated with Imagegen; prompts are included in the downloadable project.

Release checks cover portal construction, last-action escape, ending reload, timeout, weapon discovery, ammo, crafting, random encounters, battle order, healing/revival, shields, defeat, save migration, and duplicate-loot prevention. Browser playthroughs exercised a complete battle and both portal-ending paths. Combat balance is an initial version for playtesting.
