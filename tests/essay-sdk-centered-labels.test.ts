import test from 'node:test';
import assert from 'node:assert/strict';
import { compileEssay, frameState, renderSvg, type Scene } from '../src/lib/essay-sdk/index.ts';

test('centered labels share the actor header axis and keep their cursor near the text', () => {
  const scene: Scene = {id:'center',duration:300,narration:[],groups:[{id:'m',label:'Management',members:1},{id:'e',label:'Engineering',members:3}],items:[{id:'a',label:'Expected productivity gains',owner:'m',kind:'work'},{id:'b',label:'Start using AI',owner:'e',kind:'work'}],topics:[{item:'b',group:'e',start:0,end:300}],transfers:[],takeaways:[],itemAlignment:'center'};
  const state = frameState(compileEssay({fps:60,scenes:[scene]}),60);
  const svg = renderSvg(state);
  for (const item of state.items) {
    const group = state.groups.find(g=>g.id === item.owner)!;
    const fragment = svg.split(`data-item="${item.id}"`)[1].split('</g>')[0];
    assert.match(fragment, new RegExp(`x="${group.x+group.width/2}"`));
    assert.match(fragment, /text-anchor="middle"/);
  }
  assert.ok(state.cursors[0].x > 1150 && state.cursors[0].x < 1300, 'cursor is beside the short centered row, not the 600px slot edge');
});
