const Convert = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
};
Convert.prototype = {
  init: function () {
    alert("转换组件");
  },
  /**
   * 坐标转换：经纬度坐标根据设置的原点获取绝对坐标
   * @param {Array} currentPos 待转换经纬度点
   * @param {Array} centorPos 设置的经纬度原点
   * @param {object} reslut 返回转换后结果
   * @returns result {x:'',y:'',z:''}
   */
  Corord2Absolute(currentPos, centorPos, reslut) {
    let x_pos = [currentPos[0], centorPos[1], centorPos[2]];
    let y_pos = [centorPos[0], currentPos[1], centorPos[2]];
    reslut = {
      lon: this.GetDistance(x_pos, centorPos),
      lat: this.GetDistance(y_pos, centorPos),
      height: currentPos[2] - centorPos[2],
    };
    return reslut;
  },
  /**
   * 获取空间两点间距离（经纬度）
   * @param {Array} source 起始点
   * @param {Array} target 目标点
   * @returns 两点间距离（m）
   */
  GetDistance(source, target) {
    /**根据经纬度计算出距离**/
    let Cartographic_Source = this.mapWorld.Cartographic.fromDegrees(
      Number(source[0]),
      Number(source[1]),
      Number(source[2])
    );
    let Cartographic_Target = this.mapWorld.Cartographic.fromDegrees(
      Number(target[0]),
      Number(target[1]),
      Number(target[2])
    );
    let geodesic = new this.mapWorld.EllipsoidGeodesic();
    geodesic.setEndPoints(Cartographic_Source, Cartographic_Target);
    let s = geodesic.surfaceDistance;
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
        Math.pow(Cartographic_Source.height - Cartographic_Target.height, 2)
    );
    return s;
  },
  /**
   * 坐标转换：Cartesian3转换为经纬度
   * @param {object} cartesian3 待转换的Cartesian3坐标
   * @returns 经纬度 {lon, lat, height}
   */
  DegreeFromCartesian3(cartesian3) {
    let cartographic = this.mapWorld.Ellipsoid.WGS84.cartesianToCartographic(
      cartesian3
    );
    let lon = (cartographic.longitude * 180) / Math.PI;
    let lat = (cartographic.latitude * 180) / Math.PI;
    let height = cartographic.height;
    return { lon: lon, lat: lat, height: height };
  },
  /**
   * 根据两个点 开始角度、夹角度 求取立面的扇形
   * @param {number} x1 点1经度
   * @param {number} y1 点1维度
   * @param {number} x2 点2经度
   * @param {number} y2 点2维度
   * @param {number} fx 初始角度
   * @param {number} angle 夹角大小
   * @returns 构成立面扇形的点数组
   */
  ComputeCirclularFlight(x1, y1, x2, y2, fx, angle) {
    let positionArr = [];
    positionArr.push(x1);
    positionArr.push(y1);
    positionArr.push(0);
    let radius = this.mapWorld.Cartesian3.distance(
      this.mapWorld.Cartesian3.fromDegrees(x1, y1),
      this.mapWorld.Cartesian3.fromDegrees(x2, y2)
    );
    for (let i = fx; i <= fx + angle; i++) {
      let h = radius * Math.sin((i * Math.PI) / 180.0);
      let r = Math.cos((i * Math.PI) / 180.0);
      let x = (x2 - x1) * r + x1;
      let y = (y2 - y1) * r + y1;
      positionArr.push(x);
      positionArr.push(y);
      positionArr.push(h);
    }
    return positionArr;
  },

  /**
   * 根据第一个点 偏移距离 角度 求取第二个点的坐标
   * @param {number} x1
   * @param {number} y1
   * @param {number} radius
   * @param {number} heading
   * @returns 目标点坐标 [x,y]
   */
  CalcPoints(x1, y1, radius, heading) {
    let m = this.mapWorld.Transforms.eastNorthUpToFixedFrame(
      this.mapWorld.Cartesian3.fromDegrees(x1, y1)
    );
    let rx = radius * Math.cos((heading * Math.PI) / 180.0);
    let ry = radius * Math.sin((heading * Math.PI) / 180.0);
    let translation = this.mapWorld.Cartesian3.fromElements(rx, ry, 0);
    let d = this.mapWorld.Matrix4.multiplyByPoint(
      m,
      translation,
      new this.mapWorld.Cartesian3()
    );
    let c = this.mapWorld.Cartographic.fromCartesian(d);
    let x2 = this.mapWorld.Math.toDegrees(c.longitude);
    let y2 = this.mapWorld.Math.toDegrees(c.latitude);
    return [x2, y2];
  },
};
export default Convert;
