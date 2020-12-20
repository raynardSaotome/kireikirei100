/*
// 処理名:main
// 機能概要:手洗い案内システムメイン
*/
let HandWashReady_outOfRange_Wainting = 7000; // 手洗い準備フェイズ時のセンサー範囲外許容値（ミリ秒）
let HandWashReady_RangeIn_Wainting = 3500; // 手洗い準備フェイズ時のセンサー範反応時間（ミリ秒）
let HandWashSuccessEffectDispTime = 8500; // 手洗い成功演出時間
let HandWashFaultEffectDispTime = 8500; // 手洗い失敗演出時間

var nextChapter = 0; // 次に処理するフェイズのフラグ値を格納
var previousChapter = 0; // 次に処理するフェイズのフラグ値を格納時、現行の処理中フェイズのフラグ値を格納
const mainloopInterval = 100; // メイン処理の実行間隔

//デバッグ画面、テスト用ダミークラス有効科フラグ
let masterDebugger = {
  showSensorParamDisplay: false,
  useVL53L0XDummy: false,
  useFlowDummy: false,
  useWebcamDummy: false
};

window.onload = () => {
  //Webカメラ優先選択
  async function getConstraintsDevice(deviceNames, constraints) {
    var device = undefined;

    var resolutionWidth = 1280;
    var resolutionHeight = 720;

    constraints = {
      audio: false,
      video: {
        width: { exact: resolutionWidth },
        height: { exact: resolutionHeight }
      }
    };

    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        // 成功時
        devices.forEach(function (device) {
          // カメラデバイスごとの処理
          for (var i = 0; i < deviceNames.devices.length; i++) {
            var pattern = deviceNames.devices[i]["name"];
            if (device.label.match(pattern)) {
              constraints["video"]["width"]["exact"] =
                deviceNames.devices[i]["width"];
              constraints["video"]["height"]["exact"] =
                deviceNames.devices[i]["height"];
              constraints["deviceId"] = device.deviceId;
            }
          }
        });
      })
      .catch(function (err) {
        // エラー発生時
        console.error("getConstraintsDevice:enumerateDevide ERROR:", err);
      });
  }

  // 初期化関数
  function init() {
    //Webカメラ用要素取得
    var video = document.querySelector("#video");
    var canvas = document.querySelector("#overlay");
    var constraints;
    getConstraintsDevice(useWebcamDevice, constraints);

    var flag = {};

    if (!masterDebugger.showSensorParamDisplay) {
      //デバッグ用ディスプレイ
      var debugElem = document.getElementById("debug");
      debugElem.style.visibility = "hidden";
    }

    //Webカメラ
    if (masterDebugger.useWebcamDummy) {
      //ダミークラス
      flag.webcam = new webcamDummy(video, canvas, constraints, true);
    } else {
      document.getElementById("btcam").style.visibility = "hidden";
      flag.webcam = new webcam(video, canvas, constraints, false);
    }

    //距離センサ
    if (masterDebugger.useVL53L0XDummy) {
      //ダミークラス
      flag.vl = new VL53L0XGetterDummy(false);
    } else {
      document.getElementById("btvl").style.visibility = "hidden";
      flag.vl = new VL53L0XGetter(false);
    }

    //水流センサ
    if (masterDebugger.useFlowDummy) {
      //ダミークラス
      flag.flow = new waterflowGetterDummy(
        WATERFLOWSIGPORT,
        WATERFLOWFLAG,
        true
      );
    } else {
      document.getElementById("btflow").style.visibility = "hidden";
      flag.flow = new waterflowGetter(WATERFLOWSIGPORT, WATERFLOWFLAG, false);
    }

    return flag;
  }

  //音声周り初期化
  function soundInit() {
    var soundElems = {
      list: [
        { chp: CHAPT_handWashReady, elem: document.getElementById("detect") },
        { chp: CHAPT_handWashFault, elem: document.getElementById("fault") },
        { chp: CHAPT_handWashSuccess, elem: document.getElementById("success") }
      ]
    };
    return soundElems;
  }

  // 待ち受け処理関数
  const funcWaiting = (chapter) => {
    //待ち受け
    if (chapter == CHAPT_waiting) {
      if (_waiting.isWaterFlow()) {
        // 水が流れている場合は、水停止に
        chapter = CHAPT_stopFlow;
        // 呼び出し元を保存
        previousChapter = CHAPT_waiting;
      } else {
        if (_waiting.isParsonHandWashReady()) {
          chapter = CHAPT_handWashReady;
        } else if (!_waiting.isYetStart()) {
          //最初に呼ばれた場合のみ、表示処理
          _waiting.start();
        }
      }
    }
    return chapter;
  };

  // 手洗い開始準備処理関数
  const funcHandWashReady = (chapter) => {
    if (chapter != CHAPT_handWashReady) {
      return chapter;
    } else {
      // 手洗い開始準備案内

      if (_handWashReady.isOutOfRange()) {
        _handWashReady.RangeInStartTime = undefined;

        if (!_handWashReady.outofRangeTime) {
          _handWashReady.outofRangeTime = new Date();
        }

        //距離　顔認識反応外
        if (_handWashReady.isWaterFlow()) {
          _handWashReady.outofRangeTime = undefined;
          _handWashReady.RangeInStartTime = undefined;
          _handWashReady.stop();
          // 水が流れている場合は、水停止に
          chapter = CHAPT_stopFlow;
          // 呼び出し元を保存
          previousChapter = CHAPT_handWashReady;
          return chapter;
        }

        if (!_handWashReady.isWaterFlow() && _handWashReady.isYetStart) {
          //距離　顔認識反応外で水が出てない場合
          //人がいないので一定時間で、待ち受けに戻る
          var now = new Date();
          now.setMilliseconds(
            now.getMilliseconds() - HandWashReady_outOfRange_Wainting
          );

          if (now.getTime() > _handWashReady.outofRangeTime.getTime()) {
            _handWashReady.outofRangeTime = undefined;
            _handWashReady.RangeInStartTime = undefined;
            _handWashReady.stop();
            chapter = CHAPT_waiting;
          }
        }
        return chapter;
      } else {
        _handWashReady.outofRangeTime = undefined;

        if (!_handWashReady.RangeInStartTime) {
          _handWashReady.RangeInStartTime = new Date();
        }

        //距離　顔認識反応内
        if (_handWashReady.isWaterFlow() && !_handWashReady.isYetStart()) {
          // 本画面の案内開始前に水が出ている場合、水が流れている場合は、水停止に
          chapter = CHAPT_stopFlow;
          // 呼び出し元を保存
          previousChapter = CHAPT_handWashReady;
          _handWashReady.outofRangeTime = undefined;
          _handWashReady.RangeInStartTime = undefined;
          _handWashReady.stop();
          return chapter;
        }

        if (_handWashReady.isWaterFlow() && _handWashReady.isYetStart()) {
          // 認識範囲内で案内した後に水が出る
          // 手洗い中へ
          chapter = CHAPT_handWashing;
          _handWashReady.outofRangeTime = undefined;
          _handWashReady.RangeInStartTime = undefined;
          _handWashReady.stop();
          return chapter;
        }

        if (!_handWashReady.isWaterFlow() && !_handWashReady.isYetStart()) {
          //最初に呼ばれた場合のみ、処理

          var nowIn = new Date();
          nowIn.setMilliseconds(
            nowIn.getMilliseconds() - HandWashReady_RangeIn_Wainting
          );

          if (nowIn.getTime() > _handWashReady.RangeInStartTime.getTime()) {
            _handWashReady.outofRangeTime = undefined;
            _handWashReady.RangeInStartTime = undefined;
            _handWashReady.start();
          }
          return chapter;
        }
      }

      return chapter;
      //距離　顔認識反応内ここまで
    }
  };

  // 手洗い中処理関数
  const funcHandWashing = (chapter) => {
    if (chapter == CHAPT_handWashing) {
      // 手洗い中
      if (!_handWashing.isYetStart()) {
        _handWashing.start();
      }

      if (!_handWashing.timeOver()) {
        // 時間内
        if (_handWashing.isOutOfRange()) {
          // 距離センサ、カメラ認識範囲外
          if (!_handWashing.isWaterFlow()) {
            _handWashing.stop();
            //待ち受けに
            chapter = CHAPT_waiting;
            previousChapter = CHAPT_handWashing;
          } else {
            _handWashing.stop();
            //水停止へ
            chapter = CHAPT_stopFlow;
            // 呼び出し元を保存
            previousChapter = CHAPT_handWashing;
          }
        } else {
          // 距離センサ、カメラ認識範囲内
          if (!_handWashing.isWaterFlow()) {
            if (_handWashing.isHandWashSuccess()) {
              //手洗い成功へ
              _handWashing.stop();
              chapter = CHAPT_handWashSuccess;
            } else {
              //手洗い失敗へ
              _handWashing.stop();
              chapter = CHAPT_handWashFault;
            }
          }
        }
      } else {
        _handWashing.stop();
        //水停止へ
        chapter = CHAPT_stopFlow;
        // 呼び出し元を保存
        previousChapter = CHAPT_handWashing;
      }
    }
    return chapter;
  };

  // 手洗い成功処理関数
  const funcHandWashSuccess = (chapter) => {
    //手洗い成功
    if (chapter == CHAPT_handWashSuccess) {
      if (!_handWashSuccess.isYetStart()) {
        _handWashSuccess.start(HandWashSuccessEffectDispTime);
      } else if (_handWashSuccess.effectDisplaied) {
        _handWashSuccess.stop();
        //演出終了で、待ち受けに
        chapter = CHAPT_waiting;
      }
    }
    return chapter;
  };

  // 手洗い失敗処理関数
  const funcHandWashFault = (chapter) => {
    //手洗い失敗
    if (chapter == CHAPT_handWashFault) {
      if (!_handWashFault.isYetStart()) {
        _handWashFault.start(HandWashFaultEffectDispTime);
      } else if (_handWashFault.effectDisplaied) {
        _handWashFault.stop();
        //演出終了で、待ち受けに
        chapter = CHAPT_waiting;
      }
    }
    return chapter;
  };

  // 水停止処理関数
  const funcStopFlow = (chapter) => {
    //水停止
    if (chapter == CHAPT_stopFlow) {
      if (!_stopFlow.isWaterFlow()) {
        _stopFlow.stop();
        //呼び出しもと（待ち受け、手洗い準備、手洗い中）によって移動先を変更
        //ただし呼び出し元が手洗い中の場合は、高確率で人がいないので、待ち受けに戻る
        if (previousChapter == CHAPT_handWashing) {
          chapter = CHAPT_waiting;
        } else {
          chapter = previousChapter;
        }
      } else if (!_stopFlow.isYetStart()) {
        //最初に呼ばれた場合のみ、処理
        _stopFlow.start();
      }
    }
    return chapter;
  };

  // メインループ
  const mainloop = () => {
    //デバッグ用カレントチャプター表示
    var debugChptElem = document.getElementById("debugChpt");
    switch (nextChapter) {
      case CHAPT_waiting:
        debugChptElem.innerHTML = "待ち受け";
        break;
      case CHAPT_handWashReady:
        debugChptElem.innerHTML = "手洗い準備";
        break;
      case CHAPT_handWashing:
        debugChptElem.innerHTML = "手洗い中";
        break;
      case CHAPT_handWashSuccess:
        debugChptElem.innerHTML = "手洗い成功";
        break;
      case CHAPT_handWashFault:
        debugChptElem.innerHTML = "手洗い失敗";
        break;
      case CHAPT_stopFlow:
        debugChptElem.innerHTML = "水停止";
        break;
      default:
    }

    //チャプター処理開始(ただしnextChapterが、該当のチャプタだけ実行される）
    nextChapter = funcWaiting(nextChapter);
    nextChapter = funcHandWashReady(nextChapter);
    nextChapter = funcHandWashing(nextChapter);
    nextChapter = funcHandWashSuccess(nextChapter);
    nextChapter = funcHandWashFault(nextChapter);
    nextChapter = funcStopFlow(nextChapter);
    window.setTimeout(mainloop, mainloopInterval);
  };

  // 処理開始
  kira();

  //開始時は待ち受けフェイズに
  nextChapter = CHAPT_waiting;

  ///センサー類オブジェクトの宣言
  var flagment = init();

  //音声周り要素の取得
  var soundElems = soundInit();

  // デバッグ用センサー元クラス値表示用要素の取得
  (async () => {
    var dist = document.getElementById("ddist");
    await flagment.vl.start(dist);
  })();

  (async () => {
    var dist = document.getElementById("fdist");
    await flagment.flow.start(dist);
  })();

  flagment.webcam.start(
    (() => {
      var dist = document.getElementById("cdist");
      return dist;
    })()
  );

  // デバッグ用funcBaseセンサークラス値表示用要素の取得
  var funcBasevl = document.getElementById("ddistfuncBase");
  var funcBaseflow = document.getElementById("fdistfuncBase");
  var funcBasecam = document.getElementById("cdistfuncBase");

  const ponement = new ponementChacker(
    flagment,
    funcBasevl,
    funcBaseflow,
    funcBasecam,
    true
  );

  ponement.start();

  // 各フェイズ処理用クラスの宣言　第二引数は演出用要素
  const _waiting = new waiting(undefined, ponement, true);
  const _handWashReady = new handWashReady(
    (() => {
      var elem = document.getElementById("elemHandWashReady");
      return elem;
    })(),
    ponement,
    soundElems,
    true
  );
  const _handWashing = new handWashing(
    (() => {
      var elem = document.getElementById("elemHandWashing");
      return elem;
    })(),
    ponement,
    true
  );
  const _handWashSuccess = new handWashSuccess(
    (() => {
      var elem = document.getElementById("elemHandWashSuccess");
      return elem;
    })(),
    ponement,
    soundElems,
    true
  );
  const _handWashFault = new handWashFault(
    (() => {
      var elem = document.getElementById("elemHandWashFault");
      return elem;
    })(),
    ponement,
    soundElems,
    true
  );
  const _stopFlow = new stopFlow(
    (() => {
      var elem = document.getElementById("elemStopFlow");
      return elem;
    })(),
    ponement,
    true
  );

  // ループ用関数の呼び出し
  window.setTimeout(mainloop, mainloopInterval);
};
