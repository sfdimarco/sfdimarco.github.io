import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACTS, handoff, rehearsal, shot, safeNumber } from '../src/lib/ftWorkshopState.js';

test('an early release cannot remove the supporting hand', () => {
  for (const [braced, offered] of [[false, false], [true, false], [false, true]]) {
    const state = handoff({ braced, offered, released: true });
    assert.equal(state.delivered, false);
    assert.ok(state.kip.hands['1']);
  }
});
test('the receiver supports the tray before the sender releases it', () => {
  const both = handoff({braced:true, offered:true});
  const complete = handoff({braced:true, offered:true, released:true});
  assert.ok(both.kip.hands['1']);
  assert.ok(both.lo.hands['-1']);
  assert.equal(complete.delivered, true);
  assert.equal(complete.kip.hands['1'], undefined);
  assert.deepEqual(complete.lo.hands['-1'], both.lo.hands['-1']);
});
test('every sampled rehearsal frame has a support and is deterministic', () => {
  for (const pause of [0, .6, 1.8]) for (let time=0; time<=4.8+pause; time+=.033) {
    const state = rehearsal(time, pause);
    const touching = (hand,contact) => hand?.every((v,i)=>Math.abs(v-contact[i])<1e-8);
    assert.ok(touching(state.kip.hands['1'],CONTACTS.kip) || touching(state.lo.hands['-1'],CONTACTS.lo));
    assert.deepEqual(state, rehearsal(time,pause));
  }
});
test('pause length changes the release time, not the action ordering', () => {
  assert.equal(rehearsal(2, 0).beat, 'release');
  assert.equal(rehearsal(2, 1.8).beat, 'pause');
  assert.equal(rehearsal(20, .6).beat, 'reaction');
});
test('camera changes never mutate the rehearsal geometry', () => {
  const state = rehearsal(1.5, .6), before = structuredClone(state);
  assert.notDeepEqual(shot('wide'), shot('close'));
  assert.notDeepEqual(shot('close'), shot('lost'));
  assert.deepEqual(shot('invalid'), shot('wide'));
  assert.deepEqual(state,before);
});
test('invalid timeline input is clamped to a stable opening frame', () => {
  assert.deepEqual(rehearsal(NaN,Infinity),rehearsal(0,.6));
  assert.equal(safeNumber(-5,0,2,1),0);
  assert.equal(safeNumber(8,0,2,1),2);
});
