/*
// クラス名:handWashFault
// 機能概要:手洗い失敗フェイズ
*/
class handWashFault extends funcBase {
  constructor(effectElem, ponement, soundElems, debug = false) {
    super(effectElem, ponement, (debug = false));
    this.soundElems = soundElems;
  }

  //フェイズ開始
  start(effectTime = 3000) {
    //演出
    this.soundElems.list.forEach((element) => {
      if (element.chp === CHAPT_handWashFault) {
        element.elem.play();
      }
    });
    super.start(effectTime);
  }

  stop() {
    this.soundElems.list.forEach((element) => {
      if (element.chp === CHAPT_handWashFault) {
        element.elem.pause();
        element.elem.currentTime = 0;
      }
    });
    super.stop();
  }
}
