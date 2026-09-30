'use strict';
/* 우리 둘의 꽃집 — game-start.js : 모든 파일을 불러온 뒤 게임을 시작해요 (항상 맨 마지막에 불러오기) */
showTitle();
prBoot();
requestAnimationFrame(loop);
/* 화면이 멈춰 자동으로 다시 불러온 경우: 바로 이어서 하기 */
var AUTO_RESUME=false;try{if(sessionStorage.getItem('ofs_autoresume')==='1'){sessionStorage.removeItem('ofs_autoresume');if(loadSave()){AUTO_RESUME=true;continueGame('duo')}}}catch(e){}
window.__audioInit=()=>audioInit();window.__schedMusic=()=>schedMusic();window.__schedAmb=()=>schedAmbience();
window.__game={wArea,MAIN,PAL,PR,S,update,render,doAction,onModalClick,closeModal,endDay,newGame,continueGame,bouquetSVG,targetOf,actionLabel,saveGame,loadSave,spawnUrgent,findGift,bestOrderFor,updateHUD,openModal,renderModal,SET,showSettings,perfShow,drawChar,drawCat,drawDog,flowerHead,drawDecor,drawStationV,bgCanvas,solid,AREAS,TILE,DECOR};


