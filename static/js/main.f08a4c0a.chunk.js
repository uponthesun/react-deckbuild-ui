(this["webpackJsonpmy-app"]=this["webpackJsonpmy-app"]||[]).push([[0],{30:function(t,e,a){t.exports=a(38)},35:function(t,e,a){},38:function(t,e,a){"use strict";a.r(e);var r=a(5),n=a(6),o=a(16),c=a(17),i=a(23),l=a(0),u=a.n(l),s=a(25),d=a.n(s),p=a(27),m=a(40),f=a(42),h=a(41),v=(a(35),a(14)),b=a(3),C=a.n(b),y=a(9),E=a(13),S=function(){function t(e,a){Object(r.a)(this,t),e||(e=[]),this.numCols=a,this.loadCardPool(e)}return Object(n.a)(t,[{key:"loadCardPool",value:function(){var t=Object(E.a)(C.a.mark((function t(e){var a=this;return C.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:this.cardColumns=Object(y.a)(Array(this.numCols)).map((function(t){return[]})),this.nextId=0,e.forEach((function(t){return a.createAndAddCard(t)}));case 3:case"end":return t.stop()}}),t,this)})));return function(e){return t.apply(this,arguments)}}()},{key:"createAndAddCard",value:function(){var t=Object(E.a)(C.a.mark((function t(e){var a;return C.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return a={name:e,id:this.nextId,currentBoard:this},this.cardColumns[0].push(a),this.nextId++,g(e).then((function(t){return a.data=t})),t.abrupt("return",a);case 5:case"end":return t.stop()}}),t,this)})));return function(e){return t.apply(this,arguments)}}()},{key:"addCard",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0;(!a||a>this.cardColumns[e].length)&&(a=this.cardColumns[e].length),this.cardColumns[e].splice(a,0,t),t.currentBoard=this}},{key:"removeCard",value:function(t){for(var e=0;e<this.cardColumns.length;e++)for(var a=this.cardColumns[e],r=0;r<a.length;r++)if(a[r].id===t.id)return a.splice(r,1),t;throw"Tried to remove card, but it wasn't in this board: "+JSON.stringify(t)}},{key:"moveCard",value:function(){var t=Object(E.a)(C.a.mark((function t(e,a,r){return C.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:e.currentBoard.removeCard(e),this.addCard(e,a,r);case 2:case"end":return t.stop()}}),t,this)})));return function(e,a,r){return t.apply(this,arguments)}}()},{key:"sortByCmc",value:function(){var t,e=Object(y.a)(Array(this.numCols)).map((function(t){return[]})),a=Object(v.a)(this.cardColumns.flat());try{for(a.s();!(t=a.n()).done;){var r=t.value;e[Math.min(r.data.cmc,7)].push(r)}}catch(n){a.e(n)}finally{a.f()}return this.cardColumns=e,this}},{key:"sortByColor",value:function(){var t=Object(y.a)(Array(this.numCols)).map((function(t){return[]})),e=["L","W","U","B","R","G","C","M"],a=this.cardColumns.flat().filter((function(t){return"M"!==t.data.color_pile})),r=this.cardColumns.flat().filter((function(t){return"M"===t.data.color_pile}));r.sort((function(t,e){return t.data.colors.localeCompare(e.data.colors)}));for(var n=0,o=[].concat(Object(y.a)(a),Object(y.a)(r));n<o.length;n++){var c=o[n];t[e.indexOf(c.data.color_pile)].push(c)}return this.cardColumns=t,this}}]),t}(),g=function(){var t=Object(E.a)(C.a.mark((function t(e){var a,r,n,o,c;return C.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return a="https://api.scryfall.com/cards/named?exact=".concat(encodeURI(e)),t.next=3,fetch(a);case 3:return r=t.sent,t.next=6,r.json();case 6:return n=t.sent,t.prev=7,"card_faces"in n&&Object.assign(n,n.card_faces[0]),o=n.colors.join(""),(c=o).length>1?c="M":0===c.length&&(o=c="C"),n.type_line.includes("Land")&&(c="L"),t.abrupt("return",{color_pile:c,colors:o,cmc:n.cmc});case 16:throw t.prev=16,t.t0=t.catch(7),console.error("Error parsing card data: ".concat(t.t0,". Card JSON: ").concat(JSON.stringify(n))),t.t0;case 20:case"end":return t.stop()}}),t,null,[[7,16]])})));return function(e){return t.apply(this,arguments)}}(),O=function(t){return u.a.createElement("textarea",{id:t.id,rows:"5",cols:"33"})},j=function(t){Object(c.a)(a,t);var e=Object(o.a)(a);function a(){return Object(r.a)(this,a),e.apply(this,arguments)}return Object(n.a)(a,[{key:"inputToCardNames",value:function(t){var e,a,r=t.split("\n").filter((function(t){return t.trim().length>0})),n=[],o=Object(v.a)(r);try{for(o.s();!(e=o.n()).done;){var c=e.value;c=c.split("(")[0].trim();var i=1;if(a=c[0],!Number.isNaN(Number(a))){var l=c.indexOf(" ");i=Number(c.substring(0,l)),c=c.substring(l).trim()}for(var u=0;u<i;u++)n.push(c)}}catch(s){o.e(s)}finally{o.f()}return n}},{key:"load",value:function(){var t=document.getElementById(this.props.inputElementId).value,e=this.inputToCardNames(t),a=this.props.topLevelContainer.state.boardState.numCols;this.props.topLevelContainer.setState({boardState:new S(e,a),sideboardState:new S([],1)})}},{key:"render",value:function(){var t=this;return u.a.createElement("input",{type:"button",onClick:function(){return t.load()},value:"Load cards"})}}]),a}(u.a.Component),k=function(t){return u.a.createElement("input",{type:"button",onClick:function(){var e,a,r,n=(e=t.boardState.cardColumns.flat(),a=t.sideboardState.cardColumns.flat(),e.map((function(t){return t.name})).join("\n")+"\n\n// Sideboard\n"+a.map((function(t){return t.name})).join("\n"));r=n,navigator.clipboard.writeText(r).then((function(){return alert("Copied to clipboard:\n\n".concat(r))}),(function(){return alert("Failed to copy to clipboard")}))},value:"Export to Cockatrice"})},x=["Battle Hymn","Reaper King","Death or Glory","Mindless Automaton","Wizard Mentor","Crow Storm","Gaea's Touch"];function w(t){var e=Object(f.a)({item:{type:"Card",card:t.card}}),a=Object(i.a)(e,2),r=(a[0],a[1]),n="https://api.scryfall.com/cards/named?format=image&exact=".concat(encodeURI(t.card.name));return u.a.createElement("img",{ref:r,src:n,width:146,height:204,onDoubleClick:function(){return function(e){var a=t.topLevelContainer.state.boardState,r=t.topLevelContainer.state.sideboardState,n=e.currentBoard===a?r:a;e.currentBoard.removeCard(e),n.addCard(e),t.topLevelContainer.setState(t.topLevelContainer.state)}(t.card)},style:{position:"absolute",top:"".concat(t.top,"px"),left:"".concat(t.left,"px"),zIndex:"".concat(t.zIndex)}})}function L(t){for(var e=Object(h.a)({accept:"Card",drop:function(e,a){return B(t.boardState,a.getClientOffset(),e.card)},collect:function(t){return{mousePos:t.getClientOffset()}}}),a=Object(i.a)(e,2),r=(a[0].mousePos,a[1]),n=[],o=t.boardState.cardColumns,c=0;c<o.length;c++)for(var l=0;l<o[c].length;l++){var s=o[c][l],d=25*l,p=147*c;n.push(u.a.createElement(w,{key:s.id.toString(),card:s,top:d,left:p,zIndex:l,topLevelContainer:t.topLevelContainer}))}var m=147*t.boardState.numCols;return u.a.createElement("div",{ref:r,className:"card-space",style:{position:"relative",width:"".concat(m,"px")}},n)}var B=function(t,e,a){var r=Math.min(Math.floor(e.x/147),t.numCols-1),n=Math.floor(e.y/25);t.moveCard(a,r,n)};function M(t){return u.a.createElement("input",{type:"button",onClick:function(){return t.topLevelContainer.setState({boardState:t.topLevelContainer.state.boardState.sortByCmc()})},value:"Sort by CMC"})}function I(t){return u.a.createElement("input",{type:"button",onClick:function(){return t.topLevelContainer.setState({boardState:t.topLevelContainer.state.boardState.sortByColor()})},value:"Sort by Color"})}function A(t){return u.a.createElement("div",{style:{float:"right"}},"Large space is the maindeck, smaller space is the sideboard. ",u.a.createElement("br",null),"Drag and drop to move cards around. ",u.a.createElement("br",null),"Double-click a card to move it from the maindeck to sideboard or vice versa. ",u.a.createElement("br",null),'Multiple formats are supported for "Load cards", including MTG Arena. ',u.a.createElement("br",null),"Valid example lines: ",u.a.createElement("br",null),"Wizard Mentor ",u.a.createElement("br",null),"1 Battle Hymn ",u.a.createElement("br",null),"5 Forest ",u.a.createElement("br",null),"1 Cogwork Assembler (AER) 145")}var N=function(t){Object(c.a)(a,t);var e=Object(o.a)(a);function a(t){var n;return Object(r.a)(this,a),(n=e.call(this,t)).state={boardState:new S(x,8),sideboardState:new S([],1)},n}return Object(n.a)(a,[{key:"render",value:function(){return u.a.createElement("div",null,u.a.createElement(L,{boardState:this.state.boardState,topLevelContainer:this}),u.a.createElement(L,{boardState:this.state.sideboardState,topLevelContainer:this}),u.a.createElement(O,{id:"card-pool-input"}),u.a.createElement(j,{inputElementId:"card-pool-input",topLevelContainer:this}),u.a.createElement(M,{topLevelContainer:this}),u.a.createElement(I,{topLevelContainer:this}),u.a.createElement(k,{boardState:this.state.boardState,sideboardState:this.state.sideboardState}),u.a.createElement(A,null))}}]),a}(u.a.Component);d.a.render(u.a.createElement(m.a,{backend:p.a},u.a.createElement(N,null)),document.getElementById("root"))}},[[30,1,2]]]);
//# sourceMappingURL=main.f08a4c0a.chunk.js.map