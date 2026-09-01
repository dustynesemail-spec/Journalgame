"use strict";
// Battle turns are independent of journey actions and never move map pieces.
const weaponBook=[
 {name:"Trailbow",icon:"🏹",ammo:"Arrows",region:"Forest",damage:3,detail:"3 damage; mark the enemy so the next attack deals +1."},
 {name:"Heavy Slingshot",icon:"🪨",ammo:"Stones",region:"Desert",damage:4,detail:"4 damage with a carefully aimed shot."},
 {name:"Rivet Launcher",icon:"🔧",ammo:"Bolts",region:"Cave",damage:3,detail:"3 damage and gain 2 Guard for your next incoming hit."},
 {name:"Spark Staff",icon:"✨",ammo:"Cells",region:"Ice",damage:2,detail:"2 damage and restore 1 Heart to the most injured living teammate."}
];
const enemyBook={
 Scratchling:{name:'Scratchling',icon:'🐾',hp:8,damage:1,skill:'Double Scratch',story:'A scrappy minion of Evil Kitty. Two quick scratches strike the announced survivor.'},
 Gazer:{name:'Little Gazer',icon:'🧿',hp:8,damage:1,skill:'Leeching Glance',story:'A loose eye from the Wall of Eyes. It hurts a survivor and restores 2 of its own Hearts.'},
 Mite:{name:'Watcher Mite',icon:'🕷️',hp:8,damage:1,skill:'Withering Whisper',story:'A tiny scout of the One Who Watches. Its target’s next attack deals 1 less damage.'},
 SandProwler:{name:'Sand Prowler',icon:'🐈‍⬛',hp:8,damage:2,skill:'Sand Pounce',story:'Evil Kitty’s desert scout ignores 1 point of Guard when it pounces.'},
 FrostWisp:{name:'Frost Wisp',icon:'❄️',hp:8,damage:1,skill:'Ice Shell',story:'A frozen servant of the Wall of Eyes. After attacking, it shields itself against 2 damage.'},
 EvilKitty:{name:'Evil Kitty',icon:'🐈',hp:8,damage:2,boss:true,skill:'Royal Clawstorm',story:'The first portal guardian sends her minions across the island. She strikes twice, for 2 damage each.'},
 Eyes:{name:'Wall of Eyes',icon:'👁',hp:8,damage:1,boss:true,skill:'All-Seeing Drain',story:'The second portal guardian attacks every standing survivor and restores 2 of its own Hearts.'},
 Watcher:{name:'The One Who Watches',icon:'👁️',hp:8,damage:2,boss:true,skill:'Unmaking',story:'The final portal guardian removes its target’s Guard before striking for 2 damage.'}
};
const portalBosses=['EvilKitty','Eyes','Watcher'];
let journey={quietTurns:0,searches:0,bosses:[]};
let battleFx=null;
let gear={weapons:[false,false,false,false],ammo:{Arrows:0,Stones:0,Bolts:0,Cells:0}};
let battle=null,encounterStamp="",battlesWon=0;
function initCombatContent(){
 for(const name of Object.keys(itemBook))inventory[name]??=0;
 weaponBook.forEach((weapon,i)=>{
  exploration.push([weapon.name,()=>findWeapon(i)]);
  discoveryPresentation.push([weapon.icon,"Character weapon",weapon.name+" belongs to the "+roleNames[i]+". Includes 3 "+weapon.ammo+".","COLLECT WEAPON"]);
 });
 weaponBook.forEach(weapon=>{
  exploration.push([weapon.ammo+" Cache",()=>gainAmmo(weapon.ammo,3)]);
  discoveryPresentation.push(["🎒","+3 "+weapon.ammo,"Ammunition for the "+weapon.name+".","COLLECT AMMO"]);
 });
 for(const [name,icon,copy] of [["Healing Kit","🩹","Restore 3 Hearts to a teammate, including a knocked-out survivor."],["Shock Bomb","💥","Deal 5 damage to an enemy. Uses your combat action."],["Shield Pack","🛡️","Give a teammate 4 Guard against their next hit."]]){
  exploration.push([name,()=>{inventory[name]++;discoveries.add(name);toast(name+" added to the shared pack.");}]);
  discoveryPresentation.push([icon,"Battle item",copy,"COLLECT ITEM"]);
 }
 exploration[9]=['Little Gazer',()=>startBattle('Gazer')];exploration[10]=['Scratchling',()=>startBattle('Scratchling')];
 discoveryPresentation[9]=['🧿','Journey minion',enemyBook.Gazer.story,'FACE MINION'];discoveryPresentation[10]=['🐾','Journey minion',enemyBook.Scratchling.story,'FACE MINION'];
 for(const name of ['Medicinal Herbs','Antidote','Fire Flask','Smoke Bomb','Ammo Pouch']){
  exploration.push([name,()=>awardSupply(name,1)]);discoveryPresentation.push([itemBook[name].icon,'Useful equipment',itemBook[name].detail,'COLLECT ITEM']);
 }
 recipes.push({name:'Fire Flask',cost:{Wood:1,Gold:1},desc:itemBook['Fire Flask'].detail},{name:'Smoke Bomb',cost:{Food:1,Ice:1},desc:itemBook['Smoke Bomb'].detail});
 recipes.push({name:"Shock Bomb",cost:{Gold:2,Ice:1},desc:"Keep in the pack. Deal 5 damage in battle."},{name:"Shield Pack",cost:{Wood:1,Ice:1},desc:"Keep in the pack. Give a teammate 4 Guard in battle."});
}
function findWeapon(i){
 const weapon=weaponBook[i],already=gear.weapons[i];gear.weapons[i]=true;
 gear.ammo[weapon.ammo]+=3;discoveries.add(weapon.name);
 toast((already?"Extra ammunition: ":roleNames[i]+" found "+weapon.name+"! ")+"+3 "+weapon.ammo);
}
function gainAmmo(kind,n){gear.ammo[kind]+=n;toast("Team found "+n+" "+kind+".");}
function rollExploration(){
 const localWeapon=weaponBook.findIndex(w=>w.region===players[active].loc);
 journey.searches++;
 if(localWeapon>=0&&!gear.weapons[localWeapon])return 16+localWeapon;
 const missing=['Core','Crystal','Ring'].map((k,i)=>parts[k]?null:11+i).filter(i=>i!==null);
 if(missing.length&&(journey.searches%3===0||Math.random()<.3))return missing[Math.floor(Math.random()*missing.length)];
 const loot=regionalLoot[players[active].loc]||regionalLoot.Beach;
 const name=loot[Math.floor(Math.random()*loot.length)].name;
 const itemIndex=exploration.findIndex(x=>x[0]===name||x[0]===name+' Cache');
 const friends=[6,7,8].filter(i=>!recruited[exploration[i][0]]);
 if(friends.length&&Math.random()<.15)return friends[Math.floor(Math.random()*friends.length)];
 return itemIndex>=16?itemIndex:24;
}
function validCombatSave(s){
 const num=(n,max=100000)=>Number.isInteger(n)&&n>=0&&n<=max;
 if(s.journey!==undefined&&(!s.journey||!num(s.journey.quietTurns,4)||!num(s.journey.searches)||!Array.isArray(s.journey.bosses)||s.journey.bosses.length>3||!s.journey.bosses.every((key,i)=>key===portalBosses[i])))return false;
 if(s.battle&&s.battle.weakness!==undefined&&(!Array.isArray(s.battle.weakness)||s.battle.weakness.length!==4||!s.battle.weakness.every(n=>num(n,1))||!num(s.battle.enemyGuard,2)||!num(s.battle.burn,2)||!num(s.battle.smoke,1)||!num(s.battle.sinceEnemy,2)||(s.battle.nextTurn!==null&&!num(s.battle.nextTurn,3))||typeof s.battle.lastMove!=='string'||s.battle.lastMove.length>1500))return false;
 if(s.battle?.reward!=null){
  const reward=s.battle.reward;
  if(s.battle.phase!=='won'||typeof reward.claimed!=='boolean'||!Array.isArray(reward.choices)||reward.choices.length!==3||new Set(reward.choices).size!==3||!reward.choices.every(k=>Object.hasOwn(itemBook,k))||(reward.claimed?!reward.choices.includes(reward.selected):reward.selected!==null))return false;
 }
 if(s.gear===undefined)return s.battle==null;
 const g=s.gear;
 if(!g||!Array.isArray(g.weapons)||g.weapons.length!==4||!g.weapons.every(x=>typeof x==="boolean")||!g.ammo||!weaponBook.every(w=>num(g.ammo[w.ammo])))return false;
 if(!num(s.battlesWon)||typeof s.encounterStamp!=="string"||!/^([0-9]+:[0-3])?$/.test(s.encounterStamp))return false;
 if(!Object.keys(itemBook).every(k=>num(s.inventory[k]??0)))return false;
 if(s.battle===null)return true;
 const b=s.battle;
 return b&&Object.hasOwn(enemyBook,b.enemy)&&["intro","player","enemy","won"].includes(b.phase)
 &&num(b.hp,100)&&num(b.maxHp,100)&&b.maxHp>=1&&b.hp<=b.maxHp
 &&((b.phase==="won")===(b.hp===0))&&num(b.turn,3)&&num(b.intent,3)&&num(b.round)&&b.round>=1&&num(b.tick)
 &&Array.isArray(b.order)&&b.order.length===4&&new Set(b.order).size===4&&b.order.every(x=>num(x,3))
 &&Array.isArray(b.acted)&&b.acted.length===4&&b.acted.every(x=>typeof x==="boolean")
 &&Array.isArray(b.guard)&&b.guard.length===4&&b.guard.every(x=>num(x,4))&&typeof b.marked==="boolean"
 &&Array.isArray(b.log)&&b.log.length<=8&&b.log.every(x=>typeof x==="string"&&x.length<=250);
}
function restoreCombatState(s){
 gear=s.gear||{weapons:[false,false,false,false],ammo:{Arrows:0,Stones:0,Bolts:0,Cells:0}};
 battle=s.battle||null;battlesWon=s.battlesWon||0;encounterStamp=s.encounterStamp||"";
 journey=s.journey||{quietTurns:0,searches:0,bosses:s.outcome==='won'?[...portalBosses]:[]};
 for(const name of Object.keys(itemBook))inventory[name]??=0;
 if(battle){
  if(!teleporter&&enemyBook[battle.enemy].boss){battle.enemy={EvilKitty:'Scratchling',Eyes:'Gazer',Watcher:'Mite'}[battle.enemy];}
  battle.weakness??=[0,0,0,0];battle.enemyGuard??=0;battle.burn??=0;battle.smoke??=0;battle.sinceEnemy??=0;battle.nextTurn??=null;battle.lastMove??='';
  if(battle.maxHp!==8){battle.hp=battle.phase==='won'?0:Math.max(1,Math.ceil(battle.hp*8/battle.maxHp));battle.maxHp=8;}
  battle.reward??=null; // Old victories already received their reward; do not grant it again.
 }
}
function everyoneAtPortal(){return players.every(p=>p.loc==="Centre"&&!p.ko);}
function canBuildPortal(){return !battle&&!gameOver&&!teleporter&&allParts()&&players[active].loc==="Centre"&&!players[active].ko&&actions>0&&res.Gold>=2&&res.Wood>=2&&res.String>=1;}
function offerPortal(){
 if(battle||gameOver)return;
 const needs=[['Gold',2],['Wood',2],['String',1]];
 let html='<div class="portalEmblem" aria-hidden="true">🌀</div><h2>The Teleporter</h2>';
 if(!teleporter){
  html+='<p>Captured parts: '+Object.entries(parts).map(([name,found])=>(found?'✓ ':'□ ')+name).join(' · ')+'</p><p>Build at the <b>Centre</b>: <b>1 action</b>, all 3 parts, <b>2 Gold + 2 Wood + 1 String</b>.</p><div class="chips">'+needs.map(([name,n])=>'<span class="chip">'+name+': '+res[name]+' / '+n+'</span>').join('')+'</div><p><b>Opening the portal summons the main villains!</b> All four characters join the battles. Take weapons, ammo, and healing. Journey actions and the countdown pause while fighting.</p>';
  if(!canBuildPortal())html+='<p>You need all parts, the listed materials, and a standing character at the Centre with an action left.</p>';
  html+='<button class="choice" id="buildPortal" '+(canBuildPortal()?'':'disabled')+'>BUILD PORTAL · 1 ACTION</button>';
 }else{
  html+='<p><b>Portal open · '+finalRounds+' journey rounds left.</b></p><div class="bossProgress">'+portalBosses.map(k=>(journey.bosses.includes(k)?'✓ ':'□ ')+enemyBook[k].name).join('<br>')+'</div>';
  if(!portalCleared())html+='<p>The guardians block the path home. Defeat them one at a time. Between victories, the portal restores 2 Hearts to everyone and supplies healing and ammo.</p><button class="choice" id="portalBattle">FACE '+enemyBook[portalBosses[journey.bosses.length]].name.toUpperCase()+'</button>';
  html+='<p>'+players.map(p=>(p.loc==='Centre'&&!p.ko?'✓ ':'□ ')+p.role+(p.ko?' (needs rescue)':' · '+p.loc)).join('<br>')+'</p><p>Defeat all three guardians and assemble everyone here to escape. Escaping needs no action.</p><button class="choice" id="escapePortal" '+(portalCleared()&&everyoneAtPortal()?'':'disabled')+'>ESCAPE TOGETHER</button>';
 }
 html+='<button class="choice alt" id="closePortal">BACK TO ISLAND</button>';showModal(html);
 $('closePortal').addEventListener('click',closeModal);
 if($('buildPortal'))$('buildPortal').addEventListener('click',buildPortal);
 if($('portalBattle'))$('portalBattle').addEventListener('click',startPortalBattle);
 if($('escapePortal'))$('escapePortal').addEventListener('click',()=>{if(teleporter&&portalCleared()&&everyoneAtPortal()&&!battle)win();});
}
function buildPortal(){
 if(!canBuildPortal()||!spendAction())return false;
 res.Gold-=2;res.Wood-=2;res.String--;teleporter=true;finalRounds=3;discoveries.add("Teleporter Activated");
 moveMode=false;explorerSteps=0;closeModal();render();startPortalBattle();return true;
}
function weaponCard(i){
 const w=weaponBook[i];return '<p><b>'+w.icon+' '+w.name+'</b> · '+(gear.weapons[i]?'Found':'Explore the '+w.region+' to find it')+'<br>'+w.ammo+': '+gear.ammo[w.ammo]+' · '+w.detail+'</p>';
}
function showPack(tab='items'){
 if(battle){showBattlePack();return;}
 const content=tab==='weapons'?weaponBook.map((w,i)=>'<section class="packRow"><b>'+roleNames[i]+' · '+controllerHTML(i)+'</b>'+weaponCard(i)+'</section>').join(''):tab==='region'?regionLootHTML():ownedItemCards(true);
 showModal('<h2>Team Inventory</h2><p>Shared by all four characters. Counts below are what you own.</p><div class="chips">'+Object.entries(res).map(([k,n])=>'<span class="chip">'+k+' ×'+n+'</span>').join('')+'</div><div class="packTabs"><button class="choice" id="packItems">ITEMS</button><button class="choice" id="packWeapons">WEAPONS</button><button class="choice" id="packRegion">REGION LOOT</button></div>'+content+'<button class="choice alt" id="closePack">BACK TO ISLAND</button>');
 $('packItems').addEventListener('click',()=>showPack('items'));$('packWeapons').addEventListener('click',()=>showPack('weapons'));$('packRegion').addEventListener('click',()=>showPack('region'));$('closePack').addEventListener('click',closeModal);bindItemButtons(false);
}
function encounterEligible(){return !gameOver&&!battle&&players[active].loc!=="Centre"&&!players[active].ko&&actions>0;}
function checkEncounter(){
 const stamp=round+':'+active;if(encounterStamp===stamp)return false;
 if(!encounterEligible())return false;
 encounterStamp=stamp;
 const encounter=journey.quietTurns>=4||Math.random()<.55;
 journey.quietTurns=encounter?0:journey.quietTurns+1;queueSave();
 if(!encounter)return false;
 const choices=regionMinions[players[active].loc];startBattle(choices[Math.floor(Math.random()*choices.length)]);return true;
}
function beginJourneyTurn(){closeModal();render();checkEncounter();}
function startBattle(enemy){
 if(battle||gameOver)return;
 if(enemyBook[enemy]?.boss&&(!teleporter||enemy!==portalBosses[journey.bosses.length]))return;
 if(!enemyBook[enemy])return;
 if(players.every(p=>p.ko)){lose("The whole team was knocked out.");return;}
 const order=Array.from({length:4},(_,i)=>(active+i)%4),hp=8;
 battle={enemy,phase:'intro',hp,maxHp:hp,round:1,turn:order.find(i=>!players[i].ko),order,acted:[false,false,false,false],guard:[0,0,0,0],marked:false,intent:0,tick:0,log:[],weakness:[0,0,0,0],enemyGuard:0,burn:0,smoke:0,sinceEnemy:0,nextTurn:null,lastMove:'',reward:null};
 journey.quietTurns=0;battle.intent=chooseEnemyTarget();encounterStamp=round+":"+active;showBattle();queueSave();
}
function chooseEnemyTarget(){const alive=players.map((p,i)=>i).filter(i=>!players[i].ko);return alive[Math.floor(Math.random()*alive.length)];}
function battleLog(message){battle.log.push(message);battle.log=battle.log.slice(-8);}
function battleHero(i){return '<div class="battleHero '+(battle.turn===i?'current':'')+'">'+portrait(players[i].role,'')+'<b>'+players[i].role+'</b><small>'+controllerHTML(i)+'</small><span>'+(players[i].ko?'Knocked out':'♥ '+players[i].hp+'/5')+'</span><small>Guard '+battle.guard[i]+(battle.acted[i]?' · acted':'')+(battle.weakness[i]?' · weakened':'')+'</small></div>';}
function showBattle(){
 if(!battle||gameOver)return;
 const b=battle,e=enemyBook[b.enemy],i=b.turn,w=weaponBook[i];
 if(b.phase==='enemy'){
  showModal('<div class="enemyResponse"><div class="battleEnemy">'+e.icon+'</div><h2>'+e.name+' fights back!</h2><h3>'+e.skill+'</h3><p>'+escapeText(b.lastMove)+'</p></div><div class="battleTeam">'+players.map((_,j)=>battleHero(j)).join('')+'</div><button class="choice" id="afterEnemy">CONTINUE TEAM TURNS</button>',false);
  $('afterEnemy').addEventListener('click',()=>resumeAfterEnemy(b.tick));return;
 }
 if(b.phase==='won'){
  showModal('<div class="battleEnemy" aria-hidden="true">✨</div><h2>TEAM VICTORY!</h2><p>'+e.name+' is defeated. Everyone’s map position and journey actions are preserved.</p><p><b>Loot: 1 Gold, 2 Food, 1 Healing Kit, and 3 '+weaponBook[b.order[0]].ammo+'.</b></p><p>'+(e.boss?'Guardian defeated! The portal restores 2 Hearts to everyone, adds 2 more kits, and 4 of every ammo.':'Choose your unlocked victory reward below.')+'</p>'+rewardUnlockHTML(b)+'<div class="battleTeam">'+players.map((_,j)=>battleHero(j)).join('')+'</div><button class="choice" id="leaveBattle" '+(b.reward&&!b.reward.claimed?'disabled':'')+'>CONTINUE JOURNEY</button>',false);
  $('modal').querySelectorAll('[data-reward-choice]').forEach(button=>button.addEventListener('click',()=>claimVictoryReward(Number(button.dataset.rewardChoice))));
  $('leaveBattle').addEventListener('click',finishBattle);return;
 }
 const header='<div class="battleHeading"><span class="battleEnemy" aria-hidden="true">'+e.icon+'</span><div><h2>'+e.name+'</h2><b>Skill points remaining: '+b.hp+' / '+b.maxHp+'</b><p>Battle round '+b.round+' · Next hit: '+players[b.intent].role+' · '+e.skill+'</p><small>'+e.story+'</small><p>Enemy Guard '+b.enemyGuard+' · Burn '+b.burn+' · Smoke '+b.smoke+'</p></div></div>';
 const team='<div class="battleTeam">'+players.map((_,j)=>battleHero(j)).join('')+'</div>';
 if(b.phase==='intro'){
  showModal(header+'<p>The whole team joins this battle. Map positions do not change, and the journey pauses.</p>'+team+'<p>Each standing character takes <b>one combat action</b>. The enemy fights back after every <b>two actions</b>, or sooner when no standing character remains to act. Use weapons, Guard, and healing together. Basic attacks need no weapon or ammunition.</p><button class="choice" id="beginBattle">BATTLE TOGETHER</button>',false);
  $('beginBattle').addEventListener('click',()=>{if(!battle||battle.phase!=='intro')return;battle.phase='player';battle.tick++;showBattle();queueSave();});return;
 }
 const token=b.tick;
 showModal('<div class="battleScreen"><div>'+header+team+'</div><div><h3>'+controllerHTML(i)+' · '+players[i].role+' acts</h3><p class="battleHint">'+w.detail+(b.marked?' Enemy marked: next attack +1.':'')+'</p><div class="battleActions"><button class="choice" id="basicAttack">BASIC ATTACK · 2</button><button class="choice" id="weaponAttack" '+(gear.weapons[i]&&gear.ammo[w.ammo]>0?'':'disabled')+'>'+w.icon+' '+w.name+' · '+(gear.weapons[i]?gear.ammo[w.ammo]+' '+w.ammo:'NOT FOUND')+'</button><button class="choice" id="battlePack">ITEM BAG</button><button class="choice" id="guardBattle">GUARD · block 2</button><button class="choice" id="kitBattle" '+(inventory['Healing Kit']>0?'':'disabled')+'>HEALING KIT · '+inventory['Healing Kit']+'</button><button class="choice" id="foodBattle" '+(res.Food>0?'':'disabled')+'>FOOD · heal 1 ('+res.Food+')</button><button class="choice" id="bombBattle" '+(inventory['Shock Bomb']>0?'':'disabled')+'>SHOCK BOMB · 5 ('+inventory['Shock Bomb']+')</button><button class="choice" id="shieldBattle" '+(inventory['Shield Pack']>0?'':'disabled')+'>SHIELD PACK · '+inventory['Shield Pack']+'</button>'+(i===3?'<button class="choice" id="careBattle">MEDIC CARE · heal 3</button>':'')+'</div><p>Weapon shots use 1 ammo. Healing, Guard, and items each use this character’s combat action.</p><div class="battleLog" role="status">'+b.log.map(x=>'<div>'+escapeText(x)+'</div>').join('')+'</div></div></div>',false);
 $('battlePack').addEventListener('click',showBattlePack);
 $('basicAttack').addEventListener('click',()=>battleAction('basic',null,token));
 $('weaponAttack').addEventListener('click',()=>battleAction('weapon',null,token));
 $('guardBattle').addEventListener('click',()=>battleAction('guard',null,token));
 $('bombBattle').addEventListener('click',()=>battleAction('bomb',null,token));
 for(const [id,type] of [['kitBattle','kit'],['foodBattle','food'],['shieldBattle','shield'],['careBattle','care']])if($(id))$(id).addEventListener('click',()=>showHealingTargets(true,type));
}
function showHealingTargets(inBattle,type){
 const i=inBattle?battle.turn:active,token=inBattle?battle.tick:0;
 const label=type==='herbs'?'Herbs: heal 2':type==='antidote'?'Antidote: clear weakness and heal 1':type==='shield'?'Give 4 Guard':type==='care'?'Medic care: heal 3':type==='food'?'Food: heal 1':'Healing Kit: heal 3';
 const eligible=players.map((p,j)=>({p,j})).filter(({p})=>(inBattle||p.loc===players[active].loc)&&(type==='shield'?!p.ko:type==='antidote'?!p.ko&&(p.hp<5||(inBattle&&battle.weakness[players.indexOf(p)])):p.hp<5&&(!['food','herbs'].includes(type)||!p.ko)));
 showModal('<h2>'+label+'</h2><p>Choose a teammate. '+(type==='kit'||type==='care'?'Can revive a knocked-out survivor.':'')+'</p>'+eligible.map(({p,j})=>'<button class="choice healTarget" data-target="'+j+'">'+p.role+' · '+controllerHTML(j)+' · ♥ '+p.hp+'/5</button>').join('')+(eligible.length?'':'<p>No eligible teammate. Nothing will be spent.</p>')+'<button class="choice alt" id="cancelTarget">BACK</button>',false);
 $('modal').querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',()=>{
  const j=Number(button.dataset.target);
  if(inBattle){battleAction(type,j,token);return;}
  const item={kit:'Healing Kit',herbs:'Medicinal Herbs',antidote:'Antidote'}[type];
  if(!item||inventory[item]<1||players[j].loc!==players[active].loc||players[j].hp>=5||(type!=='kit'&&players[j].ko)||!spendAction())return;
  inventory[item]--;heal(j,type==='kit'?3:type==='herbs'?2:1);closeModal();render();
 }));
 $('cancelTarget').addEventListener('click',()=>inBattle?showBattle():showPack());
}
function battleAction(kind,target,token){
 if(!battle||battle.phase!=='player'||gameOver||token!==battle.tick)return false;
 const b=battle,i=b.turn,p=players[i],w=weaponBook[i];
 if(p.ko||b.acted[i])return false;
 battleFx={side:'hero',actor:i,target:Number.isInteger(target)?target:null,kind,amount:0};
 let damage=0;
 if(kind==='basic')damage=2;
 else if(kind==='weapon'){
  if(!gear.weapons[i]||gear.ammo[w.ammo]<1)return false;
  gear.ammo[w.ammo]--;damage=w.damage;
  if(i===2)b.guard[i]=Math.max(b.guard[i],2);
  if(i===3){const hurt=b.order.filter(j=>!players[j].ko&&players[j].hp<5).sort((a,c)=>players[a].hp-players[c].hp)[0];if(hurt!==undefined){players[hurt].hp++;battleLog('Spark Staff restored 1 Heart to '+players[hurt].role+'.');}}
 }else if(kind==='fire'){if(inventory['Fire Flask']<1)return false;inventory['Fire Flask']--;damage=3;b.burn=2;}
 else if(kind==='smoke'){if(inventory['Smoke Bomb']<1)return false;inventory['Smoke Bomb']--;b.smoke=1;battleLog('Smoke will cancel the next enemy response.');}
 else if(kind==='ammo'){if(inventory['Ammo Pouch']<1)return false;inventory['Ammo Pouch']--;weaponBook.forEach(w=>gear.ammo[w.ammo]+=2);battleLog('Ammo Pouch supplied 2 of every ammunition.');}
 else if(kind==='bomb'){if(inventory['Shock Bomb']<1)return false;inventory['Shock Bomb']--;damage=5;}
 else if(kind==='guard'){b.guard[i]=Math.max(b.guard[i],2);battleLog(p.role+' guards against the next hit.');}
 else if(['kit','food','care','shield','herbs','antidote'].includes(kind)){
  if(!Number.isInteger(target)||target<0||target>3)return false;
  const patient=players[target];
  if(kind==='shield'){
   if(patient.ko||inventory['Shield Pack']<1)return false;
   inventory['Shield Pack']--;b.guard[target]=4;battleLog(patient.role+' gained 4 Guard.');
  }else{
   if((patient.hp>=5&&!(kind==='antidote'&&b.weakness[target]))||(['food','herbs','antidote'].includes(kind)&&patient.ko)||(kind==='herbs'&&inventory['Medicinal Herbs']<1)||(kind==='antidote'&&inventory.Antidote<1)||(kind==='care'&&i!==3)||(kind==='kit'&&inventory['Healing Kit']<1)||(kind==='food'&&res.Food<1))return false;
   if(kind==='herbs')inventory['Medicinal Herbs']--;if(kind==='antidote'){inventory.Antidote--;b.weakness[target]=0;}
   if(kind==='kit')inventory['Healing Kit']--;if(kind==='food')res.Food--;
   const before=patient.hp;patient.hp=Math.min(5,patient.hp+(kind==='kit'?3:kind==='care'?3:kind==='herbs'?2:1));patient.ko=false;
   battleLog(p.role+' restored '+(patient.hp-before)+' Hearts to '+patient.role+'.');
  }
 }else return false;
 if(damage){
  if(b.weakness[i]){damage=Math.max(0,damage-1);b.weakness[i]=0;battleLog(p.role+' shook off Weakness (-1 damage).');}
  if(b.marked){damage++;b.marked=false;}
  if(b.enemyGuard){const blocked=Math.min(b.enemyGuard,damage);damage-=blocked;b.enemyGuard-=blocked;battleLog('Enemy shield blocked '+blocked+'.');}
  b.hp=Math.max(0,b.hp-damage);battleFx.amount=damage;battleLog(p.role+' dealt '+damage+' damage.');
  if(kind==='weapon'&&i===0)b.marked=true;
 }
 b.tick++;b.acted[i]=true;
 if(b.hp===0){awardBattleVictory(); }else advanceBattle();
 render();if(!gameOver)showBattle();queueSave();return true;
}
function advanceBattle(){
 const b=battle,start=b.order.indexOf(b.turn);
 const next=Array.from({length:4},(_,n)=>b.order[(start+n+1)%4]).find(i=>!players[i].ko&&!b.acted[i]);
 b.sinceEnemy++;
 if(b.sinceEnemy>=2||next===undefined){b.nextTurn=next??null;enemyRespond();return;}
 b.turn=next;
}
function finishBattle(){
 if(!battle||battle.phase!=='won'||(battle.reward&&!battle.reward.claimed))return;
 const wasBoss=!!enemyBook[battle.enemy].boss;
 battle=null;closeModal();
 if(wasBoss){render();offerPortal();return;}
 if(players[active].ko){explorerSteps=0;moveMode=false;actions=0;}
 render();toast('Battle won! Continue the journey with your remaining actions.');
}
function win(){
 if(!gameOver&&(!teleporter||!portalCleared()||!everyoneAtPortal()))return;
 battle=null;gameOver=true;outcome='won';clearTimeout(travelTimer);travelBusy=false;
 const friends=Object.keys(recruited).filter(k=>recruited[k]);
 showModal('<div class="endingScene"><img src="assets/island-v015.png" alt="The island you escaped"><div class="endingPortal">🌀</div></div><h2>YOU ESCAPED TOGETHER!</h2><p>The Core hums. The Crystal shines. The Portal Ring opens a path home.</p><div class="endingTeam">'+players.map((p,i)=>'<div>'+portrait(p.role,'')+'<b>'+p.role+'</b><small>'+controllerHTML(i)+'</small></div>').join('')+'</div><p>All four survivors step through the portal'+(friends.length?', with '+friends.join(', ')+' beside them':'')+'. The island fades behind you.</p><p><b>The Lost Helicopter Journal is complete.</b><br>'+battlesWon+' battles won · '+round+' journey rounds</p><button class="choice" id="restart">PLAY A NEW ADVENTURE</button>',false);
 $('restart').addEventListener('click',()=>{saveEnabled=false;try{localStorage.removeItem(SAVE_KEY);}catch{}location.reload();});queueSave();
}

