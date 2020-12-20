/*
// クラス名:stopFlow
// 機能概要:水停止フェイズ
*/
class stopFlow extends funcBase {
  //フェイズ開始
  start(effectTime = 3000) {
    //演出
    $(document.getElementById("elemStopFlow_canvas")).removeClass("fade");
    $(document.getElementById("elemStopFlow_canvas")).addClass("blink");

    super.start(effectTime);
  }

  stop() {
    $(document.getElementById("elemStopFlow_canvas")).addClass("fade");
    $(document.getElementById("elemStopFlow_canvas")).removeClass("blink");

    super.stop();
  }
}
