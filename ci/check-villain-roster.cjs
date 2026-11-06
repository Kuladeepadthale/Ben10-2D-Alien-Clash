const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Exercise the actual loader list so a committed atlas cannot be forgotten.
const loaded = [], registry = new Map();
const context = vm.createContext({
  Promise,
  registerRedrawnVillain(data) {
    assert(!registry.has(data.id), `Duplicate villain id ${data.id}`);
    registry.set(data.id, data);
  },
  document: {
    createElement: () => ({}),
    head: { appendChild(script) {
      const path = 'web/' + script.src.split('?')[0];
      loaded.push(path);
      vm.runInContext(fs.readFileSync(path, 'utf8'), context, {filename: path});
      script.onload();
    } }
  }
});
vm.runInContext(fs.readFileSync('web/villain-data.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('web/redrawn-villains-list.js', 'utf8'), context);
context.redrawnVillainScriptsReady.then(() => {
  const roster = vm.runInContext('VILLAIN_DATA.characters', context);
  assert.equal(registry.size, roster.length, 'Every villain must have an enabled atlas');
  assert.equal(loaded.length, new Set(loaded).size, 'No duplicate script requests');
  const html = fs.readFileSync('web/index.html', 'utf8');
  assert(html.indexOf('src="redrawn-villains.js?') < html.indexOf('src="redrawn-villains-list.js?'));
  for (let id = 0; id < roster.length; id++) {
    const data = registry.get(id);
    assert(data, `Missing ${roster[id].name}`);
    assert.equal(data.status, 'new-drawings-integrated');
    assert.equal(data.frames.length, 32);
    for (const state of ['idle','walk','normal','skill0','skill1','skill2','ultimate','guard','hit']) {
      assert(data.clips[state]?.length, `${roster[id].name}: missing ${state}`);
      for (const frame of data.clips[state]) assert(data.frames[frame]);
    }
  }
  console.log(`PASS: all ${roster.length} villains enabled, unique ids, complete action clips, actual script loader and page order.`);
}).catch(error => { console.error(error); process.exitCode = 1; });
