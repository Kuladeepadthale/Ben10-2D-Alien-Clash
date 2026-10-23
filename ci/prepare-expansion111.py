"""Append new forms without changing existing fighter IDs or kits."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1];W=R/'web'
designs=json.loads((R/'ci/expansion111-specs.json').read_text())
def s(name,kind,damage,range,**kw):
 d=dict(name=name,kind=kind,damage=damage,cooldown=6,range=range,windup=.34,recovery=.42);d.update(kw);return d
def melee(n,d=150,ticks=3):return s(n,'melee',d,185,ticks=ticks,duration=.55)
def shot(n,kind='projectile',d=130):return s(n,kind,d,820,speed=720,radius=15,ticks=4 if kind=='beam' else 1,duration=.48 if kind=='beam' else .1)
def ult(n,kind='rush',**kw):
 d=dict(cooldown=0,windup=.65,ticks=5,duration=1.5,speed=900);d.update(kw);return s(n,kind,325,d.pop('range',800),**d)
kits=[
 [melee('Apex claw flurry'),s('Predator lunge','pounce',155,440,speed=730),melee('Tail sweep',145,1),ult('Feral onslaught')],
 [shot('Mouth web snare'),s('Gorilla ground smash','ground',165,300,windup=.55),melee('Spider-leg rake'),ult('Arachnid rampage')],
 [shot('Cosmic forearm ray','beam',155),s('Colossal stomp','ground',175,350,windup=.65),melee('Giant uppercut',175,1),ult('Ultimate cosmic ray','beam',range=1000)],
 [shot('Shoulder frost cannon','beam',145),shot('Ice cannon shell','lob',150),s('Glacial field','spikes',160,450,windup=.6),ult('Twin cannon blizzard','beam',range=1000)],
 [shot('Gravity core pulse'),s('Orbital gravity well','vortex',150,250,ticks=5,duration=.85),s('Moonfall','lob',170,650,radius=65,speed=550),ult('Planetary compression','vortex',range=300)],
 [melee('Twin-claw frenzy',165),s('Appoplexian pounce','pounce',160,450,speed=760),melee('Savage uppercut',175,1),ult('Ultimate claw rampage')],
 [shot('Third-eye beam','beam',140),s('Psychic barrier','vortex',145,240,ticks=4,duration=.75),shot('Hoverchair cannon',d=145),ult('Cerebral overload','beam',range=1000)],
 [melee('Metal-claw barrage'),melee('Steel-jaw bite',165,1),s('Wolf pounce','pounce',155,440,speed=740),ult('Armored wolf frenzy')],
 [shot('Optic corruption beam','beam',140),melee('Liquid spike strike'),shot('Circuit pulse','wave',150),ult('Corruption overload','beam',range=950)],
 [shot('Violet crystal shard'),s('Crystalline eruption','spikes',160,450,windup=.55),melee('Crystal-fist combo'),ult('Purple crystal cascade','spikes',range=700)],
 [shot('Crystallizing flame'),s('Dark crystal trap','trap',155,400,duration=3,radius=90),melee('Crystalline claw'),ult('Matter crystallization','spikes',range=700)],
 [shot('Magma fireball'),shot('Flame stream','beam',150),s('Volcanic eruption','eruption',170,400,radius=75,windup=.6),ult('Magma storm','rain',range=900)],
 [melee('Raptor claw combo',165),melee('Spiked tail sweep',170,1),s('Raptor stomp','ground',175,340,windup=.6),ult('Raptor stampede')],
 [melee('Four-fist barrage',165,4),shot('Four-arm thunderclap','wave',145),s('Quad ground pound','ground',175,330,windup=.6),ult('Four-arm fury')],
 [s('Velocity tackle','rush',125,620,speed=1100,windup=.22),s('Wheel cyclone','vortex',145,190,ticks=5,duration=.8),melee('High-speed kick',145,3),ult('Maximum velocity',speed=1450)],
 [shot('Mouth slime shot'),shot('Toxic goo arc','lob',150),s('Armored moth dive','pounce',155,460,speed=720),ult('Slime bombardment','rain',range=900)],
 [shot('Thorn dart'),melee('Twin-vine lash',155,2),s('Thorn-root eruption','spikes',165,440,windup=.55),ult('Thorn forest','spikes',range=700)],
 [shot('Forearm water jet','beam',140),shot('Pressure globule',d=145),shot('Undertow surge','wave',155),ult('Hydro-pressure torrent','beam',range=1000)],
 [s('Spiked shell roll','rush',145,570,speed=800),s('Wrecking crash','leapslam',170,420,duration=1.1),melee('Heavy shell strike',165,1),ult('Wreckingbolt rampage')],
 [shot('Cosmic hand blast','beam',150),melee('Celestial crusher',175,1),s('Void gravity field','vortex',165,260,ticks=5,duration=.85),ult('Celestial annihilation','beam',range=1000)]
]
colors=['#b8292d','#8070b7','#7dc9ff','#a3eaff','#bd84f5','#efb3db','#ed5a60','#acbdd0','#66baff','#bd83ed','#ff7b87','#ffb84d','#df5d4e','#d4a4ed','#5cd8cf','#e6c74d','#a1dc65','#4cc8f3','#ffe377','#9ee8bf']
themes=['physical','web','energy','ice','gravity','physical','energy','physical','tech','crystal','fire','fire','physical','physical','wind','goo','plant','water','physical','energy']
types=['pounce','web','cosmic','frost','gravity','claw','cosmic','claw','beam','crystal','fire','fire','slam','slam','dash','slime','vine','water','shell','cosmic']
ranks=[3,3,4,3,4,3,4,2,2,2,2,2,3,2,1,2,2,2,2,4]
result=[]
for i,(slug,name,design,gait,source,theme) in enumerate(designs):
 a=dict(name=name,species=('ULTIMATE FORM' if i<7 else 'ANTITRIX FORM' if i<19 else 'CELESTIAL FUSION'),color=colors[i],light=colors[i],dark='#192733',type=types[i],effectTheme=themes[i],speed=400 if i==14 else 280 if i in [0,5,7] else 245,strength=1.15 if i in [2,5,12,13,19] else 1,scale=1,desc=design[0].upper()+design[1:]+'.',skills=kits[i][:3],ultimate=kits[i][3],powerOrigin=[.9,.43],rarity=ranks[i])
 if i in [1,2,3,4,6,8,9,10,11,15,16,17,19]:a['basicSkillIndex']=0
 if i==1:a['powerOrigins']={'skill0':[.84,.23]}
 if i==3:a['powerOrigins']={'skill0':[.68,.2],'skill1':[.68,.2],'ultimate':[.68,.2]}
 if i==4:a['powerOrigin']=[.55,.5]
 if i==6:a['powerOrigins']={'skill0':[.65,.18],'skill2':[.88,.65],'ultimate':[.65,.18]}
 if i==8:a['powerOrigins']={'skill0':[.64,.15],'ultimate':[.64,.15]}
 if i==15:a['powerOrigins']={'skill0':[.83,.24],'skill1':[.83,.24],'ultimate':[.83,.24]}
 result.append(a)
source=(W/'data.js').read_text();begin='\n// expansion111: append forms without renumbering the existing collection.\n';end='\n// end expansion111\n'
if begin in source:source=source.split(begin)[0]+source.split(end,1)[1]
block=begin+'aliens.push(...'+json.dumps(result,separators=(',',':'))+');'+end
assert 'const ALIEN_COUNT=aliens.length;' in source
source=source.replace('const ALIEN_COUNT=aliens.length;',block+'const ALIEN_COUNT=aliens.length;');(W/'data.js').write_text(source)
names=json.loads((R/'ci/roster.json').read_text())[:72]+[a[0] for a in designs];(R/'ci/roster.json').write_text(json.dumps(names,indent=2)+'\n')
p=W/'progression.js';t=p.read_text();t=re.sub(r'(const ALIEN_RANKS=)(\[[^\n]*?\]);',lambda m:m[1]+json.dumps(json.loads(m[2])[:72]+ranks,separators=(',',':'))+';',t);p.write_text(t)
p=W/'cartoon-gaits.js';t=p.read_text().split('// expansion111 gaits')[0].rstrip();g=[dict(style=a[3]+' movement',stride=1.02 if a[3]=='skate' else .85,bob=.4,hover=a[3]=='hover',skate=a[3]=='skate') for a in designs];p.write_text(t+'\n// expansion111 gaits\nCARTOON_GAITS.push(...'+json.dumps(g,separators=(',',':'))+');\n')
p=W/'account-cloud.js';p.write_text(p.read_text().replace('p.aliens.length<=72','p.aliens.length<=92'))
(R/'ci/expansion111-kits.json').write_text(json.dumps(result,indent=2)+'\n')
print('Prepared 20 fighters, 80 skills, 92-actor progression and account migration.')