const itemBook={
 'Tool':{icon:'🛠️',detail:'Automatically adds 1 bundle to your next Gather or Harvest.'},
 'Armour':{icon:'🦺',detail:'Automatically blocks one enemy hit after Guard.'},
 'Healing Kit':{icon:'🩹',detail:'Heal or revive a teammate by up to 3 Hearts.',use:'kit'},
 'Shock Bomb':{icon:'💥',detail:'Deal 5 damage in battle.',use:'bomb',battleOnly:true},
 'Shield Pack':{icon:'🛡️',detail:'Give a teammate 4 Guard against their next hit.',use:'shield',battleOnly:true},
 'Medicinal Herbs':{icon:'🌿',detail:'Heal a standing teammate by up to 2 Hearts.',use:'herbs'},
 'Antidote':{icon:'🧪',detail:'Clear Weakness and heal 1 Heart. Cannot revive.',use:'antidote'},
 'Fire Flask':{icon:'🔥',detail:'3 damage, then 2 burn damage before each of the next 2 enemy responses.',use:'fire',battleOnly:true},
 'Smoke Bomb':{icon:'💨',detail:'Cancel the next entire enemy response.',use:'smoke',battleOnly:true},
 'Ammo Pouch':{icon:'🎒',detail:'Add 2 Arrows, 2 Stones, 2 Bolts, and 2 Cells.',use:'ammo'}
};
const regionalLoot={
 Beach:[{name:'Food',n:2},{name:'String',n:1},{name:'Medicinal Herbs',n:1},{name:'Smoke Bomb',n:1},{name:'Ammo Pouch',n:1}],
 Forest:[{name:'Wood',n:2},{name:'Food',n:2},{name:'Arrows',n:3},{name:'Medicinal Herbs',n:1},{name:'Antidote',n:1}],
 Desert:[{name:'Gold',n:2},{name:'Stones',n:3},{name:'Shock Bomb',n:1},{name:'Fire Flask',n:1},{name:'Armour',n:1}],
 Cave:[{name:'String',n:2},{name:'Bolts',n:3},{name:'Shield Pack',n:1},{name:'Tool',n:1},{name:'Ammo Pouch',n:1}],
 Ice:[{name:'Ice',n:2},{name:'Cells',n:3},{name:'Healing Kit',n:1},{name:'Shield Pack',n:1},{name:'Smoke Bomb',n:1}]
};
const regionMinions={Beach:['Scratchling','Mite'],Forest:['Scratchling','Gazer'],Desert:['SandProwler','Mite'],Cave:['Gazer','Mite'],Ice:['FrostWisp','Gazer']};
function portalCleared(){return journey.bosses.length===portalBosses.length;}
function startPortalBattle(){if(teleporter&&!portalCleared()&&!battle&&!gameOver)startBattle(portalBosses[journey.bosses.length]);}
function awardSupply(name,n){
 if(Object.hasOwn(res,name))res[name]+=n;
 else if(Object.hasOwn(gear.ammo,name))gear.ammo[name]+=n;
 else if(Object.hasOwn(itemBook,name))inventory[name]=(inventory[name]||0)+n;
 else return;
 discoveries.add(name);toast('Found '+n+' '+name+'. Check your PACK.');
}
function grantExploreSupplies(region){
 const loot=regionalLoot[region];if(!loot)return;
 const bundle=loot[Math.floor(Math.random()*loot.length)];awardSupply(bundle.name,bundle.n);
 res.Food++; // Exploration always supplies provisions as well as its revealed discovery.
}
function gatherRegional(){
 const loot=regionalLoot[players[active].loc];if(!loot||battle||gameOver||players[active].ko||!spendAction())return false;
 const bundle=loot[Math.floor(Math.random()*loot.length)];let times=1;
 if(inventory.Tool>0){inventory.Tool--;times++;}
 awardSupply(bundle.name,bundle.n*times);render();return true;
}
function showHarvest(){
 const region=players[active].loc,loot=regionalLoot[region];
 if(!loot||battle||gameOver||players[active].role!=='Hunter'||players[active].ko||players[active].abilityUsed||actions<=0){toast('Harvest is available once per Hunter turn, outside the Centre.');return;}
 const times=inventory.Tool>0?3:2;
 showModal('<h2>HARVEST · '+region+'</h2><p>Your gathering specialty: <b>choose</b> what to collect. Costs 1 action and your once-per-turn ability.'+(inventory.Tool>0?' A Tool adds a third bundle.':'')+'</p>'+loot.map((x,i)=>'<button class="choice" data-harvest="'+i+'">'+(itemBook[x.name]?.icon||'📦')+' '+x.name+' ×'+x.n*times+'</button>').join('')+'<button class="choice alt" id="cancelHarvest">CANCEL · KEEP ABILITY</button>');
 $('modal').querySelectorAll('[data-harvest]').forEach(b=>b.addEventListener('click',()=>harvestChoice(region,Number(b.dataset.harvest))));
 $('cancelHarvest').addEventListener('click',closeModal);
}
function harvestChoice(region,index){
 const p=players[active],bundle=regionalLoot[region]?.[index];
 if(!bundle||p.role!=='Hunter'||p.loc!==region||battle||gameOver||p.ko||!spendAbility())return false;
 let times=2;if(inventory.Tool>0){inventory.Tool--;times++;}
 awardSupply(bundle.name,bundle.n*times);closeModal();render();return true;
}
function regionLootHTML(){return '<h3>Where to find useful supplies</h3><p>Every Explore gives a regional supply bundle and 1 Food alongside the main discovery. Gather rolls a bundle; the Hunter chooses with HARVEST.</p>'+Object.entries(regionalLoot).map(([region,loot])=>'<section class="packRow"><b>'+region+(region===players[active].loc?' · YOU ARE HERE':'')+'</b><p>'+loot.map(x=>x.name+' ×'+x.n).join(' · ')+'</p></section>').join('');}
function ownedItemCards(interactive,inBattle=false){
 const owned=Object.entries(itemBook).filter(([name])=>inventory[name]>0);
 return '<div class="packGrid">'+owned.map(([name,item])=>'<section class="itemCard"><b>'+item.icon+' '+name+' ×'+inventory[name]+'</b><small>'+item.detail+'</small>'+(interactive&&item.use?'<button class="choice" data-use-item="'+item.use+'" '+(!inBattle&&(item.battleOnly||actions<=0||players[active].ko)?'disabled':'')+'>'+(item.battleOnly&&!inBattle?'BATTLE ONLY':'USE '+name.toUpperCase()+' · 1 '+(inBattle?'COMBAT':'JOURNEY')+' ACTION')+'</button>':'')+'</section>').join('')+'</div>'+(owned.length?'':'<p>No equipment in the pack yet. Explore or Gather to find regional supplies.</p>');
}
function bindItemButtons(inBattle){
 $('modal').querySelectorAll('[data-use-item]').forEach(button=>button.addEventListener('click',()=>{
  const type=button.dataset.useItem;
  if(['kit','herbs','antidote','shield'].includes(type)){showHealingTargets(inBattle,type);return;}
  if(inBattle){battleAction(type,null,battle.tick);return;}
  if(type==='ammo'&&inventory['Ammo Pouch']>0&&spendAction()){inventory['Ammo Pouch']--;weaponBook.forEach(w=>gear.ammo[w.ammo]+=2);closeModal();render();toast('Added 2 of each ammunition.');}
 }));
}
function showBattlePack(){
 if(!battle||battle.phase!=='player')return;
 showModal('<h2>Battle Item Bag</h2><p>'+controllerHTML(battle.turn)+' · '+players[battle.turn].role+' chooses. Using an item takes this character’s combat action.</p>'+ownedItemCards(true,true)+'<button class="choice alt" id="backBattle">BACK TO BATTLE · NO ACTION</button>',false);
 bindItemButtons(true);$('backBattle').addEventListener('click',showBattle);
}
function awardBattleVictory(){
 if(!battle||battle.phase==='won')return;
 const b=battle,e=enemyBook[b.enemy];b.phase='won';b.reward=createVictoryReward();b.hp=0;battlesWon++;res.Gold++;res.Food+=2;inventory['Healing Kit']++;gear.ammo[weaponBook[b.order[0]].ammo]+=3;
 if(e.boss){
  if(!journey.bosses.includes(b.enemy))journey.bosses.push(b.enemy);
  players.forEach(p=>{p.hp=Math.min(5,p.hp+2);p.ko=false;});inventory['Healing Kit']+=2;weaponBook.forEach(w=>gear.ammo[w.ammo]+=4);
 }
 if(Object.hasOwn(monsters,b.enemy))monsters[b.enemy]=null;discoveries.add('Defeated '+e.name);
}
function enemyRespond(){
 const b=battle,e=enemyBook[b.enemy];b.sinceEnemy=0;const report=[];battleFx={side:'enemy',actor:b.enemy,target:b.intent,kind:e.skill,amount:e.damage};
 if(b.burn>0){b.burn--;b.hp=Math.max(0,b.hp-2);report.push('Fire burns the enemy for 2.');if(!b.hp){awardBattleVictory();return;}}
 if(b.smoke){b.smoke=0;report.push('Smoke hides the team. The entire enemy skill misses!');}
 else{
  let target=b.intent;if(players[target].ko)target=chooseEnemyTarget();
  const hit=(i,amount,pierce=0)=>{
   if(players[i].ko)return;
   const available=Math.max(0,b.guard[i]-pierce),blocked=Math.min(amount,available);b.guard[i]=0;let damage=amount-blocked;
   if(damage&&inventory.Armour>0){inventory.Armour--;damage=0;report.push('Armour protects '+players[i].role+'.');}
   players[i].hp=Math.max(0,players[i].hp-damage);players[i].ko=players[i].hp===0;
   report.push(players[i].role+' loses '+damage+' Heart'+(damage===1?'':'s')+(blocked?' ('+blocked+' blocked)':'')+(players[i].ko?' — knocked out!':'.'));
  };
  if(['Scratchling','EvilKitty'].includes(b.enemy)){hit(target,e.damage);if(!players.every(p=>p.ko))hit(players[target].ko?chooseEnemyTarget():target,e.damage);}
  else if(b.enemy==='Eyes'){players.forEach((p,i)=>{if(!p.ko)hit(i,1);});b.hp=Math.min(b.maxHp,b.hp+2);report.push('The Wall restores 2 Hearts.');}
  else{
   if(b.enemy==='Watcher'){b.guard[target]=0;report.push('Unmaking removes '+players[target].role+'’s Guard.');}
   hit(target,e.damage,b.enemy==='SandProwler'?1:0);
   if(b.enemy==='Gazer'){b.hp=Math.min(b.maxHp,b.hp+2);report.push('The Gazer restores 2 Hearts.');}
   if(b.enemy==='Mite'&&!players[target].ko){b.weakness[target]=1;report.push(players[target].role+' is weakened: next attack -1.');}
   if(b.enemy==='FrostWisp'){b.enemyGuard=2;report.push('Ice Shell blocks 2 damage from the next attacks.');}
  }
 }
 b.lastMove=e.skill+': '+report.join(' ');battleLog(b.lastMove.slice(0,250));b.tick++;
 if(players.every(p=>p.ko)){battle=null;lose('The villain knocked out the whole team.');return;}
 b.phase='enemy';
}
function resumeAfterEnemy(token){
 if(!battle||battle.phase!=='enemy'||battle.tick!==token||gameOver)return false;
 const b=battle;
 const start=b.order.indexOf(b.turn),next=Array.from({length:4},(_,n)=>b.order[(start+n+1)%4]).find(i=>!players[i].ko&&!b.acted[i]);
 if(next===undefined){b.round++;b.acted.fill(false);b.turn=b.order.find(i=>!players[i].ko);}else b.turn=next;
 b.nextTurn=null;b.intent=chooseEnemyTarget();b.phase='player';b.tick++;render();showBattle();queueSave();return true;
}

