let CHAPT_waiting = 0; // フェイズフラグ用定数　待ち受け
let CHAPT_handWashReady = 1; // フェイズフラグ用定数　手洗い準備
let CHAPT_handWashing = 2; // フェイズフラグ用定数　手洗い中
let CHAPT_handWashSuccess = 3; // フェイズフラグ用定数　手洗い成功
let CHAPT_handWashFault = 4; // フェイズフラグ用定数　手洗い失敗
let CHAPT_stopFlow = 5; // フェイズフラグ用定数　水停止

//Webカメラトラッキング後範囲外許容時間
const webcamPostponement = 2000;
//距離センサ後範囲外許容時間
const vlRangePostponement = 2000;
//水流センサ後範囲外許容時間
const flowISFlowPostponement = 1400;

//優先Webカメラ
const useWebcamDevice = {
  devices: [
    {
      name: "Qcam for Notebooks Pro", //はぎはら個人持ち
      width: 1280,
      height: 960
    },
    {
      name: "USB Camera", //本番用
      width: 1920,
      height: 1080
    }
  ]
};
