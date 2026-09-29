'use strict';
/* 우리 둘의 꽃집 — game-start.js : 모든 파일을 불러온 뒤 게임을 시작해요 (항상 맨 마지막에 불러오기) */
showTitle();
prBoot();
requestAnimationFrame(loop);
window.__audioInit=()=>audioInit();window.__schedMusic=()=>schedMusic();window.__schedAmb=()=>schedAmbience();
window.__game={MAIN,PAL,PR,S,update,render,doAction,onModalClick,closeModal,endDay,newGame,continueGame,bouquetSVG,targetOf,actionLabel,saveGame,loadSave,spawnUrgent,findGift,bestOrderFor,updateHUD,openModal,renderModal,SET,showSettings,perfShow,drawChar,drawCat,drawDog,flowerHead,bgCanvas,solid,AREAS,TILE,DECOR};