function createVictoryReward(){
 const local=(regionalLoot[players[active].loc]||regionalLoot.Beach).filter(x=>itemBook[x.name]).map(x=>x.name);
 const first=local[Math.floor(Math.random()*local.length)];
 const choices=[first],pool=Object.keys(itemBook).filter(k=>k!==first&&itemBook[k].use);
 while(choices.length<3){const index=Math.floor(Math.random()*pool.length);choices.push(pool.splice(index,1)[0]);}
 return {choices,claimed:false,selected:null};
}
function rewardUnlockHTML(b){
 if(!b.reward)return '<p>Your victory rewards are already in the pack.</p>';
 if(b.reward.claimed)return '<section class="bossProgress"><h3>🎁 REWARD COLLECTED</h3><p>'+itemBook[b.reward.selected].icon+' '+b.reward.selected+' ×1 added to the shared pack.</p></section>';
 return '<section class="bossProgress"><h3>🎁 VICTORY REWARD UNLOCKED</h3><p>Choose one free item. Your choices are saved if you leave and return.</p>'+b.reward.choices.map((name,i)=>'<button class="choice" data-reward-choice="'+i+'">CLAIM '+name.toUpperCase()+' ×1<br><small>'+itemBook[name].detail+'</small></button>').join('')+'</section>';
}
function claimVictoryReward(index){
 if(!battle||battle.phase!=='won'||!battle.reward||battle.reward.claimed||!Number.isInteger(index)||index<0||index>=battle.reward.choices.length)return false;
 const reward=battle.reward;reward.claimed=true;reward.selected=reward.choices[index];
 awardSupply(reward.selected,1);render();showBattle();queueSave();return true;
}

