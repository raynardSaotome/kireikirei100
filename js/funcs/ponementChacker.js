let ponementChackerRangeInInterval = 20;
let ponementChackerWaterFlowInterval = 10;
let ponementChackerTrackedInterval = 20;

class ponementChacker {
  constructor(
    flagment,
    elemVl = undefined,
    elemFlow = undefined,
    elemCam = undefined,
    debug = false
  ) {
    /* コンストラクタ */
    this.vl = flagment.vl; //距離センサ　インスタンス
    this.flow = flagment.flow; //水流センサ　インスタンス
    this.cam = flagment.webcam; //Webカメラ　インスタンス

    this.vl_isRangeIn = false; //距離センサが指定範囲ないかどうか
    this.vl_isRangeOutTime = undefined; //距離センサ指定範囲外許容時間計算用

    this.flow_isWaterFlow = false; //水流センサが水が流れているかどうか
    this.flow_isWaterFlowTime = undefined; //水流センサ停止中許容時間計算用

    this.cam_isTracked = false; //カメラがトラッキングできているかどうか
    this.cam_isTrackedOutTime = undefined; //カメラトラッキング外許容時間計算用

    this.debug = debug;
    this.debugElemVl = elemVl;
    this.debugElemFlow = elemFlow;
    this.debugElemCam = elemCam;
    //    this.led = new ledFlash(LEDFLASHSIGPORT, LEDFLASHFLAG, true);
  }

  // 距離センサ指定範囲内かどうか（許容値考慮
  sensorRangeInCheck = () => {
    if (this.vl.isRangeIn()) {
      this.vl_isRangeIn = true;
      this.vl_isRangeOutTime = undefined;
    } else {
      if (!this.vl_isRangeOutTime) {
        this.vl_isRangeOutTime = new Date();
        this.vl_isRangeOutTime.setMilliseconds(
          this.vl_isRangeOutTime.getMilliseconds() + vlRangePostponement
        );
      }

      if (new Date().getTime() >= this.vl_isRangeOutTime.getTime()) {
        this.vl_isRangeIn = false;
      }
    }

    if (this.debug) {
      if (this.debugElemVl) {
        this.debugElemVl.innerHTML = this.vl_isRangeIn;
      }
    }

    //    this.led.write(this.vl_isRangeIn);

    window.setTimeout(this.sensorRangeInCheck, ponementChackerRangeInInterval);
  };

  // 水流センサ流れているかどうか（許容値考慮
  sensorWaterFlowCheck = () => {
    if (this.flow.isFlow()) {
      this.flow_isWaterFlow = true;
      this.flow_isWaterFlowTime = undefined;
    } else {
      if (!this.flow_isWaterFlowTime) {
        this.flow_isWaterFlowTime = new Date();
        this.flow_isWaterFlowTime.setMilliseconds(
          this.flow_isWaterFlowTime.getMilliseconds() + flowISFlowPostponement
        );
      }

      if (new Date().getTime() >= this.flow_isWaterFlowTime.getTime()) {
        this.flow_isWaterFlow = false;
      }
    }

    if (this.debug) {
      if (this.debugElemFlow) {
        this.debugElemFlow.innerHTML = this.flow_isWaterFlow;
      }
    }

    window.setTimeout(
      this.sensorWaterFlowCheck,
      ponementChackerWaterFlowInterval
    );
  };

  // カメラトラッキングされたかどうか（許容値考慮
  sensorTrackedCheck = () => {
    if (this.cam.isTracked()) {
      this.cam_isTracked = true;
      this.cam_isTrackedOutTime = undefined;
    } else {
      if (!this.cam_isTrackedOutTime) {
        this.cam_isTrackedOutTime = new Date();
        this.cam_isTrackedOutTime.setMilliseconds(
          this.cam_isTrackedOutTime.getMilliseconds() + webcamPostponement
        );
      }

      if (new Date().getTime() >= this.cam_isTrackedOutTime.getTime()) {
        this.cam_isTracked = false;
      }
    }

    if (this.debug) {
      if (this.debugElemCam) {
        this.debugElemCam.innerHTML = this.cam_isTracked;
      }
    }

    window.setTimeout(this.sensorTrackedCheck, ponementChackerTrackedInterval);
  };

  //水が流れているかどうかを返す
  isWaterFlow() {
    return this.flow_isWaterFlow;
    //return this.flow.isFlow();
  }

  //距離センサが範囲に入っているかどうかを返す
  isRangeIn() {
    return this.vl_isRangeIn;
    //    return this.vl.isRangeIn();
  }

  //Webカメラが認識できてるかどうかを返す
  isCamGetCurrentPosition() {
    return this.cam_isTracked;
    //    return this.cam.isTracked();
  }

  start() {
    /*
    (async () => {
      await this.led.init();
    })();
*/
    window.setTimeout(this.sensorRangeInCheck, ponementChackerRangeInInterval);

    window.setTimeout(
      this.sensorWaterFlowCheck,
      ponementChackerWaterFlowInterval
    );

    window.setTimeout(this.sensorTrackedCheck, ponementChackerTrackedInterval);
  }
}
