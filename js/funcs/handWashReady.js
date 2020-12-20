/*
// クラス名:handWashReady
// 機能概要:手洗い準備フェイズ
*/

class handWashReady extends funcBase {
  constructor(effectElem, ponement, soundElems, debug = false) {
    super(effectElem, ponement, (debug = false));
    this.OutOfRangeStartTime = undefined;
    this.RangeInStartTime = undefined;
    this.soundElems = soundElems;
  }
  //フェイズ開始
  start(effectTime = 3000) {
    //演出
    $(document.getElementById("elemHandWashReady_canvas")).removeClass("fade");
    $(document.getElementById("elemHandWashReady_canvas")).addClass("blink2");

    this.soundElems.list.forEach((element) => {
      if (element.chp === CHAPT_handWashReady) {
        element.elem.play();
      }
    });

    super.start(effectTime);
  }

  stop() {
    $(document.getElementById("elemHandWashReady_canvas")).addClass("fade");
    $(document.getElementById("elemHandWashReady_canvas")).removeClass(
      "blink2"
    );

    this.soundElems.list.forEach((element) => {
      if (element.chp === CHAPT_handWashReady) {
        element.elem.pause();
        element.elem.currentTime = 0;
      }
    });

    super.stop();
  }

  //距離＆カメラの範囲から最初に外れた時間
  get outofRangeTime() {
    return this.OutOfRangeStartTime;
  }

  //距離＆カメラの範囲から最初に外れた時間
  set outofRangeTime(tm) {
    this.OutOfRangeStartTime = tm;
  }

  //距離＆カメラの範囲から最初に入った時間
  get RangeInTime() {
    return this.RangeInStartTime;
  }

  //距離＆カメラの範囲から最初に入った時間
  set RangeInTime(tm) {
    this.RangeInStartTime = tm;
  }

  //距離＆カメラの範囲から外れたかどうか
  isOutOfRange() {
    if (!super.isRangeIn() || !super.isCamGetCurrentPosition()) {
      return true;
    } else {
      return false;
    }
  }
}
