function t(){}function e(t,e,n,o,s){t.__svelte_meta={loc:{file:e,line:n,column:o,char:s}}}function n(t){return t()}function o(){return Object.create(null)}function s(t){t.forEach(n)}function r(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(t,e){t.appendChild(e)}function i(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function p(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}let m;function h(t){m=t}function $(t){(function(){if(!m)throw new Error("Function called outside component initialization");return m})().$$.on_destroy.push(t)}const b=[],w=[],y=[],g=[],v=Promise.resolve();let _=!1;function x(t){y.push(t)}function E(){const t=new Set;do{for(;b.length;){const t=b.shift();h(t),k(t.$$)}for(;w.length;)w.pop()();for(let e=0;e<y.length;e+=1){const n=y[e];t.has(n)||(n(),t.add(n))}y.length=0}while(b.length);for(;g.length;)g.pop()();_=!1}function k(t){t.fragment&&(t.update(t.dirty),s(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(x))}const A=new Set;const j="undefined"!=typeof window?window:global;function C(t,e){t.$$.dirty||(b.push(t),_||(_=!0,v.then(E)),t.$$.dirty=o()),t.$$.dirty[e]=!0}function q(e,c,a,i,l,u){const d=m;h(e);const f=c.props||{},p=e.$$={fragment:null,ctx:null,props:u,update:t,not_equal:l,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:o(),dirty:null};let $=!1;var b,w,y;p.ctx=a?a(e,f,(t,n)=>{p.ctx&&l(p.ctx[t],p.ctx[t]=n)&&(p.bound[t]&&p.bound[t](n),$&&C(e,t))}):f,p.update(),$=!0,s(p.before_update),p.fragment=i(p.ctx),c.target&&(c.hydrate?p.fragment.l((y=c.target,Array.from(y.childNodes))):p.fragment.c(),c.intro&&((b=e.$$.fragment)&&b.i&&(A.delete(b),b.i(w))),function(t,e,o){const{fragment:c,on_mount:a,on_destroy:i,after_update:l}=t.$$;c.m(e,o),x(()=>{const e=a.map(n).filter(r);i?i.push(...e):s(e),t.$$.on_mount=[]}),l.forEach(x)}(e,c.target,c.anchor),E()),h(d)}class B{$destroy(){var e,n;n=1,(e=this).$$.fragment&&(s(e.$$.on_destroy),e.$$.fragment.d(n),e.$$.on_destroy=e.$$.fragment=null,e.$$.ctx={}),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}class N extends B{constructor(t){if(!t||!t.target&&!t.$$inline)throw new Error("'target' is a required option");super()}$destroy(){super.$destroy(),this.$destroy=(()=>{console.warn("Component was already destroyed")})}}const{console:L}=j,O="assets/js/ui-btn-deleteaccount/btn.svelte";function P(t){var n,o,s;return{c:function(){n=u("button"),o=d("Delete Account"),n.disabled=t.disabled,p(n,"class",t.classes),e(n,O,48,2,1197),s=f(n,"click",t.set_removal)},m:function(t,e){i(t,n,e),a(n,o)},p:function(t,e){t.disabled&&(n.disabled=e.disabled),t.classes&&p(n,"class",e.classes)},d:function(t){t&&l(n),s()}}}function W(t){var n,o,s;return{c:function(){n=u("button"),o=d("Undo queued removal"),n.disabled=t.disabled,p(n,"class",t.classes),e(n,O,44,2,1090),s=f(n,"click",t.clear_removal)},m:function(t,e){i(t,n,e),a(n,o)},p:function(t,e){t.disabled&&(n.disabled=e.disabled),t.classes&&p(n,"class",e.classes)},d:function(t){t&&l(n),s()}}}function M(e){var n;function o(t){return t.data&&t.data.queued_remove?W:P}var s=o(e),r=s(e);return{c:function(){r.c(),n=d("")},l:function(t){throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(t,e){r.m(t,e),i(t,n,e)},p:function(t,e){s===(s=o(e))&&r?r.p(t,e):(r.d(1),(r=s(e))&&(r.c(),r.m(n.parentNode,n)))},i:t,o:t,d:function(t){r.d(t),t&&l(n)}}}function S(t,e,n){let o=!0,{classes:s="btn btn-primary"}=e,r=null,c={},a=null,i=()=>{},l=null;$(()=>i()),async function(){const t=await import("../../../../../../../../js/cmp/userdata.js");i=t.UserAwareComponent(t=>{n("disabled",o=!(r=t))},t=>{const e=c=t;return n("data",c),e},t=>a=t),l=t.userdata}();const u=["classes"];return Object.keys(e).forEach(t=>{u.includes(t)||t.startsWith("$$")||L.warn(`<Btn> was created with unknown prop '${t}'`)}),t.$set=(t=>{"classes"in t&&n("classes",s=t.classes)}),{disabled:o,classes:s,data:c,set_removal:function(t){l&&(n("disabled",o=!0),l.queue_removal().then(()=>{const t=o=!1;return n("disabled",o),t}).catch(t=>console.warn("Writing failed",t)))},clear_removal:function(t){l&&(n("disabled",o=!0),l.clear_removal().then(()=>{const t=o=!1;return n("disabled",o),t}).catch(t=>console.warn("Writing failed",t)))}}}class T extends N{constructor(t){super(t),q(this,t,S,M,c,["classes"])}get classes(){throw new Error("<Btn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'")}set classes(t){throw new Error("<Btn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'")}}window.customElements.define("ui-btn-deleteaccount",class extends HTMLElement{constructor(){super()}connectedCallback(){const t=this.getAttribute("class")||"btn btn-primary";this.removeAttribute("class"),this.cmp=new T({target:this,props:{classes:t}})}disconnectedCallback(){this.cmp&&this.cmp.$destroy()}});
//# sourceMappingURL=ui-btn-deleteaccount.js.map
