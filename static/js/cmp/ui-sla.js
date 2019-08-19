function t(){}function e(t,e,n,r,a){t.__svelte_meta={loc:{file:e,line:n,column:r,char:a}}}function n(t){return t()}function r(){return Object.create(null)}function a(t){t.forEach(n)}function s(t){return"function"==typeof t}function o(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function i(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function h(t,e){e=""+e,t.data!==e&&(t.data=e)}let p;function $(t){p=t}const m=[],g=[],y=[],b=[],v=Promise.resolve();let w=!1;function x(t){y.push(t)}function _(){const t=new Set;do{for(;m.length;){const t=m.shift();$(t),A(t.$$)}for(;g.length;)g.pop()();for(let e=0;e<y.length;e+=1){const n=y[e];t.has(n)||(n(),t.add(n))}y.length=0}while(m.length);for(;b.length;)b.pop()();w=!1}function A(t){t.fragment&&(t.update(t.dirty),a(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(x))}const C=new Set;function E(t,e){t.$$.dirty||(m.push(t),w||(w=!0,v.then(_)),t.$$.dirty=r()),t.$$.dirty[e]=!0}function k(e,o,i,c,l,u){const d=p;$(e);const f=o.props||{},h=e.$$={fragment:null,ctx:null,props:u,update:t,not_equal:l,bound:r(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:r(),dirty:null};let m=!1;var g,y,b;h.ctx=i?i(e,f,(t,n)=>{h.ctx&&l(h.ctx[t],h.ctx[t]=n)&&(h.bound[t]&&h.bound[t](n),m&&E(e,t))}):f,h.update(),m=!0,a(h.before_update),h.fragment=c(h.ctx),o.target&&(o.hydrate?h.fragment.l((b=o.target,Array.from(b.childNodes))):h.fragment.c(),o.intro&&((g=e.$$.fragment)&&g.i&&(C.delete(g),g.i(y))),function(t,e,r){const{fragment:o,on_mount:i,on_destroy:c,after_update:l}=t.$$;o.m(e,r),x(()=>{const e=i.map(n).filter(s);c?c.push(...e):a(e),t.$$.on_mount=[]}),l.forEach(x)}(e,o.target,o.anchor),_()),$(d)}class S{$destroy(){var e,n;n=1,(e=this).$$.fragment&&(a(e.$$.on_destroy),e.$$.fragment.d(n),e.$$.on_destroy=e.$$.fragment=null,e.$$.ctx={}),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}class F extends S{constructor(t){if(!t||!t.target&&!t.$$inline)throw new Error("'target' is a required option");super()}$destroy(){super.$destroy(),this.$destroy=(()=>{console.warn("Component was already destroyed")})}}const L="assets/js/ui-sla/cmp.svelte";function j(n){var r,a,s,o,p,$,m,g,y,b,v,w,x,_,A,C,E,k,S,F,j;return{c:function(){r=u("p"),(a=u("q")).textContent="A service-level agreement (SLA) is a commitment between a service provider\n    and a client. Particular aspects of the service – quality, availability,\n    responsibilities – are agreed between the service provider and the service\n    user.",s=f(),o=u("p"),p=d(n.sla_str),$=d("% means:\n  "),m=u("b"),g=d(n.hours),y=d("h a day"),b=d("\n  or\n  "),v=u("b"),w=d(n.days),x=d(" days every 31 days"),_=d("\n  ."),A=f(),C=u("p"),E=d("The Software-only SLA is limited to:\n  "),k=u("br"),S=d("\n  Cloud Connectors, Rule Engine, IAM-Service, Operating Sytem, Hue Emulation +\n  API Access. Your own services will be limited to 1/4 of the available memory\n  and 20% CPU-time in SLA mode."),F=f(),(j=u("p")).textContent="Manipulating the supervisior will free the service provider from any SLA\n  obligations with immediate effect.",e(a,L,10,2,236),e(r,L,9,0,230),e(m,L,20,2,524),e(v,L,22,2,553),e(o,L,18,0,498),e(k,L,28,2,641),e(C,L,26,0,596),e(j,L,34,0,844)},l:function(t){throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(t,e){c(t,r,e),i(r,a),c(t,s,e),c(t,o,e),i(o,p),i(o,$),i(o,m),i(m,g),i(m,y),i(o,b),i(o,v),i(v,w),i(v,x),i(o,_),c(t,A,e),c(t,C,e),i(C,E),i(C,k),i(C,S),c(t,F,e),c(t,j,e)},p:function(t,e){t.sla_str&&h(p,e.sla_str),t.hours&&h(g,e.hours),t.days&&h(w,e.days)},i:t,o:t,d:function(t){t&&(l(r),l(s),l(o),l(A),l(C),l(F),l(j))}}}function q(t,e,n){let{sla:r=0,range:a=100}=e;const s=["sla","range"];let o,i,c;return Object.keys(e).forEach(t=>{s.includes(t)||t.startsWith("$$")||console.warn(`<Cmp> was created with unknown prop '${t}'`)}),t.$set=(t=>{"sla"in t&&n("sla",r=t.sla),"range"in t&&n("range",a=t.range)}),t.$$.update=((t={sla:1})=>{t.sla&&n("hours",o=(24*r/100).toFixed(2)),t.sla&&n("days",i=(31*r/100).toFixed(2)),t.sla&&n("sla_str",c=parseFloat(r).toFixed(2))}),{sla:r,range:a,hours:o,days:i,sla_str:c}}class M extends F{constructor(t){super(t),k(this,t,q,j,o,["sla","range"])}get sla(){return this.$$.ctx.sla}set sla(t){this.$set({sla:t}),_()}get range(){return this.$$.ctx.range}set range(t){this.$set({range:t}),_()}}window.customElements.define("ui-sla",class extends HTMLElement{constructor(){super()}connectedCallback(){this.cmp=new M({target:this,props:{sla:this.hasAttribute("value")?this.getAttribute("value"):0,range:this.hasAttribute("range")?this.getAttribute("range"):0}})}static get observedAttributes(){return["value","range"]}attributeChangedCallback(t,e,n){switch(t){case"value":this.value=n;break;case"range":this.range=n}}set value(t){this.cmp&&(this.cmp.sla=parseFloat(t))}set range(t){this.cmp.range=parseFloat(t)}disconnectedCallback(){this.cmp&&this.cmp.$destroy()}});
//# sourceMappingURL=ui-sla.js.map