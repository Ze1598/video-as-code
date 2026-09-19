import test from 'node:test';
import assert from 'node:assert/strict';
import {compileEssay,frameState,renderSvg,type Scene} from '../src/lib/essay-sdk/index.ts';
const scene = (labels: string[]): Scene => ({id:'list',duration:300,narration:[],groups:[{id:'team',label:'Engineering',members:3}],items:labels.map((label,i)=>({id:`row-${i}`,label,owner:'team',kind:'work',revealAt:i*60})),transfers:[],topics:[],takeaways:[]});

test('list width comes from rendered glyph widths, not a fixed box or character count',()=>{
  const narrow = frameState(compileEssay({fps:60,scenes:[scene(['iiiiii'])]}),100);
  const wide = frameState(compileEssay({fps:60,scenes:[scene(['WWWWWW'])]}),100);
  assert.ok(narrow.items[0].width < 50);
  assert.ok(wide.items[0].width > 150 && wide.items[0].width < 180);
  for (const state of [narrow,wide]) assert.equal(state.items[0].x+state.items[0].width/2,960);
});

test('the longest line centers the whole left-aligned list, including future rows, regardless of gold or focus',()=>{
  const draft=scene(['Read about AI','Expected productivity gains']);
  draft.topics=[{item:'row-0',group:'team',start:0,end:60},{item:'row-1',group:'team',start:60,end:300}];
  draft.takeaways=[{item:'row-1',start:60,end:300}];
  const movie=compileEssay({fps:60,scenes:[draft]});
  const early=frameState(movie,0), late=frameState(movie,150);
  assert.ok(late.items[0].width>350 && late.items[0].width<400,'fit the actual longest phrase');
  for(const item of late.items){
    assert.equal(item.x,late.items[0].x);
    assert.equal(item.textAnchor,'start');
    assert.equal(item.x+item.width/2,960);
    assert.equal(item.width,Math.max(...late.items.map(i=>i.labelWidth)));
  }
  assert.equal(early.items[0].x,late.items[0].x,'reveal cannot change reserved list width');
  assert.equal(late.cursors[0].x,late.items[1].x-24);
  assert.equal(late.items[1].color,'#EEA530');
});

test('long labels wrap using measured available width and keep wrapping stable through a handoff',()=>{
  const draft=scene(['Wide work moves between teams']);
  draft.groups=[{id:'team',label:'Engineering',members:1},{id:'peer',label:'Peer',members:1},{id:'target',label:'Target',members:1}];
  draft.items[0].label='WWWWWW WWWWWW WWWWWW';
  draft.transfers=[{item:'row-0',to:'target',start:60,end:150}];
  const movie=compileEssay({fps:60,scenes:[draft]});
  for(const frame of [0,75,125,180]){
    const state=frameState(movie,frame);
    assert.ok(state.items[0].width<=400);
    const fragment=renderSvg(state).split('data-item="row-0"')[1].split('</g>')[0];
    assert.equal((fragment.match(/<text /g)??[]).length,2,'measured wrapping is fixed during transfer');
  }
});
