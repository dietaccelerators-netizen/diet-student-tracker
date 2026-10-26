const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const Module = require('node:module');
function load(file) {
 const compiled = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const m = new Module(file,module); m.filename=file; m.paths=module.paths;
 m.require = name => name === './PortalIcon' ? load('components/PortalIcon.tsx') : require(name);
 m._compile(compiled,file); return m.exports;
}
const {PortalButton,IconButton,FilterPill}=load('components/PortalControls.tsx');
const render=(C,props)=>renderToStaticMarkup(React.createElement(C,props,'Save'));
let html=render(PortalButton,{loading:true,disabled:false,loadingLabel:'Saving papers…'});
assert.match(html,/disabled=""/);assert.match(html,/aria-busy="true"/);assert.match(html,/Saving papers…/);assert.doesNotMatch(html,/>Save</);
html=render(PortalButton,{});assert.match(html,/type="button"/);assert.doesNotMatch(html,/disabled|aria-busy/);
assert.match(render(PortalButton,{type:'submit'}),/type="submit"/);
assert.match(render(PortalButton,{disabled:true}),/disabled=""/);
html=renderToStaticMarkup(React.createElement(IconButton,{label:'Close dialog',icon:'close'}));
assert.match(html,/aria-label="Close dialog"/);assert.match(html,/aria-hidden="true"/);assert.match(html,/focusable="false"/);
assert.match(render(FilterPill,{selected:true}),/aria-pressed="true"/);assert.match(render(FilterPill,{selected:false}),/aria-pressed="false"/);
console.log('Portal control semantics: 12 assertions passed.');
