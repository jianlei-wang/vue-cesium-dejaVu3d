import Covert from "../Convert";
const Radar = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
  this.handler = null;
  this.defaultOptions = {
    position: [0, 0],
    radius: 100,
    heading: 0,
    headingStep: 1,
  };
};
Radar.prototype = {
  /**
   *绘制动态雷达雷达对象（带遮罩）
   * @param {object} options 参数{位置，半径，方位角，速度}
   * @param {*} wallColor 挡板颜色
   * @param {*} eliInnerColor 遮罩面颜色
   * @param {*} eliOutColor 遮罩线颜色
   * @returns 雷达对象 Entity
   */
  CreateNewRadar(options, wallColor, eliInnerColor, eliOutColor) {
    let $this = this;
    let _Covert = new Covert($this.mapViewer, $this.mapWorld);
    $this.mapViewer.scene.globe.depthTestAgainstTerrain = true;
    let radar_entitys = $this.mapViewer.entities.add(
      new $this.mapWorld.Entity()
    );
    let heading =
      options && options.heading
        ? options.heading
        : $this.defaultOptions.heading;
    let x =
      options && options.position
        ? options.position[0]
        : $this.defaultOptions.position[0];
    let y =
      options && options.position
        ? options.position[1]
        : $this.defaultOptions.position[1];
    let radius =
      options && options.radius ? options.radius : $this.defaultOptions.radius;
    let pos = _Covert.CalcPoints(x, y, radius, heading);
    let positionArr = _Covert.ComputeCirclularFlight(
      x,
      y,
      pos[0],
      pos[1],
      0,
      90
    );

    $this.mapViewer.entities.add({
      parent: radar_entitys,
      name: "Radar-Wall",
      wall: {
        positions: new $this.mapWorld.CallbackProperty(() => {
          return $this.mapWorld.Cartesian3.fromDegreesArrayHeights(positionArr);
        }, false),
        material: wallColor
          ? wallColor
          : $this.mapWorld.Color.RED.withAlpha(0.5),
      },
    });
    $this.mapViewer.entities.add({
      parent: radar_entitys,
      name: "Radar-Ellipsoid",
      position: $this.mapWorld.Cartesian3.fromDegrees(x, y),
      ellipsoid: {
        radii: new $this.mapWorld.Cartesian3(radius, radius, radius),
        maximumCone: $this.mapWorld.Math.toRadians(90),
        material: eliInnerColor
          ? eliInnerColor
          : $this.mapWorld.Color.GREEN.withAlpha(0.3),
        outline: true,
        outlineColor: eliOutColor
          ? eliOutColor
          : $this.mapWorld.Color.YELLOW.withAlpha(0.5),
        outlineWidth: 1,
      },
    });
    let step =
      options && options.headingStep
        ? options.headingStep
        : this.defaultOptions.headingStep;
    // 执行动画效果
    $this.mapViewer.clock.onTick.addEventListener(() => {
      heading += step;
      let pos = _Covert.CalcPoints(x, y, radius, heading);
      positionArr = _Covert.ComputeCirclularFlight(x, y, pos[0], pos[1], 0, 90);
    });
    $this.mapViewer.scene.globe.depthTestAgainstTerrain = false;
    return radar_entitys;
  },
};
export default Radar;
