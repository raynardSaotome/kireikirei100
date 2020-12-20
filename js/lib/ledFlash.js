let LEDFLASHSIGPORT = 14;
let LEDFLASHFLAG = 1;

const ledFlash = class {
  constructor(pin, flag, debug = false) {
    this.pin = pin;
    this.flag = flag;
    this.gpioAccess = undefined;
    this.ledPort = undefined;
    this.debug = debug;
  }

  async init() {
    this.gpioAccess = await navigator.requestGPIOAccess(); // GPIO を操作する
    this.ledPort = this.gpioAccess.ports.get(this.pin);
    await this.ledPort.export("out");
  }

  write(val) {
    var num = val ? 1 : 0;
    this.ledPort.write(num);
  }
};
