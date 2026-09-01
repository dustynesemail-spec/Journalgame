# The Lost Helicopter Journal — v0.2.3

[Play the game](https://dustynesemail-spec.github.io/Journalgame/?v=0.2.3-ready)

A cooperative adventure for 1–4 named people sharing a phone, tablet, or computer. All four characters participate; this is pass-and-play, not online multiplayer.

## Animated RPG battles

Every encounter now begins with a territory-specific animated cutscene introducing the enemy, its master or guardian role, story, and unique skill. Select **Engage** to enter an RPG-style third-person battlefield: the four survivors face the villain over a close view of the current island territory. The scene shows the current actor, Hearts, Guard, Weakness, villain skill points, intended target, projectiles, strikes, counterattacks, damage, healing effects, and victory. Enemy-response and reward rules are unchanged.

The stage reuses cached island and character artwork and CSS transforms; it adds no image downloads, animation library, canvas loop, or continuous JavaScript timer. Only one set of survivor portraits is rendered in battle. Scene painting is contained, and decorative map animation pauses while a modal is open. Motion: reduced and the device reduced-motion preference stop all new battle animation while keeping every control and status readable.

## Short battles and victory rewards

All minions and portal bosses now start with **8 skill points (health)**, without later-round health scaling. Existing unfinished battles scale down to the new cap when resumed. Attacks retain their damage and villains keep their unique skills, including healing and shields.

Every new battle win unlocks **three reward choices**. Pick one free item before continuing. Choices and claimed rewards are saved so refreshing cannot reroll or duplicate rewards. This choice replaces the previous random regional bonus; standard Gold, Food, Healing Kit, and ammunition loot still applies. Portal victories also retain their healing and ammo bonuses. Older already-won battles keep their previously granted loot without a second unlock.

## Villain encounters

Each eligible character turn outside the Centre has a 55% encounter chance. After four consecutive quiet eligible turns, the fifth eligible turn guarantees an encounter. Ineligible turns at the Centre or while knocked out do not advance the counter. Reloading never rerolls a checked turn. Journey battles feature minions; main villains appear only after opening the portal.

Enemies respond after **two character combat actions**, or sooner if no standing character remains to act. A dedicated **villain fights back** screen describes the skill, damage, blocks, and status changes. Select **Continue Team Turns** when everyone has read it. The response is saved, so reloading does not repeat damage.

| Journey minion | Master | Skill |
| --- | --- | --- |
| Scratchling | Evil Kitty | Double Scratch: two hits for 1 each |
| Sand Prowler | Evil Kitty | Sand Pounce: 2 damage, ignores 1 Guard |
| Little Gazer | Wall of Eyes | Leeching Glance: 1 damage, restores 2 enemy Hearts |
| Frost Wisp | Wall of Eyes | Ice Shell: 1 damage, then shields itself against 2 damage |
| Watcher Mite | The One Who Watches | Withering Whisper: 1 damage and Weakness; target’s next attack -1 |

Each standing character acts once per battle round. The whole team helps regardless of map position. Journey actions, positions, and the portal countdown pause during battles. Basic attacks need no weapon or ammo. Guard, Armour, healing, and consumables help counter enemy skills.

## Regional loot and Harvest

Every Explore outside the Centre adds a regional supply bundle and 1 Food alongside its main discovery. The first exploration in a weapon’s home region finds that missing weapon. Missing portal parts receive priority every third search after any guaranteed weapon discovery. Minion victories award 1 Gold, 2 Food, 1 Healing Kit, 3 ammo for the journey character’s weapon, and a choice of one unlocked item.

Normal **Gather** randomly selects one regional bundle. The **Hunter’s HARVEST ability** lets you choose a bundle and collects it twice, for 1 journey action, once per turn. A Tool adds one extra bundle. Cancelling spends nothing.

| Region | Available bundles |
| --- | --- |
| Beach | Food ×2, String ×1, Medicinal Herbs, Smoke Bomb, Ammo Pouch |
| Forest | Wood ×2, Food ×2, Arrows ×3, Medicinal Herbs, Antidote |
| Desert | Gold ×2, Stones ×3, Shock Bomb, Fire Flask, Armour |
| Cave | String ×2, Bolts ×3, Shield Pack, Tool, Ammo Pouch |
| Ice | Ice ×2, Cells ×3, Healing Kit, Shield Pack, Smoke Bomb |

Equipment bundles contain one item. Harvest doubles the listed amount; for example, choose 6 Cells or 2 Healing Kits in Ice. There is no harvesting at the Centre.

## Inventory and items

**PACK** has Items, Weapons, and Region Loot tabs. Owned equipment shows its quantity, effect, and a labeled Use button. **ITEM BAG** opens the same owned equipment during a character’s combat turn. Supplies and equipment are shared.

- Healing Kit: heal or revive up to 3 Hearts.
- Medicinal Herbs: heal a standing survivor by up to 2 Hearts.
- Antidote: remove Weakness and heal 1 Heart; cannot revive.
- Shock Bomb: 5 damage.
- Fire Flask: 3 damage, then 2 burn damage before each of the next two enemy responses.
- Smoke Bomb: cancel the next whole enemy response.
- Shield Pack: give a survivor 4 Guard against the next hit.
- Ammo Pouch: add 2 of every ammunition.
- Armour: automatically block one hit after Guard; a second claw can still land.
- Tool: automatically add one bundle to the next Gather or Harvest.

Using an item costs one combat action. Outside battle, healing and ammo pouches cost one journey action; healing targets must share the active character’s region. Battle-only items are clearly marked. Food can restore 1 Heart during combat. The Medic can use Care to heal or revive by 3 instead of attacking.

## Character weapons

| Character | Weapon | Region | Ammo | Effect |
| --- | --- | --- | --- | --- |
| Explorer | Trailbow | Forest | Arrows | 3 damage; mark for +1 on the next attack |
| Hunter | Heavy Slingshot | Desert | Stones | 4 damage |
| Builder | Rivet Launcher | Cave | Bolts | 3 damage and 2 Guard |
| Medic | Spark Staff | Ice | Cells | 2 damage and heal the most injured standing teammate by 1 |

Discovering a weapon supplies 3 ammo and assigns it to its character, whoever found it. Shots consume 1 matching ammo.

## Portal finale

Collect all three parts. At the Centre, **PORTAL → BUILD PORTAL** costs 1 action, 2 Gold, 2 Wood, and 1 String. Opening it immediately summons **Evil Kitty**. Defeat the guardians in order:

1. Evil Kitty — Royal Clawstorm: two hits for 2 each.
2. Wall of Eyes — All-Seeing Drain: 1 damage to each standing survivor and restores 2 enemy Hearts.
3. The One Who Watches — Unmaking: removes its target’s Guard, then deals 2 damage.

After each guardian victory, the portal restores 2 Hearts to every survivor (including revival), adds 2 Healing Kits and 4 of each ammo, in addition to standard victory loot. Return to the portal panel to face the next guardian. Boss progress is saved and rewards cannot be claimed twice.

After all guardians are defeated and all four survivors are standing at the Centre, **ESCAPE TOGETHER** completes the story without an extra action. Everyone still has three journey rounds to reach the Centre after activation; combat does not advance that countdown.

## Saving, movement, and setup

Choose 1–4 names and assign all four characters. Change assignments in Journal. Each character gets three journey actions and one special ability use. Explorer travels twice; Hunter chooses a double Harvest; Builder crafts twice while paying both recipes; Medic heals up to three Hearts. The outer circuit is Beach ↔ Forest ↔ Cave ↔ Ice ↔ Desert ↔ Beach.

One adventure saves in the same browser/device. Continue Adventure preserves items, encounters, enemy responses, and guardian progress. Older saves are supported: a main villain in an old journey battle becomes its minion counterpart while keeping combat progress. An already-completed ending stays completed. Clearing browser data removes the save. Friends remain companions without separate health or usable abilities.

Open the Play link in Safari; local HTML previews may not run the game. Reduced-motion controls are available. Serve index.html, gameplay-v023.js, and assets/ together. GitHub Pages publishes main from the repository root; no build process is required. Older versioned scripts may remain for cached pages.

## Verification

Automated checks cover battle rules, the new RPG scene structure, territory selection, enemy cutscenes, action and response effects, reduced-motion coverage, save migration, rewards, and the complete portal finale. Browser checks exercise the enemy introduction, engagement, hero actions, villain responses, victory, and reward selection.
