function t(){}function n(t,n,e,g,c){t.__svelte_meta={loc:{file:n,line:e,column:g,char:c}}}function e(t){return t()}function g(){return Object.create(null)}function c(t){t.forEach(e)}function i(t){return"function"==typeof t}function I(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function l(t,n){t.appendChild(n)}function a(t,n,e){t.insertBefore(n,e||null)}function s(t){t.parentNode.removeChild(t)}function u(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function C(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function o(){return d(" ")}function A(t,n,e,g){return t.addEventListener(n,e,g),()=>t.removeEventListener(n,e,g)}function r(t,n,e){null==e?t.removeAttribute(n):t.setAttribute(n,e)}function b(t,n){n=""+n,t.data!==n&&(t.data=n)}let G;function m(t){G=t}function Z(t){(function(){if(!G)throw new Error("Function called outside component initialization");return G})().$$.on_destroy.push(t)}const X=[],p=[],f=[],x=[],h=Promise.resolve();let y=!1;function B(t){f.push(t)}function W(){const t=new Set;do{for(;X.length;){const t=X.shift();m(t),F(t.$$)}for(;p.length;)p.pop()();for(let n=0;n<f.length;n+=1){const e=f[n];t.has(e)||(e(),t.add(e))}f.length=0}while(X.length);for(;x.length;)x.pop()();y=!1}function F(t){t.fragment&&(t.update(t.dirty),c(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(B))}const V=new Set;const Y="undefined"!=typeof window?window:global;function R(t,n){t.$$.dirty||(X.push(t),y||(y=!0,h.then(W)),t.$$.dirty=g()),t.$$.dirty[n]=!0}function N(n,I,l,a,s,u){const C=G;m(n);const d=I.props||{},o=n.$$={fragment:null,ctx:null,props:u,update:t,not_equal:s,bound:g(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(C?C.$$.context:[]),callbacks:g(),dirty:null};let A=!1;var r,b,Z;o.ctx=l?l(n,d,(t,e)=>{o.ctx&&s(o.ctx[t],o.ctx[t]=e)&&(o.bound[t]&&o.bound[t](e),A&&R(n,t))}):d,o.update(),A=!0,c(o.before_update),o.fragment=a(o.ctx),I.target&&(I.hydrate?o.fragment.l((Z=I.target,Array.from(Z.childNodes))):o.fragment.c(),I.intro&&((r=n.$$.fragment)&&r.i&&(V.delete(r),r.i(b))),function(t,n,g){const{fragment:I,on_mount:l,on_destroy:a,after_update:s}=t.$$;I.m(n,g),B(()=>{const n=l.map(e).filter(i);a?a.push(...n):c(n),t.$$.on_mount=[]}),s.forEach(B)}(n,I.target,I.anchor),W()),m(C)}class v{$destroy(){var n,e;e=1,(n=this).$$.fragment&&(c(n.$$.on_destroy),n.$$.fragment.d(e),n.$$.on_destroy=n.$$.fragment=null,n.$$.ctx={}),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(){}}class J extends v{constructor(t){if(!t||!t.target&&!t.$$inline)throw new Error("'target' is a required option");super()}$destroy(){super.$destroy(),this.$destroy=(()=>{console.warn("Component was already destroyed")})}}const{Object:U}=Y,w="assets/js/ui-installations/cmp.svelte";function Q(t,n,e){const g=U.create(t);return g.queuekey=n[e][0],g.item=n[e][1],g}function z(t,n,e){const g=U.create(t);return g.install=n[e],g}function L(t){var e;return{c:function(){(e=C("p")).textContent="No Installations registered!",n(e,w,172,2,4651)},m:function(t,n){a(t,e,n)},d:function(t){t&&s(e)}}}function k(t){for(var n,e,g,c=t.Object.keys(t.actionqueue[t.install.id]).length+"",i=t.Object.entries(t.actionqueue[t.install.id]),I=[],l=0;l<i.length;l+=1)I[l]=j(Q(t,i,l));return{c:function(){n=d(c),e=d(" (⇒\n          ");for(var t=0;t<I.length;t+=1)I[t].c();g=d("\n          )")},m:function(t,c){a(t,n,c),a(t,e,c);for(var i=0;i<I.length;i+=1)I[i].m(t,c);a(t,g,c)},p:function(t,e){if((t.actionqueue||t.data)&&c!==(c=e.Object.keys(e.actionqueue[e.install.id]).length+"")&&b(n,c),t.Object||t.actionqueue||t.data){i=e.Object.entries(e.actionqueue[e.install.id]);for(var l=0;l<i.length;l+=1){const n=Q(e,i,l);I[l]?I[l].p(t,n):(I[l]=j(n),I[l].c(),I[l].m(g.parentNode,g))}for(;l<I.length;l+=1)I[l].d(1);I.length=i.length}},d:function(t){t&&(s(n),s(e)),u(I,t),t&&s(g)}}}function D(n){var e;return{c:function(){e=d("0")},m:function(t,n){a(t,e,n)},p:t,d:function(t){t&&s(e)}}}function S(t){var n,e,g,c=t.item.c+"";return{c:function(){n=d("("),e=d(c),g=d(")")},m:function(t,c){a(t,n,c),a(t,e,c),a(t,g,c)},p:function(t,n){(t.actionqueue||t.data)&&c!==(c=n.item.c+"")&&b(e,c)},d:function(t){t&&(s(n),s(e),s(g))}}}function j(t){var e,g,c,i,I,u=t.queuekey+"",G=t.item.aid&&S(t);function m(...n){return t.click_handler(t,...n)}return{c:function(){e=C("button"),g=d(u),c=o(),G&&G.c(),i=d("\n            ⇒"),r(e,"title","Remove this command"),r(e,"class","btn btn-link"),n(e,w,135,12,3648),I=A(e,"click",m)},m:function(t,n){a(t,e,n),l(e,g),l(e,c),G&&G.m(e,null),a(t,i,n)},p:function(n,c){t=c,(n.actionqueue||n.data)&&u!==(u=t.queuekey+"")&&b(g,u),t.item.aid?G?G.p(n,t):((G=S(t)).c(),G.m(e,null)):G&&(G.d(1),G=null)},d:function(t){t&&s(e),G&&G.d(),t&&s(i),I()}}}function H(t){var e,g,c=t.error_messages[t.install.id]+"";return{c:function(){e=C("p"),g=d(c),n(e,w,166,10,4558)},m:function(t,n){a(t,e,n),l(e,g)},p:function(t,n){(t.error_messages||t.data)&&c!==(c=n.error_messages[n.install.id]+"")&&b(g,c)},d:function(t){t&&s(e)}}}function _(t){var e,g,i,I,u,G,m,Z,X,p,f,x,h,y,B,W,F,V,Y,R,N,v,J,U,Q,z,L,S,j,_,P,E,$,O,M,K,T,q,tt,nt,et=t.install.title+"",gt=t.install.addons?t.Object.keys(t.install.addons).length:"0",ct=t.Object.keys(t.install.addons).join(", ")+"",it=t.install.updates+"",It=new t.Date(t.install.last_seen).toLocaleString()+"",lt=new t.Date(t.install.started).toLocaleString()+"",at=t.install.ip.join(", ")+"";function st(t){return t.actionqueue&&t.actionqueue[t.install.id]?k:D}var ut=st(t),Ct=ut(t);function dt(...n){return t.click_handler_1(t,...n)}function ot(...n){return t.click_handler_2(t,...n)}function At(...n){return t.click_handler_3(t,...n)}var rt=t.error_messages[t.install.id]&&H(t);return{c:function(){var t,c;e=C("div"),g=C("div"),i=C("div"),I=C("h4"),u=d(et),G=o(),m=C("p"),Z=d("Installed Addons: "),X=d(gt),p=d("\n          ("),f=d(ct),x=d(")\n          "),h=C("br"),y=d("\n          Available Updates: "),B=d(it),W=o(),F=C("p"),V=d("Last Seen: "),Y=d(It),R=o(),N=C("br"),v=d("\n          Running since: "),J=d(lt),U=o(),Q=C("br"),z=d("\n          IP: "),L=d(at),S=o(),j=C("div"),_=d("Command Queue:\n        "),Ct.c(),P=o(),(E=C("p")).textContent="Please note that commands are queued and not executed directly.",$=o(),(O=C("button")).textContent="Update",M=o(),(K=C("button")).textContent="Restart",T=o(),(q=C("button")).textContent="Unregister",tt=o(),rt&&rt.c(),n(I,w,113,8,2838),n(h,w,117,10,3024),n(m,w,114,8,2871),n(N,w,122,10,3181),n(Q,w,124,10,3268),n(F,w,120,8,3099),r(i,"class","svelte-etg4yh"),n(i,w,112,6,2824),r(E,"class","small"),n(E,w,148,8,3995),r(O,"class","btn btn-secondary"),n(O,w,152,8,4109),r(K,"class","btn btn-secondary"),n(K,w,157,8,4252),r(q,"class","btn btn-danger"),n(q,w,162,8,4397),r(j,"class","mr-3 svelte-etg4yh"),t="max-width",c="400px",j.style.setProperty(t,c),n(j,w,128,6,3345),r(g,"class","card-body svelte-etg4yh"),n(g,w,111,4,2794),r(e,"class","card svelte-etg4yh"),n(e,w,110,2,2771),nt=[A(O,"click",dt),A(K,"click",ot),A(q,"click",At)]},m:function(t,n){a(t,e,n),l(e,g),l(g,i),l(i,I),l(I,u),l(i,G),l(i,m),l(m,Z),l(m,X),l(m,p),l(m,f),l(m,x),l(m,h),l(m,y),l(m,B),l(i,W),l(i,F),l(F,V),l(F,Y),l(F,R),l(F,N),l(F,v),l(F,J),l(F,U),l(F,Q),l(F,z),l(F,L),l(g,S),l(g,j),l(j,_),Ct.m(j,null),l(j,P),l(j,E),l(j,$),l(j,O),l(j,M),l(j,K),l(j,T),l(j,q),l(j,tt),rt&&rt.m(j,null)},p:function(n,e){t=e,n.data&&et!==(et=t.install.title+"")&&b(u,et),n.data&&gt!==(gt=t.install.addons?t.Object.keys(t.install.addons).length:"0")&&b(X,gt),n.data&&ct!==(ct=t.Object.keys(t.install.addons).join(", ")+"")&&b(f,ct),n.data&&it!==(it=t.install.updates+"")&&b(B,it),n.data&&It!==(It=new t.Date(t.install.last_seen).toLocaleString()+"")&&b(Y,It),n.data&&lt!==(lt=new t.Date(t.install.started).toLocaleString()+"")&&b(J,lt),n.data&&at!==(at=t.install.ip.join(", ")+"")&&b(L,at),ut===(ut=st(t))&&Ct?Ct.p(n,t):(Ct.d(1),(Ct=ut(t))&&(Ct.c(),Ct.m(j,P))),t.error_messages[t.install.id]?rt?rt.p(n,t):((rt=H(t)).c(),rt.m(j,null)):rt&&(rt.d(1),rt=null)},d:function(t){t&&s(e),Ct.d(),rt&&rt.d(),c(nt)}}}function P(t){var e,g,c;return{c:function(){e=C("div"),(g=C("button")).textContent="Add Demo Installation",r(g,"class","btn btn-primary"),n(g,w,177,4,4749),r(e,"class","mt-4 svelte-etg4yh"),n(e,w,176,2,4726),c=A(g,"click",t.add_demo)},m:function(t,n){a(t,e,n),l(e,g)},d:function(t){t&&s(e),c()}}}function E(t){var e,g;return{c:function(){e=C("p"),g=d(t.error_message),n(e,w,184,2,4882)},m:function(t,n){a(t,e,n),l(e,g)},p:function(t,n){t.error_message&&b(g,n.error_message)},d:function(t){t&&s(e)}}}function $(n){for(var e,g,c,i=n.Object.values(n.data.installations),I=[],l=0;l<i.length;l+=1)I[l]=_(z(n,i,l));var C=null;i.length||(C=L()).c();var A=n.user&&n.user.is_admin&&P(n),r=n.error_message&&E(n);return{c:function(){for(var t=0;t<I.length;t+=1)I[t].c();e=o(),A&&A.c(),g=o(),r&&r.c(),c=d("")},l:function(t){throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(t,n){for(var i=0;i<I.length;i+=1)I[i].m(t,n);C&&C.m(t,n),a(t,e,n),A&&A.m(t,n),a(t,g,n),r&&r.m(t,n),a(t,c,n)},p:function(t,n){if(t.error_messages||t.Object||t.data||t.actionqueue||t.Date){i=n.Object.values(n.data.installations);for(var l=0;l<i.length;l+=1){const g=z(n,i,l);I[l]?I[l].p(t,g):(I[l]=_(g),I[l].c(),I[l].m(e.parentNode,e))}for(;l<I.length;l+=1)I[l].d(1);I.length=i.length}i.length?C&&(C.d(1),C=null):C||((C=L()).c(),C.m(e.parentNode,e)),n.user&&n.user.is_admin?A||((A=P(n)).c(),A.m(g.parentNode,g)):A&&(A.d(1),A=null),n.error_message?r?r.p(t,n):((r=E(n)).c(),r.m(c.parentNode,c)):r&&(r.d(1),r=null)},i:t,o:t,d:function(t){u(I,t),C&&C.d(t),t&&s(e),A&&A.d(t),t&&s(g),r&&r.d(t),t&&s(c)}}}function O(t,n,e){let g,c={},i=null,I={installations:{}},l=null,a=()=>{},s=null;function u(t,n,g){t.target.disabled=!0,s.queue_action(n.id,g).then(()=>{c[n.id]=null,e("error_messages",c),t.target.disabled=!1}).catch(g=>{t.target.disabled=!1,c[n.id]=g.message,e("error_messages",c),console.warn("Writing failed",g)})}function C(t,n,g){t.target.disabled=!0,s.remove_queued_action(n.id,g).then(()=>{c[n.id]=null,e("error_messages",c),t.target.disabled=!1}).catch(g=>{t.target.disabled=!1,c[n.id]=g.message,e("error_messages",c),console.warn("Writing failed",g)})}function d(t,n){t.target.disabled=!0,s.remove_installation(n).then(()=>{c[n.id]=null,e("error_messages",c),t.target.disabled=!1}).catch(g=>{t.target.disabled=!1,c[n.id]=g.message,e("error_messages",c),console.warn("Writing failed",g)})}return Z(()=>a()),async function(){const t=await import("../../../../../../../../js/cmp/userdata.js");a=t.UserAwareComponent(t=>{const n=i=t;return e("user",i),n},t=>{const n=I=Object.assign({installations:{}},t);return e("data",I),n},t=>{const n=l=t;return e("actionqueue",l),n}),s=t.userdata}(),{error_messages:c,error_message:g,user:i,data:I,actionqueue:l,action:u,remove_action:C,unregister:d,add_demo:function(t){t.target.disabled=!0,s.add_installation({title:"My dummy",id:"dummy",last_seen:Date.now(),started:Date.now(),updates:2,ip:["129.123.43.1"],addons:{"binding-hue":{s:"installed",d:"running",v:"2.5.0"},"binding-zwave":{s:"downloading",d:.12,v:"2.5.1"}}}).then(()=>{t.target.disabled=!1}).catch(n=>{t.target.disabled=!1,e("error_message",g=n.message),console.warn("Writing failed",n)})},Object,Date,click_handler:function({install:t,queuekey:n},e){return C(e,t,n)},click_handler_1:function({install:t},n){return u(n,t,"update")},click_handler_2:function({install:t},n){return u(n,t,"restart")},click_handler_3:function({install:t},n){return d(n,t)}}}class M extends J{constructor(t){var n;super(t),document.getElementById("svelte-etg4yh-style")||((n=C("style")).id="svelte-etg4yh-style",n.textContent=".card.svelte-etg4yh:hover{box-shadow:0 1px 3px 1px rgba(60, 64, 67, 0.2),\n      0 2px 8px 4px rgba(60, 64, 67, 0.1)}.card-body.svelte-etg4yh{display:flex}.card-body.svelte-etg4yh>div.svelte-etg4yh:first-child{flex:1}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21wLnN2ZWx0ZSIsInNvdXJjZXMiOlsiY21wLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBsZXQgZGlzYWJsZWQgPSB0cnVlO1xuICBsZXQgZXJyb3JfbWVzc2FnZXMgPSB7fTtcbiAgbGV0IGVycm9yX21lc3NhZ2U7XG5cbiAgaW1wb3J0IHsgb25EZXN0cm95IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBsZXQgdXNlciA9IG51bGw7XG4gIGxldCBkYXRhID0geyBpbnN0YWxsYXRpb25zOiB7fSB9O1xuICBsZXQgYWN0aW9ucXVldWUgPSBudWxsO1xuICBsZXQgb25EZXN0cm95UHJveHkgPSAoKSA9PiB7fTtcbiAgbGV0IHVzZXJkYiA9IG51bGw7XG4gIG9uRGVzdHJveSgoKSA9PiBvbkRlc3Ryb3lQcm94eSgpKTtcblxuICBhc3luYyBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICBjb25zdCBtb2R1bGUgPSBhd2FpdCBpbXBvcnQoXCIvanMvY21wL3VzZXJkYXRhLmpzXCIpO1xuICAgIG9uRGVzdHJveVByb3h5ID0gbW9kdWxlLlVzZXJBd2FyZUNvbXBvbmVudChcbiAgICAgIHVzZXJfID0+ICh1c2VyID0gdXNlcl8pLFxuICAgICAgZGF0YV8gPT4gKGRhdGEgPSBPYmplY3QuYXNzaWduKHsgaW5zdGFsbGF0aW9uczoge30gfSwgZGF0YV8pKSxcbiAgICAgIGFxXyA9PiAoYWN0aW9ucXVldWUgPSBhcV8pXG4gICAgKTtcbiAgICB1c2VyZGIgPSBtb2R1bGUudXNlcmRhdGE7XG4gICAgZGlzYWJsZWQgPSBmYWxzZTtcbiAgfVxuICBzdGFydCgpO1xuXG4gIGZ1bmN0aW9uIGFjdGlvbihlLCBpbnN0YWxsLCBhY3Rpb25jb2RlKSB7XG4gICAgZS50YXJnZXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgIHVzZXJkYlxuICAgICAgLnF1ZXVlX2FjdGlvbihpbnN0YWxsLmlkLCBhY3Rpb25jb2RlKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBlcnJvcl9tZXNzYWdlc1tpbnN0YWxsLmlkXSA9IG51bGw7XG4gICAgICAgIGUudGFyZ2V0LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGUudGFyZ2V0LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGVycm9yX21lc3NhZ2VzW2luc3RhbGwuaWRdID0gZXJyLm1lc3NhZ2U7XG4gICAgICAgIGNvbnNvbGUud2FybihcIldyaXRpbmcgZmFpbGVkXCIsIGVycik7XG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZV9hY3Rpb24oZSwgaW5zdGFsbCwgYWN0aW9uY29kZSkge1xuICAgIGUudGFyZ2V0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB1c2VyZGJcbiAgICAgIC5yZW1vdmVfcXVldWVkX2FjdGlvbihpbnN0YWxsLmlkLCBhY3Rpb25jb2RlKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBlcnJvcl9tZXNzYWdlc1tpbnN0YWxsLmlkXSA9IG51bGw7XG4gICAgICAgIGUudGFyZ2V0LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGUudGFyZ2V0LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGVycm9yX21lc3NhZ2VzW2luc3RhbGwuaWRdID0gZXJyLm1lc3NhZ2U7XG4gICAgICAgIGNvbnNvbGUud2FybihcIldyaXRpbmcgZmFpbGVkXCIsIGVycik7XG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVucmVnaXN0ZXIoZSwgaW5zdGFsbCkge1xuICAgIGUudGFyZ2V0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB1c2VyZGJcbiAgICAgIC5yZW1vdmVfaW5zdGFsbGF0aW9uKGluc3RhbGwpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGVycm9yX21lc3NhZ2VzW2luc3RhbGwuaWRdID0gbnVsbDtcbiAgICAgICAgZS50YXJnZXQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgZS50YXJnZXQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgZXJyb3JfbWVzc2FnZXNbaW5zdGFsbC5pZF0gPSBlcnIubWVzc2FnZTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiV3JpdGluZyBmYWlsZWRcIiwgZXJyKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkX2RlbW8oZSkge1xuICAgIGUudGFyZ2V0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB1c2VyZGJcbiAgICAgIC5hZGRfaW5zdGFsbGF0aW9uKHtcbiAgICAgICAgdGl0bGU6IFwiTXkgZHVtbXlcIixcbiAgICAgICAgaWQ6IFwiZHVtbXlcIixcbiAgICAgICAgbGFzdF9zZWVuOiBEYXRlLm5vdygpLFxuICAgICAgICBzdGFydGVkOiBEYXRlLm5vdygpLFxuICAgICAgICB1cGRhdGVzOiAyLFxuICAgICAgICBpcDogW1wiMTI5LjEyMy40My4xXCJdLFxuICAgICAgICBhZGRvbnM6IHtcbiAgICAgICAgICBcImJpbmRpbmctaHVlXCI6IHsgczogXCJpbnN0YWxsZWRcIiwgZDogXCJydW5uaW5nXCIsIHY6IFwiMi41LjBcIiB9LFxuICAgICAgICAgIFwiYmluZGluZy16d2F2ZVwiOiB7IHM6IFwiZG93bmxvYWRpbmdcIiwgZDogMC4xMiwgdjogXCIyLjUuMVwiIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgZS50YXJnZXQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgZS50YXJnZXQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgZXJyb3JfbWVzc2FnZSA9IGVyci5tZXNzYWdlO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJXcml0aW5nIGZhaWxlZFwiLCBlcnIpO1xuICAgICAgfSk7XG4gIH1cbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIC5jYXJkOmhvdmVyIHtcbiAgICBib3gtc2hhZG93OiAwIDFweCAzcHggMXB4IHJnYmEoNjAsIDY0LCA2NywgMC4yKSxcbiAgICAgIDAgMnB4IDhweCA0cHggcmdiYSg2MCwgNjQsIDY3LCAwLjEpO1xuICB9XG4gIC5jYXJkLWJvZHkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gIH1cbiAgLmNhcmQtYm9keSA+IGRpdjpmaXJzdC1jaGlsZCB7XG4gICAgZmxleDogMTtcbiAgfVxuPC9zdHlsZT5cblxueyNlYWNoIE9iamVjdC52YWx1ZXMoZGF0YS5pbnN0YWxsYXRpb25zKSBhcyBpbnN0YWxsfVxuICA8ZGl2IGNsYXNzPVwiY2FyZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJjYXJkLWJvZHlcIj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxoND57aW5zdGFsbC50aXRsZX08L2g0PlxuICAgICAgICA8cD5cbiAgICAgICAgICBJbnN0YWxsZWQgQWRkb25zOiB7aW5zdGFsbC5hZGRvbnMgPyBPYmplY3Qua2V5cyhpbnN0YWxsLmFkZG9ucykubGVuZ3RoIDogMH1cbiAgICAgICAgICAoe09iamVjdC5rZXlzKGluc3RhbGwuYWRkb25zKS5qb2luKCcsICcpfSlcbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICBBdmFpbGFibGUgVXBkYXRlczoge2luc3RhbGwudXBkYXRlc31cbiAgICAgICAgPC9wPlxuICAgICAgICA8cD5cbiAgICAgICAgICBMYXN0IFNlZW46IHtuZXcgRGF0ZShpbnN0YWxsLmxhc3Rfc2VlbikudG9Mb2NhbGVTdHJpbmcoKX1cbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICBSdW5uaW5nIHNpbmNlOiB7bmV3IERhdGUoaW5zdGFsbC5zdGFydGVkKS50b0xvY2FsZVN0cmluZygpfVxuICAgICAgICAgIDxiciAvPlxuICAgICAgICAgIElQOiB7aW5zdGFsbC5pcC5qb2luKCcsICcpfVxuICAgICAgICA8L3A+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtci0zXCIgc3R5bGU9XCJtYXgtd2lkdGg6NDAwcHhcIj5cbiAgICAgICAgQ29tbWFuZCBRdWV1ZTpcbiAgICAgICAgeyNpZiAhYWN0aW9ucXVldWUgfHwgIWFjdGlvbnF1ZXVlW2luc3RhbGwuaWRdfVxuICAgICAgICAgIDBcbiAgICAgICAgezplbHNlfVxuICAgICAgICAgIHtPYmplY3Qua2V5cyhhY3Rpb25xdWV1ZVtpbnN0YWxsLmlkXSkubGVuZ3RofSAoJnJBcnI7XG4gICAgICAgICAgeyNlYWNoIE9iamVjdC5lbnRyaWVzKGFjdGlvbnF1ZXVlW2luc3RhbGwuaWRdKSBhcyBbcXVldWVrZXksIGl0ZW1dfVxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0aXRsZT1cIlJlbW92ZSB0aGlzIGNvbW1hbmRcIlxuICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4tbGlua1wiXG4gICAgICAgICAgICAgIG9uOmNsaWNrPXtlID0+IHJlbW92ZV9hY3Rpb24oZSwgaW5zdGFsbCwgcXVldWVrZXkpfT5cbiAgICAgICAgICAgICAge3F1ZXVla2V5fVxuICAgICAgICAgICAgICB7I2lmIGl0ZW0uYWlkfVxuICAgICAgICAgICAgICAgICAoe2l0ZW0uY30pXG4gICAgICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICZyQXJyO1xuICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgICApXG4gICAgICAgIHsvaWZ9XG4gICAgICAgIDxwIGNsYXNzPVwic21hbGxcIj5cbiAgICAgICAgICBQbGVhc2Ugbm90ZSB0aGF0IGNvbW1hbmRzIGFyZSBxdWV1ZWQgYW5kIG5vdCBleGVjdXRlZCBkaXJlY3RseS5cbiAgICAgICAgPC9wPlxuXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCJcbiAgICAgICAgICBvbjpjbGljaz17ZSA9PiBhY3Rpb24oZSwgaW5zdGFsbCwgJ3VwZGF0ZScpfT5cbiAgICAgICAgICBVcGRhdGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCJcbiAgICAgICAgICBvbjpjbGljaz17ZSA9PiBhY3Rpb24oZSwgaW5zdGFsbCwgJ3Jlc3RhcnQnKX0+XG4gICAgICAgICAgUmVzdGFydFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGFuZ2VyXCIgb246Y2xpY2s9e2UgPT4gdW5yZWdpc3RlcihlLCBpbnN0YWxsKX0+XG4gICAgICAgICAgVW5yZWdpc3RlclxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgeyNpZiBlcnJvcl9tZXNzYWdlc1tpbnN0YWxsLmlkXX1cbiAgICAgICAgICA8cD57ZXJyb3JfbWVzc2FnZXNbaW5zdGFsbC5pZF19PC9wPlxuICAgICAgICB7L2lmfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuezplbHNlfVxuICA8cD5ObyBJbnN0YWxsYXRpb25zIHJlZ2lzdGVyZWQhPC9wPlxuey9lYWNofVxuXG57I2lmIHVzZXIgJiYgdXNlci5pc19hZG1pbn1cbiAgPGRpdiBjbGFzcz1cIm10LTRcIj5cbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgb246Y2xpY2s9e2FkZF9kZW1vfT5cbiAgICAgIEFkZCBEZW1vIEluc3RhbGxhdGlvblxuICAgIDwvYnV0dG9uPlxuICA8L2Rpdj5cbnsvaWZ9XG5cbnsjaWYgZXJyb3JfbWVzc2FnZX1cbiAgPHA+e2Vycm9yX21lc3NhZ2V9PC9wPlxuey9pZn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpR0UsbUJBQUssTUFBTSxBQUFDLENBQUMsQUFDWCxVQUFVLENBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDOUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQ3ZDLENBQUMsQUFDRCxVQUFVLGNBQUMsQ0FBQyxBQUNWLE9BQU8sQ0FBRSxJQUFJLEFBQ2YsQ0FBQyxBQUNELHdCQUFVLENBQUcsaUJBQUcsWUFBWSxBQUFDLENBQUMsQUFDNUIsSUFBSSxDQUFFLENBQUMsQUFDVCxDQUFDIn0= */",l(document.head,n)),N(this,t,O,$,I,[])}}window.customElements.define("ui-installations",class extends HTMLElement{constructor(){super()}connectedCallback(){this.cmp=new M({target:this,props:{}})}disconnectedCallback(){this.cmp&&this.cmp.$destroy()}});
//# sourceMappingURL=ui-installations.js.map
