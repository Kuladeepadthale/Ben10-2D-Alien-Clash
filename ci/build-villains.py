"""Pack complete classic villain poses and generate their campaign-only combat kits."""
from pathlib import Path
from io import BytesIO
import json,shutil
import numpy as np
from PIL import Image
from full_poses import whole_poses

ROOT=Path(__file__).resolve().parents[1];WEB=ROOT/'web';SRC=ROOT/'ci/cel-sources'
defs=json.loads((ROOT/'ci/villain-designs.json').read_text());OUT=WEB/'assets/villains';OUT.mkdir(parents=True,exist_ok=True)

def power(name,kind,damage,cooldown,reach,**kw):return dict(name=name,kind=kind,damage=damage,cooldown=cooldown,range=reach,windup=.4,recovery=.4,**kw)
def kit(tag):
    groups={
    'Human':('pulse',['Null ray','Containment net','Plumber grenade','Null barrage']),
    'Hypnosis':('phase',['Hypnotic wave','Trance ray','Pocketwatch trap','Mass hypnosis']),
    'Acid':('slime',['Acid spit','Corrosive breath','Toxic cloud','Acid torrent']),
    'Hair':('bandage',['Hair whip','Acrobatic dive','Hair sweep','Hair barrage']),
    'Brawler':('slam',['Heavy fist','Ground shock','Brutal charge','Titan crash']),
    'Swarm':('vine',['Insect swarm','Swarm cloud','Beetle trap','Insect storm']),
    'Tech':('electric',['Cannon bolt','Laser sweep','Cyber charge','Drone barrage']),
    'Mutation':('pulse',['Mutation ray','Mutant grenade','DNA trap','Mutation storm']),
    'Fear':('phase',['Fear wave','Nightmare cloud','Clown rush','Terror wave']),
    'Slime':('slime',['Elastic strike','Slime shot','Liquid lunge','Slime flood']),
    'Fungus':('vine',['Spore shot','Spore trap','Fungal roots','Fungal eruption']),
    'Hunter':('pulse',['Blaster bolt','Explosive charge','Hunter rush','Hunter barrage']),
    'Knight':('crystal',['Energy slash','Knight wave','Shield charge','Royal strike']),
    'Ninja':('dash',['Ninja rush','Energy shuriken','Blade flurry','Ninja blitz']),
    'Electric':('electric',['Electric bolt','Static field','Charged rush','Electric storm']),
    'Sonic':('sonic',['Sonic howl','Claw flurry','Predator pounce','Full-moon howl']),
    'Bandage':('bandage',['Bandage lash','Binding wave','Sand rush','Royal bind']),
    'Robot':('electric',['Arena beam','Laser bolt','Metal strike','System overload']),
    'Weather':('frost',['Frost ray','Storm wave','Weather grenade','Weather disaster']),
    'Magic':('phase',['Magic bolt','Binding spell','Mystic wave','Arcane storm']),
    'Parasite':('bite',['Crushing bite','Parasite charge','Draining field','Great impact']),
    'Amalgam':('crystal',['Crystal blast','Four-arm strike','Energy beam','Amalgam rampage']),
    'Spectral':('phase',['Phantom lunge','Tentacle lash','Spectral wave','Nightmare sweep']),
    'Warlord':('slam',['Cyber fist','Shock slam','Warlord beam','Conqueror impact'])}
    typ,names=groups[tag]
    layouts={
    'Human':['projectile','trap','lob','rain'],'Hypnosis':['wave','beam','trap','wave'],
    'Acid':['projectile','beam','vortex','beam'],'Hair':['melee','pounce','wave','melee'],
    'Brawler':['melee','ground','rush','leapslam'],'Swarm':['projectile','vortex','trap','rain'],
    'Tech':['projectile','beam','rush','rain'],'Mutation':['projectile','lob','trap','rain'],
    'Fear':['wave','vortex','rush','wave'],'Slime':['melee','projectile','rush','wave'],
    'Fungus':['projectile','trap','spikes','spikes'],'Hunter':['projectile','lob','rush','rain'],
    'Knight':['melee','wave','rush','melee'],'Ninja':['rush','projectile','melee','rush'],
    'Electric':['projectile','vortex','rush','rain'],'Sonic':['wave','melee','pounce','wave'],
    'Bandage':['melee','wave','rush','wave'],'Robot':['beam','projectile','melee','beam'],
    'Weather':['beam','wave','lob','rain'],'Magic':['projectile','trap','wave','rain'],
    'Parasite':['melee','rush','vortex','leapslam'],'Amalgam':['projectile','melee','beam','rush'],
    'Spectral':['rush','melee','wave','wave'],'Warlord':['melee','ground','beam','leapslam']}
    powers=[]
    for i,(name,kind) in enumerate(zip(names,layouts[tag])):
        extra={};reach=600
        if kind in ['projectile','wave']:extra.update(speed=570,radius=22 if kind=='projectile' else 55)
        if kind=='lob':extra.update(speed=470,radius=65)
        if kind in ['rush','pounce']:extra.update(speed=750,duration=.6,ticks=2);reach=500
        if kind=='beam':extra.update(ticks=4,duration=.5);reach=650
        if kind=='melee':extra.update(ticks=2,duration=.3);reach=200 if tag not in ['Hair','Bandage','Spectral'] else 260
        if kind=='ground':reach=340
        if kind=='trap':extra.update(duration=2.5,radius=85);reach=330
        if kind=='vortex':extra.update(ticks=4,duration=.65);reach=200
        if kind=='spikes':extra.update(ticks=4 if i==3 else 1,duration=1.0 if i==3 else .1);reach=650 if i==3 else 430
        if kind=='rain':extra.update(ticks=6,duration=1.8);reach=900
        if kind=='leapslam':extra.update(duration=1.2);reach=450
        if typ in ['frost','bandage','slime'] and kind in ['projectile','wave','beam','trap']:extra['slow']=1.3
        if tag in ['Spectral','Fear'] and kind=='rush':extra['phase']=True
        powers.append(power(name,kind,290 if i==3 else 115+i*15,0 if i==3 else 5+i,reach,**extra))
    return typ,dict(strength=1,scale=1,skills=powers[:3],ultimate=powers[3])

