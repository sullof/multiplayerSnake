(()=>{const e=io("http://3.139.87.87:3000"),n=io("http://localhost:3000");e.on("init",k),e.on("gameState",p),e.on("gameOver",E),e.on("gameCode",(function(e){console.log(e)})),e.on("unknownCode",B),e.on("tooManyPlayers",S),n.on("init",k),n.on("gameState",p),n.on("gameOver",E),n.on("gameCode",(function(e){!function(e){r=!0;const t={roomName:e,screenSize:{width:c.width,height:c.height}};console.log(t),n.emit("joinGame",t),f()}(e)})),n.on("unknownCode",B),n.on("tooManyPlayers",S),window.onscroll=function(){window.scrollTo(0,0)};const t=document.getElementById("gameScreen"),o=document.getElementById("initialScreen"),i=document.getElementById("newGameButton"),c=document.getElementById("gameCanvas"),l=document.getElementById("joinGameButton"),a=document.getElementById("practiceButton"),d=document.getElementById("gameCodeInput"),m=document.getElementById("time");var r=!1;const s=document.getElementById("colorImage"),g=window.innerHeight-200,u=window.innerWidth;let y;c.width=40*Math.floor(u/40),c.height=40*Math.floor(g/40),i.addEventListener("click",(function(){console.log("newGame"),e.emit("newGame")})),l.addEventListener("click",(function(){const n={roomName:new URLSearchParams(window.location.search).get("gameCode"),screenSize:{width:c.width,height:c.height}};console.log(n),e.emit("joinGame",n),f()})),a.addEventListener("click",(function(){console.log("newGame"),n.emit("newGame")}));let h=!1;function f(){o.style.display="none",t.style.display="block",ctx3=c.getContext("2d"),document.addEventListener("keydown",w),h=!0}function w(t){r?n.emit("keydown",t.keyCode):e.emit("keydown",t.keyCode)}function x(e,n,t,o){const i=e.snake;ctx3.fillStyle=o;for(let e of i)ctx3.fillRect(e.x*n,e.y*t,40,40)}function k(e){y=1}function p(e){h&&(e=JSON.parse(e),requestAnimationFrame((()=>function(e){if(s.src=e.imgURL,m.innerText=e.currentTime,ctx3.clearRect(0,0,c.width,c.height),e.food){let n=e.food;const t=c.width/e.gridX,o=c.height/e.gridY;ctx3.fillStyle=e.food[0].color.hex,ctx3.fillRect(n[0].x*t,n[0].y*o,40,40),ctx3.fillStyle=e.food[1].color.hex,ctx3.fillRect(n[1].x*t,n[1].y*o,40,40),x(e.players[0],t,o,"#c2c2c2"),x(e.players[1],t,o,"red")}}(e))))}function E(e){h&&(e=JSON.parse(e),h=!1,e.winner===y?alert("You Win!"):alert("You Lose :("),r=!1)}function B(){C(),alert("Unknown Game Code")}function S(){C(),alert("This game is already in progress")}function C(){y=null,d.value="",o.style.display="block",t.style.display="none",r=!1}})();