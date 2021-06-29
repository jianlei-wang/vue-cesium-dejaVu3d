import Convert from "./Convert";
const Navigate = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
  this.handler = null;
};
Navigate.prototype = {
  init: function () {
    alert("我是导航组件");
  },
  /**
   * flyTo 视角飞行到指定位置，并执行后续操作
   * @param {{x:Number,y:Number,z:Number,head:Number,pitch:Number,roll:Number}} option
   * x-经度（十进制度）、y-维度（十进制度），z-高度（m）、head-偏航角（弧度），pitch-俯仰角（弧度）、roll-翻滚角（弧度）
   * @param {*} time 飞行时间（s）
   * @param {*} callback 回调函数
   */
  flyTo: function (option, time, callback) {
    this.mapViewer.camera.flyTo({
      destination: new this.mapWorld.Cartesian3.fromDegrees(
        option.x,
        option.y,
        option.z
      ),
      orientation: {
        heading: option.head ? option.head : 1,
        pitch: option.pitch ? option.pitch : -1,
        roll: option.roll ? option.roll : 0,
      },
      duration: time,
    });

    if (callback && typeof callback == "function") {
      setTimeout(() => {
        callback();
      }, (time + 0.5) * 1000);
    }
  },
  /**
   * 获取当前视图中心点信息
   * @returns 中心点对象{lon: xx, lat: yy, height: zz}
   */
  getCenterPosition: function () {
    let result = this.mapViewer.camera.pickEllipsoid(
      new this.mapWorld.Cartesian2(
        this.mapViewer.canvas.clientWidth / 2,
        this.mapViewer.canvas.clientHeight / 2
      )
    );
    let curPosition = this.mapWorld.Ellipsoid.WGS84.cartesianToCartographic(
      result
    );
    let lon = (curPosition.longitude * 180) / Math.PI;
    let lat = (curPosition.latitude * 180) / Math.PI;
    let height = this.getCameraHeight();
    return { lon: lon, lat: lat, height: height };
  },
  /**
   * 获取当前相机高度，单位m
   * @returns 相机高度（m）
   */
  getCameraHeight: function () {
    if (this.mapViewer) {
      let scene = this.mapViewer.scene;
      let ellipsoid = scene.globe.ellipsoid;
      let height = ellipsoid.cartesianToCartographic(
        this.mapViewer.camera.position
      ).height;
      return height;
    }
  },
  /**
   * 截取当前窗口相机状态参数
   * @param {object} result
   * @returns 相机参数（x, y, z, heading, pitch, roll）
   */
  copyCamera(result) {
    let _convert = new Convert(this.mapViewer, this.mapWorld);
    let position = _convert.DegreeFromCartesian3(
      this.mapViewer.camera.position
    );
    result = {
      x: position.lon,
      y: position.lat,
      z: position.height,
      head: this.mapViewer.camera.heading,
      pitch: this.mapViewer.camera.pitch,
      roll: this.mapViewer.camera.roll,
    };
    return result;
  },
  /**
   * 获取鼠标点击处信息（建议控制台调试使用）
   */
  getCursorInfo() {
    let $this = this;
    $this.mapViewer.scene.globe.depthTestAgainstTerrain = true;
    $this.initHandler();
    $this.handler = new $this.mapWorld.ScreenSpaceEventHandler(
      $this.mapViewer.canvas
    );
    $this.handler.setInputAction(function (movement) {
      let cartesian = $this.mapViewer.scene.pickPosition(movement.position);
      let cartographic = $this.mapWorld.Ellipsoid.WGS84.cartesianToCartographic(
        cartesian
      );
      let lon = (cartographic.longitude * 180) / Math.PI;
      let lat = (cartographic.latitude * 180) / Math.PI;
      let height = cartographic.height;
      let result = {
        Cartesian2: movement.position,
        Cartesian3: cartesian,
        Cartographic: cartographic,
        Degree: {
          lon: lon,
          lat: lat,
          height: height,
        },
      };
      console.log(result);
    }, $this.mapWorld.ScreenSpaceEventType.LEFT_CLICK);
  },
  initHandler() {
    if (this.handler && this.handler != null) {
      this.handler.destroy();
      this.handler = null;
    }
  },
};
export default Navigate;
