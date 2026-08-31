"use strict";
// Battle turns are independent of journey actions and never move map pieces.
const weaponBook=[
 {name:"Trailbow",icon:"🏹",ammo:"Arrows",region:"Forest",damage:3,detail:"3 damage; mark the enemy so the next attack deals +1."},
 {name:"Heavy Slingshot",icon:"🪨",ammo:"Stones",region:"Desert",damage:4,detail:"4 damage with a carefully aimed shot."},
 {name:"Rivet Launcher",icon:"🔧",ammo:"Bolts",region:"Cave",damage:3,detail:"3 damage and gain 2 Guard for your next incoming hit."},
 {name:"Spark Staff",icon:"✨",ammo:"Cells",region:"Ice",damage:2,detail:"2 damage and restore 1 Heart to the most injured living teammate."}
];
const enemyBook={
 EvilKitty:{name:"Evil Kitty",icon:"🐈",hp:10,damage:2},
 Eyes:{name:"Wall of Eyes",icon:"👁",hp:12,damage:2},
 Watcher:{name:"The One Who Watches",icon:"👁️",hp:16,damage:3}
};
let gear={weapons:[false,false,false,false],ammo:{Arrows:0,Stones:0,Bolts:0,Cells:0}};
let battle=null,encounterStamp="",battlesWon=0;
function initCombatContent(){
 for(const name of ["Shock Bomb","Shield Pack"])inventory[name]??=0;
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
 if(localWeapon>=0&&!gear.weapons[localWeapon])return 16+localWeapon;
 const deck=[...Array(16).keys(),20,21,22,23,24,25,26].filter(i=>players[active].loc!=="Centre"||![9,10].includes(i));
 if(localWeapon>=0)deck.push(16+localWeapon);
 return deck[Math.floor(Math.random()*deck.length)];
}
function validCombatSave(s){
 const num=(n,max=100000)=>Number.isInteger(n)&&n>=0&&n<=max;
 if(s.gear===undefined)return s.battle==null;
 const g=s.gear;
 if(!g||!Array.isArray(g.weapons)||g.weapons.length!==4||!g.weapons.every(x=>typeof x==="boolean")||!g.ammo||!weaponBook.every(w=>num(g.ammo[w.ammo])))return false;
 if(!num(s.battlesWon)||typeof s.encounterStamp!=="string"||!/^([0-9]+:[0-3])?$/.test(s.encounterStamp))return false;
 if(!["Shock Bomb","Shield Pack"].every(k=>num(s.inventory[k]??0)))return false;
 if(s.battle===null)return true;
 const b=s.battle;
 return b&&Object.hasOwn(enemyBook,b.enemy)&&["intro","player","won"].includes(b.phase)
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
 for(const name of ["Shock Bomb","Shield Pack"])inventory[name]??=0;
}
function everyoneAtPortal(){return players.every(p=>p.loc==="Centre"&&!p.ko);}
function canBuildPortal(){return !battle&&!gameOver&&!teleporter&&allParts()&&players[active].loc==="Centre"&&!players[active].ko&&actions>0&&res.Gold>=2&&res.Wood>=2&&res.String>=1;}
function offerPortal(){
 if(battle||gameOver)return;
 const needs=[['Gold',2],['Wood',2],['String',1]];
 let html='<div class="portalEmblem" aria-hidden="true">🌀</div><h2>The Teleporter</h2>';
 if(!teleporter){
  html+='<p>Captured parts: '+Object.entries(parts).map(([name,found])=>(found?'✓ ':'□ ')+name).join(' · ')+'</p><p>Build at the <b>Centre</b> using <b>1 action</b>, all 3 parts, and these supplies:</p><div class="chips">'+needs.map(([name,n])=>'<span class="chip">'+name+': '+res[name]+' / '+n+'</span>').join('')+'</div>';
  if(!allParts())html+='<p>Find the missing Teleporter parts by exploring.</p>';
  if(players[active].loc!=="Centre")html+='<p>Move this character to the Centre to build.</p>';
  if(actions<=0)html+='<p>No actions left. Return to the island to begin the next character’s turn.</p>';
  if(needs.some(([k,n])=>res[k]<n))html+='<p>Gather missing supplies on the outer circuit. Your captured parts stay with the team.</p>';
  html+='<button class="choice" id="buildPortal" '+(canBuildPortal()?'':'disabled')+'>BUILD PORTAL · 1 ACTION</button>';
 }else{
  html+='<p><b>The portal is active!</b> '+finalRounds+' rounds remain.</p><p>'+players.map(p=>(p.loc==='Centre'&&!p.ko?'✓ ':'□ ')+p.role+(p.ko?' (needs rescue)':p.loc!=='Centre'?' ('+p.loc+')':'')).join('<br>')+'</p>';
  html+='<p>When all four survivors are here and standing, escape immediately. No extra action or waiting required.</p><button class="choice" id="escapePortal" '+(everyoneAtPortal()?'':'disabled')+'>ESCAPE TOGETHER</button>';
 }
 html+='<button class="choice alt" id="closePortal">BACK TO ISLAND</button>';
 showModal(html);
 $('closePortal').addEventListener('click',closeModal);
 if($('buildPortal'))$('buildPortal').addEventListener('click',buildPortal);
 if($('escapePortal'))$('escapePortal').addEventListener('click',()=>{if(teleporter&&everyoneAtPortal()&&!battle)win();});
}
function buildPortal(){
 if(!canBuildPortal()||!spendAction())return false;
 res.Gold-=2;res.Wood-=2;res.String--;teleporter=true;finalRounds=3;discoveries.add("Teleporter Activated");
 moveMode=false;explorerSteps=0;closeModal();render();offerPortal();return true;
}
function weaponCard(i){
 const w=weaponBook[i];return '<p><b>'+w.icon+' '+w.name+'</b> · '+(gear.weapons[i]?'Found':'Explore the '+w.region+' to find it')+'<br>'+w.ammo+': '+gear.ammo[w.ammo]+' · '+w.detail+'</p>';
}
function showPack(){
 if(battle){showBattle();return;}
 showModal('<h2>Shared Adventure Pack</h2>'+weaponBook.map((w,i)=>'<section class="packRow"><b>'+roleNames[i]+' · '+controllerHTML(i)+'</b>'+weaponCard(i)+'</section>').join('')+'<div class="chips">'+Object.entries(inventory).map(([k,n])=>'<span class="chip">'+k+': '+n+'</span>').join('')+'</div><p>Healing Kits restore 3 Hearts, including a rescue. Outside battle: 1 action and a teammate in your region.</p><button class="choice" id="packHeal" '+(inventory['Healing Kit']>0&&actions>0&&!players[active].ko?'':'disabled')+'>USE HEALING KIT</button><p>Armour automatically blocks one enemy hit. Shock Bombs and Shield Packs are used during battles.</p><button class="choice alt" id="closePack">BACK TO ISLAND</button>');
 $('closePack').addEventListener('click',closeModal);$('packHeal').addEventListener('click',()=>showHealingTargets(false,'kit'));
}
function encounterEligible(){return !gameOver&&!battle&&players[active].loc!=="Centre"&&!players[active].ko&&actions>0;}
function checkEncounter(){
 const stamp=round+":"+active;
 if(encounterStamp===stamp)return false;
 encounterStamp=stamp;queueSave();
 if(!encounterEligible()||Math.random()>=.25)return false;
 const choices=round<4?['EvilKitty','Eyes']:Object.keys(enemyBook);
 startBattle(choices[Math.floor(Math.random()*choices.length)]);return true;
}
function beginJourneyTurn(){closeModal();render();checkEncounter();}
function startBattle(enemy){
 if(battle||gameOver)return;
 if(players.every(p=>p.ko)){lose("The whole team was knocked out.");return;}
 const order=Array.from({length:4},(_,i)=>(active+i)%4),hp=enemyBook[enemy].hp+Math.min(6,Math.max(0,round-1));
 battle={enemy,phase:'intro',hp,maxHp:hp,round:1,turn:order.find(i=>!players[i].ko),order,acted:[false,false,false,false],guard:[0,0,0,0],marked:false,intent:0,tick:0,log:[]};
 battle.intent=chooseEnemyTarget();encounterStamp=round+":"+active;showBattle();queueSave();
}
function chooseEnemyTarget(){const alive=players.map((p,i)=>i).filter(i=>!players[i].ko);return alive[Math.floor(Math.random()*alive.length)];}
function battleLog(message){battle.log.push(message);battle.log=battle.log.slice(-8);}
function battleHero(i){return '<div class="battleHero '+(battle.turn===i?'current':'')+'">'+portrait(players[i].role,'')+'<b>'+players[i].role+'</b><small>'+controllerHTML(i)+'</small><span>'+(players[i].ko?'Knocked out':'♥ '+players[i].hp+'/5')+'</span><small>Guard '+battle.guard[i]+(battle.acted[i]?' · acted':'')+'</small></div>';}
function showBattle(){
 if(!battle||gameOver)return;
 const b=battle,e=enemyBook[b.enemy],i=b.turn,w=weaponBook[i];
 if(b.phase==='won'){
  showModal('<div class="battleEnemy" aria-hidden="true">✨</div><h2>TEAM VICTORY!</h2><p>'+e.name+' is defeated. Everyone’s map position and journey actions are preserved.</p><p><b>Loot: 1 Gold, 1 Food, and 2 '+weaponBook[b.order[0]].ammo+'.</b></p><div class="battleTeam">'+players.map((_,j)=>battleHero(j)).join('')+'</div><button class="choice" id="leaveBattle">CONTINUE JOURNEY</button>',false);
  $('leaveBattle').addEventListener('click',finishBattle);return;
 }
 const header='<div class="battleHeading"><span class="battleEnemy" aria-hidden="true">'+e.icon+'</span><div><h2>'+e.name+'</h2><b>♥ '+b.hp+' / '+b.maxHp+'</b><p>Battle round '+b.round+' · Next hit: '+players[b.intent].role+' for '+e.damage+' damage</p></div></div>';
 const team='<div class="battleTeam">'+players.map((_,j)=>battleHero(j)).join('')+'</div>';
 if(b.phase==='intro'){
  showModal(header+'<p>The whole team joins this battle. Map positions do not change, and the journey pauses.</p>'+team+'<p>Each standing character takes <b>one combat action</b>, then the enemy attacks. Use weapons, Guard, and healing together. Basic attacks need no weapon or ammunition.</p><button class="choice" id="beginBattle">BATTLE TOGETHER</button>',false);
  $('beginBattle').addEventListener('click',()=>{if(!battle||battle.phase!=='intro')return;battle.phase='player';battle.tick++;showBattle();queueSave();});return;
 }
 const token=b.tick;
 showModal('<div class="battleScreen"><div>'+header+team+'</div><div><h3>'+controllerHTML(i)+' · '+players[i].role+' acts</h3><p class="battleHint">'+w.detail+(b.marked?' Enemy marked: next attack +1.':'')+'</p><div class="battleActions"><button class="choice" id="basicAttack">BASIC ATTACK · 2</button><button class="choice" id="weaponAttack" '+(gear.weapons[i]&&gear.ammo[w.ammo]>0?'':'disabled')+'>'+w.icon+' '+w.name+' · '+(gear.weapons[i]?gear.ammo[w.ammo]+' '+w.ammo:'NOT FOUND')+'</button><button class="choice" id="guardBattle">GUARD · block 2</button><button class="choice" id="kitBattle" '+(inventory['Healing Kit']>0?'':'disabled')+'>HEALING KIT · '+inventory['Healing Kit']+'</button><button class="choice" id="foodBattle" '+(res.Food>0?'':'disabled')+'>FOOD · heal 1 ('+res.Food+')</button><button class="choice" id="bombBattle" '+(inventory['Shock Bomb']>0?'':'disabled')+'>SHOCK BOMB · 5 ('+inventory['Shock Bomb']+')</button><button class="choice" id="shieldBattle" '+(inventory['Shield Pack']>0?'':'disabled')+'>SHIELD PACK · '+inventory['Shield Pack']+'</button>'+(i===3?'<button class="choice" id="careBattle">MEDIC CARE · heal 3</button>':'')+'</div><p>Weapon shots use 1 ammo. Healing, Guard, and items each use this character’s combat action.</p><div class="battleLog" role="status">'+b.log.map(x=>'<div>'+escapeText(x)+'</div>').join('')+'</div></div></div>',false);
 $('basicAttack').addEventListener('click',()=>battleAction('basic',null,token));
 $('weaponAttack').addEventListener('click',()=>battleAction('weapon',null,token));
 $('guardBattle').addEventListener('click',()=>battleAction('guard',null,token));
 $('bombBattle').addEventListener('click',()=>battleAction('bomb',null,token));
 for(const [id,type] of [['kitBattle','kit'],['foodBattle','food'],['shieldBattle','shield'],['careBattle','care']])if($(id))$(id).addEventListener('click',()=>showHealingTargets(true,type));
}
function showHealingTargets(inBattle,type){
 const i=inBattle?battle.turn:active,token=inBattle?battle.tick:0;
 const label=type==='shield'?'Give 4 Guard':type==='care'?'Medic care: heal 3':type==='food'?'Food: heal 1':'Healing Kit: heal 3';
 const eligible=players.map((p,j)=>({p,j})).filter(({p})=>(inBattle||p.loc===players[active].loc)&&(type==='shield'?!p.ko:p.hp<5&&(type!=='food'||!p.ko)));
 showModal('<h2>'+label+'</h2><p>Choose a teammate. '+(type==='kit'||type==='care'?'Can revive a knocked-out survivor.':'')+'</p>'+eligible.map(({p,j})=>'<button class="choice healTarget" data-target="'+j+'">'+p.role+' · '+controllerHTML(j)+' · ♥ '+p.hp+'/5</button>').join('')+(eligible.length?'':'<p>No eligible teammate. Nothing will be spent.</p>')+'<button class="choice alt" id="cancelTarget">BACK</button>',false);
 $('modal').querySelectorAll('[data-target]').forEach(button=>button.addEventListener('click',()=>{
  const j=Number(button.dataset.target);
  if(inBattle){battleAction(type,j,token);return;}
  if(inventory['Healing Kit']<1||players[j].loc!==players[active].loc||players[j].hp>=5||!spendAction())return;
  inventory['Healing Kit']--;heal(j,3);closeModal();render();
 }));
 $('cancelTarget').addEventListener('click',()=>inBattle?showBattle():showPack());
}
function battleAction(kind,target,token){
 if(!battle||battle.phase!=='player'||gameOver||token!==battle.tick)return false;
 const b=battle,i=b.turn,p=players[i],w=weaponBook[i];
 if(p.ko||b.acted[i])return false;
 let damage=0;
 if(kind==='basic')damage=2;
 else if(kind==='weapon'){
  if(!gear.weapons[i]||gear.ammo[w.ammo]<1)return false;
  gear.ammo[w.ammo]--;damage=w.damage;
  if(i===2)b.guard[i]=Math.max(b.guard[i],2);
  if(i===3){const hurt=b.order.filter(j=>!players[j].ko&&players[j].hp<5).sort((a,c)=>players[a].hp-players[c].hp)[0];if(hurt!==undefined){players[hurt].hp++;battleLog('Spark Staff restored 1 Heart to '+players[hurt].role+'.');}}
 }else if(kind==='bomb'){if(inventory['Shock Bomb']<1)return false;inventory['Shock Bomb']--;damage=5;}
 else if(kind==='guard'){b.guard[i]=Math.max(b.guard[i],2);battleLog(p.role+' guards against the next hit.');}
 else if(['kit','food','care','shield'].includes(kind)){
  if(!Number.isInteger(target)||target<0||target>3)return false;
  const patient=players[target];
  if(kind==='shield'){
   if(patient.ko||inventory['Shield Pack']<1)return false;
   inventory['Shield Pack']--;b.guard[target]=4;battleLog(patient.role+' gained 4 Guard.');
  }else{
   if(patient.hp>=5||(kind==='food'&&patient.ko)||(kind==='care'&&i!==3)||(kind==='kit'&&inventory['Healing Kit']<1)||(kind==='food'&&res.Food<1))return false;
   if(kind==='kit')inventory['Healing Kit']--;if(kind==='food')res.Food--;
   const before=patient.hp;patient.hp=Math.min(5,patient.hp+(kind==='kit'?3:kind==='care'?3:1));patient.ko=false;
   battleLog(p.role+' restored '+(patient.hp-before)+' Hearts to '+patient.role+'.');
  }
 }else return false;
 if(damage){
  if(b.marked){damage++;b.marked=false;}
  b.hp=Math.max(0,b.hp-damage);battleLog(p.role+' dealt '+damage+' damage.');
  if(kind==='weapon'&&i===0)b.marked=true;
 }
 b.tick++;b.acted[i]=true;
 if(b.hp===0){
  b.phase='won';battlesWon++;res.Gold++;res.Food++;gear.ammo[weaponBook[b.order[0]].ammo]+=2;
  monsters[b.enemy]=null;discoveries.add('Defeated '+enemyBook[b.enemy].name);
 }else advanceBattle();
 render();if(!gameOver)showBattle();queueSave();return true;
}
function advanceBattle(){
 const b=battle,start=b.order.indexOf(b.turn);
 const next=Array.from({length:4},(_,n)=>b.order[(start+n+1)%4]).find(i=>!players[i].ko&&!b.acted[i]);
 if(next!==undefined){b.turn=next;return;}
 let target=b.intent;if(players[target].ko)target=chooseEnemyTarget();
 const attack=enemyBook[b.enemy].damage,blocked=Math.min(attack,b.guard[target]);b.guard[target]=0;
 let damage=attack-blocked;
 if(damage>0&&inventory.Armour>0){inventory.Armour--;damage=0;battleLog('Armour blocked the enemy hit.');}
 players[target].hp=Math.max(0,players[target].hp-damage);players[target].ko=players[target].hp===0;
 battleLog(enemyBook[b.enemy].name+' hit '+players[target].role+' for '+damage+(blocked?' ('+blocked+' blocked)':'')+'.');
 if(players.every(p=>p.ko)){battle=null;lose('The enemy knocked out the whole team.');return;}
 b.round++;b.acted.fill(false);b.turn=b.order.find(i=>!players[i].ko);b.intent=chooseEnemyTarget();
}
function finishBattle(){
 if(!battle||battle.phase!=='won')return;
 battle=null;closeModal();
 if(players[active].ko){explorerSteps=0;moveMode=false;actions=0;}
 render();toast('Battle won! Continue the journey with your remaining actions.');
}
function win(){
 battle=null;gameOver=true;outcome='won';clearTimeout(travelTimer);travelBusy=false;
 const friends=Object.keys(recruited).filter(k=>recruited[k]);
 showModal('<div class="endingScene"><img src="assets/island-v015.png" alt="The island you escaped"><div class="endingPortal">🌀</div></div><h2>YOU ESCAPED TOGETHER!</h2><p>The Core hums. The Crystal shines. The Portal Ring opens a path home.</p><div class="endingTeam">'+players.map((p,i)=>'<div>'+portrait(p.role,'')+'<b>'+p.role+'</b><small>'+controllerHTML(i)+'</small></div>').join('')+'</div><p>All four survivors step through the portal'+(friends.length?', with '+friends.join(', ')+' beside them':'')+'. The island fades behind you.</p><p><b>The Lost Helicopter Journal is complete.</b><br>'+battlesWon+' battles won · '+round+' journey rounds</p><button class="choice" id="restart">PLAY A NEW ADVENTURE</button>',false);
 $('restart').addEventListener('click',()=>{saveEnabled=false;try{localStorage.removeItem(SAVE_KEY);}catch{}location.reload();});queueSave();
}
