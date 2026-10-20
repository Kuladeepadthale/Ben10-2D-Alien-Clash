'use strict';
// Shared by the app and battle server. Emails and markup are never public names.
globalThis.AlienPlayerName=Object.freeze({
 normalize(value){if(typeof value!=='string')return '';const name=value.normalize('NFKC').trim().replace(/\s+/g,' ');return Array.from(name).length>=3&&Array.from(name).length<=18&&/^[\p{L}\p{N} _-]+$/u.test(name)?name:'';}
});