def save(im,path):
    buf=BytesIO();im.save(buf,'PNG',compress_level=3);raw=buf.getvalue();Image.open(BytesIO(raw)).load();path.write_bytes(raw)

result=[]
for index,(slug,name,design,tag) in enumerate(defs):
    poses=whole_poses(Image.open(SRC/(slug+'-villain.png')),4,4)
    assert len(poses)==16
    side=max(max(im.size) for im,_ in poses)+40;atlas=Image.new('RGBA',(side*4,side*4));frames=[]
    for i,(im,meta) in enumerate(poses):
        x=i%4*side+(side-im.width)//2;y=i//4*side+side-20-im.height
        atlas.paste(im,(x,y));a=np.array(im);yy,xx=np.indices(a.shape[:2]);band=(a[:,:,3]>180)&(yy>im.height*.48)&(yy<im.height*.72);anchor=float(np.median(xx[band])) if band.any() else im.width/2
        frames.append(dict(rect=[x-8,y-8,im.width+16,im.height+16],origin=[round(anchor+8,2),im.height+8],**meta))
    folder=OUT/slug;folder.mkdir(exist_ok=True);save(atlas,folder/'actions.png')
    portrait=poses[0][0].copy();portrait.thumbnail((280,350),Image.Resampling.LANCZOS);save(portrait,folder/'portrait.png')
    typ,conf=kit(tag);height=160 if slug=='megawatt' else 180 if slug in ['kraab','mycelium'] else 235 if slug in ['vilgax','thumbskull','dr-viktor','great-one'] else 226
    colors={'pulse':'#ace7c1','phase':'#c4a1f5','slime':'#b5dc6b','bandage':'#e2c990','slam':'#eeb383','vine':'#9bd88e','electric':'#a6e8ff','crystal':'#a6e3d5','dash':'#d6bccf','sonic':'#c8eaf0','frost':'#b7e6ff','bite':'#e4c89a'}
    result.append(dict(id=index,slug=slug,name=name,description={'Human':'A corrupt former Plumber with stolen alien equipment.','Hypnosis':'A hypnotist whose pocketwatch powers slow and trap opponents.','Acid':'A circus villain armed with corrosive breath.','Hair':'An acrobat who attacks with her powerful living hair.','Brawler':'A heavy brawler with crushing strikes and ground attacks.','Swarm':'An insect controller who fights with swarms and traps.','Tech':'An armored cyborg with alien cannons.','Mutation':'A mad scientist who weaponizes mutation technology.','Fear':'A sinister clown who uses fear against his opponents.','Slime':'A shape-shifting alien invader with an elastic body.','Fungus':'A fungal enemy who attacks with spores and roots.','Hunter':'An armed hunter with ranged weapons and a dangerous rush.','Knight':'An armored foe using stolen alien technology.','Ninja':'A robotic ninja with quick blades and projectiles.','Electric':'An electrical foe with bolts and charged attacks.','Sonic':'An alien werewolf with claws and a sonic howl.','Bandage':'An alien mummy who stretches living bandages.','Robot':'An arena-master robot with powerful energy weapons.','Weather':'A weather machine armed with cold and storm attacks.','Magic':'A sorcerer who combines energy spells with traps.','Parasite':'A giant alien parasite, scaled to fit the arena.','Amalgam':'Kevin in his original mutated amalgam form.','Spectral':'Ghostfreak in his villainous true form.','Warlord':'The Classic cybernetic warlord and the final threat.'}[tag],type=typ,color=colors[typ],height=height,bodyHeight=height*.9,src='assets/villains/'+slug+'/actions.png',portrait='assets/villains/'+slug+'/portrait.png',referenceHeight=poses[0][0].height,frames=frames,kit=conf))
    print(name+': 16 whole-body villain poses')
data=dict(version=1,characters=result)
(WEB/'villain-data.js').write_text("'use strict';\nconst VILLAIN_DATA="+json.dumps(data,separators=(',',':'))+';\n')
(OUT/'manifest.json').write_text(json.dumps(data,indent=2))
bundle=ROOT/'builds/web/assets/villains'
if bundle.exists():shutil.rmtree(bundle)
shutil.copytree(OUT,bundle)
shutil.copyfile(WEB/'villain-data.js',ROOT/'builds/web/villain-data.js')
