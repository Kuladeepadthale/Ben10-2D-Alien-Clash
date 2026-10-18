'use strict';
// A button starts an independent sequence. Frames are selected, never mixed.
class ActionClipPlayer{
 constructor(map){this.map=map;this.action='idle';this.elapsed=0;this.walkHeld=false;}
 press(action){if(action==='walk'){this.walkHeld=true;if(this.action==='idle'){this.action='walk';this.elapsed=0;}return true;}if(!this.map.clips[action]||!['idle','walk'].includes(this.action))return false;this.action=action;this.elapsed=0;return true;}
 releaseWalk(){this.walkHeld=false;if(this.action==='walk'){this.action='idle';this.elapsed=0;}}
 duration(action=this.action){const c=this.map.clips[action];return !c?Infinity:c.durations?c.durations.reduce((a,b)=>a+b,0):c.frames.length/c.fps;}
 update(dt){this.elapsed+=Math.max(0,dt);if(!['idle','walk'].includes(this.action)&&this.elapsed>=this.duration()){this.action=this.walkHeld?'walk':'idle';this.elapsed=0;}}
 frame(){const c=this.map.clips[this.action];if(!c)return this.map.clips.walk.frames[0];let i;if(c.durations){let e=this.elapsed;i=0;while(i<c.durations.length-1&&e>=c.durations[i])e-=c.durations[i++];}else i=Math.floor(this.elapsed*c.fps)%c.frames.length;return c.frames[i];}
}
module.exports={ActionClipPlayer};