function rpgHero(i){
 const p=players[i],classes=['rpgHero'];
 if(i===battle.turn&&battle.phase==='player')classes.push('current');
 if(p.ko)classes.push('ko');
 if(battle.acted[i])classes.push('acted');
 if(battleFx?.side==='hero'&&battleFx.actor===i)classes.push('attacking');
 if(battleFx?.side==='enemy'&&battleFx.target===i)classes.push('targeted');
 return '<div class="'+classes.join(' ')+'" style="--hero-colour:'+playerColours[i]+'">'+portrait(p.role,'rpgPortrait')+'<div class="rpgName">'+p.role+'<small>'+controllerHTML(i)+'</small></div><div class="rpgVitals">♥ '+p.hp+'/5'+(battle.guard[i]?' · 🛡 '+battle.guard[i]:'')+(battle.weakness[i]?' · weak':'')+'</div></div>';
}
function rpgTerrain(){return enemyBook[battle.enemy].boss?'Centre':players[active].loc;}
function rpgFxHTML(){
 if(!battleFx)return '';
 const icon=battleFx.side==='enemy'?'💥':battleFx.kind==='weapon'?weaponBook[battleFx.actor].icon:battleFx.kind==='basic'?'✦':['kit','care','herbs','antidote','food'].includes(battleFx.kind)?'♥':battleFx.kind==='guard'||battleFx.kind==='shield'?'🛡':battleFx.kind==='fire'?'🔥':battleFx.kind==='smoke'?'💨':battleFx.kind==='bomb'?'💥':'✦';
 return '<div class="rpgFx '+(battleFx.side==='enemy'?'enemyFx':'heroFx')+'" aria-hidden="true">'+icon+'</div>'+(battleFx.amount?'<div class="rpgDamage '+(battleFx.side==='enemy'?'atHeroes':'atEnemy')+'">-'+battleFx.amount+'</div>':'');
}
function rpgStage(mode='battle'){
 const e=enemyBook[battle.enemy],terrain=rpgTerrain(),intro=mode==='intro',victory=mode==='victory';
 return '<section class="rpgStage terrain-'+terrain+' '+(intro?'enemyCutscene ':'')+(victory?'rpgVictory ':'')+(battleFx?'fx-'+battleFx.side:'')+'" aria-label="'+e.name+' battle in the '+terrain+'"><img class="rpgTerrain" src="assets/island-v015.png" alt=""><div class="rpgSky"></div><div class="rpgTitle"><small>'+(intro?(e.boss?'PORTAL GUARDIAN':'ENEMY ENCOUNTER'):terrain.toUpperCase()+' BATTLE')+'</small><strong>'+e.name+'</strong><span>'+e.skill+'</span></div><div class="rpgParty">'+players.map((_,i)=>rpgHero(i)).join('')+'</div><div class="rpgVillain '+(battleFx?.side==='enemy'?'attacking':'')+'"><div class="villainAura"></div><div class="villainSprite" role="img" aria-label="'+e.name+'">'+(victory?'✨':e.icon)+'</div><b>'+e.name+'</b></div>'+rpgFxHTML()+'<div class="rpgGround"></div></section>';
}
function battleHud(){
 const b=battle,e=enemyBook[b.enemy],percent=Math.max(0,Math.round(b.hp/b.maxHp*100));
 return '<div class="rpgHud"><div><b>'+e.name+'</b><small> · '+e.skill+'</small></div><div class="rpgHp" aria-label="'+b.hp+' of '+b.maxHp+' skill points"><i style="width:'+percent+'%"></i></div><strong>'+b.hp+' / '+b.maxHp+'</strong><small>Round '+b.round+' · Next target: '+players[b.intent].role+' · Enemy Guard '+b.enemyGuard+'</small></div>';
}
function showBattle(){
 if(!battle||gameOver)return;
 const b=battle,e=enemyBook[b.enemy],i=b.turn,w=weaponBook[i];
 if(b.phase==='enemy'){
  showModal(rpgStage('battle')+battleHud()+'<div class="enemyResponse"><h2>'+e.name+' fights back!</h2><h3>'+e.skill+'</h3><p>'+escapeText(b.lastMove)+'</p></div><button class="choice" id="afterEnemy">CONTINUE TEAM TURNS</button>',false);
  $('afterEnemy').addEventListener('click',()=>resumeAfterEnemy(b.tick));battleFx=null;return;
 }
 if(b.phase==='won'){
  showModal(rpgStage('victory')+'<h2>TEAM VICTORY!</h2><p>'+e.name+' is defeated. Everyone’s map position and journey actions are preserved.</p><p><b>Loot: 1 Gold, 2 Food, 1 Healing Kit, and 3 '+weaponBook[b.order[0]].ammo+'.</b></p><p>'+(e.boss?'Guardian defeated! The portal restores 2 Hearts to everyone, adds 2 more kits, and 4 of every ammo.':'Choose your unlocked victory reward below.')+'</p>'+rewardUnlockHTML(b)+'<button class="choice" id="leaveBattle" '+(b.reward&&!b.reward.claimed?'disabled':'')+'>CONTINUE JOURNEY</button>',false);
  $('modal').querySelectorAll('[data-reward-choice]').forEach(button=>button.addEventListener('click',()=>claimVictoryReward(Number(button.dataset.rewardChoice))));
  $('leaveBattle').addEventListener('click',finishBattle);battleFx=null;return;
 }
 if(b.phase==='intro'){
  showModal(rpgStage('intro')+'<div class="cutsceneCopy"><h2>'+e.name+' approaches!</h2><p>'+e.story+'</p><p><b>'+e.skill+'</b> · The whole team enters the '+rpgTerrain()+'.</p><p>Each standing character acts once. The villain responds after every two actions. Journey actions and map positions are paused.</p></div><button class="choice engageBattle" id="beginBattle">ENGAGE '+e.name.toUpperCase()+'</button>',false);
  $('beginBattle').addEventListener('click',()=>{if(!battle||battle.phase!=='intro')return;battle.phase='player';battle.tick++;battleFx=null;showBattle();queueSave();});return;
 }
 const token=b.tick;
 showModal('<div class="rpgBattleLayout"><div>'+rpgStage('battle')+battleHud()+'</div><div class="rpgCommands"><h3>'+controllerHTML(i)+' · '+players[i].role+' acts</h3><p class="battleHint">'+w.detail+(b.marked?' Enemy marked: next attack +1.':'')+'</p><div class="battleActions"><button class="choice" id="basicAttack">BASIC ATTACK · 2</button><button class="choice" id="weaponAttack" '+(gear.weapons[i]&&gear.ammo[w.ammo]>0?'':'disabled')+'>'+w.icon+' '+w.name+' · '+(gear.weapons[i]?gear.ammo[w.ammo]+' '+w.ammo:'NOT FOUND')+'</button><button class="choice" id="battlePack">ITEM BAG</button><button class="choice" id="guardBattle">GUARD · block 2</button><button class="choice" id="kitBattle" '+(inventory['Healing Kit']>0?'':'disabled')+'>HEALING KIT · '+inventory['Healing Kit']+'</button><button class="choice" id="foodBattle" '+(res.Food>0?'':'disabled')+'>FOOD · heal 1 ('+res.Food+')</button><button class="choice" id="bombBattle" '+(inventory['Shock Bomb']>0?'':'disabled')+'>SHOCK BOMB · 5 ('+inventory['Shock Bomb']+')</button><button class="choice" id="shieldBattle" '+(inventory['Shield Pack']>0?'':'disabled')+'>SHIELD PACK · '+inventory['Shield Pack']+'</button>'+(i===3?'<button class="choice" id="careBattle">MEDIC CARE · heal 3</button>':'')+'</div><p>Weapon shots use 1 ammo. Every choice uses this character’s combat action.</p><div class="battleLog" role="status">'+b.log.map(x=>'<div>'+escapeText(x)+'</div>').join('')+'</div></div></div>',false);
 $('battlePack').addEventListener('click',showBattlePack);$('basicAttack').addEventListener('click',()=>battleAction('basic',null,token));$('weaponAttack').addEventListener('click',()=>battleAction('weapon',null,token));$('guardBattle').addEventListener('click',()=>battleAction('guard',null,token));$('bombBattle').addEventListener('click',()=>battleAction('bomb',null,token));
 for(const [id,type] of [['kitBattle','kit'],['foodBattle','food'],['shieldBattle','shield'],['careBattle','care']])if($(id))$(id).addEventListener('click',()=>showHealingTargets(true,type));
 battleFx=null;
}
