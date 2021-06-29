const MeasurementAnalysis = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
  this.init();
};
MeasurementAnalysis.prototype = {
  init: function () {
    this.MeasureObject = this.mapViewer.entities.add(
      new this.mapWorld.Entity()
    );
  },
  clearAll: function () {
    let $this = this;
    if ($this.MeasureObject) {
      $this.MeasureObject._children.forEach((element) => {
        $this.mapViewer.entities.remove(element);
      });
    }
  },
  /**
   * @name 距离量测
   * @param {*} type
   * 距离量测类型 'space'-空间；'terrain'-地表
   */
  distanceMeasure: function (type) {
    let $this = this;
    let positions = [];
    let poly = null;
    let distance = 0;

    let DistanceArray = [];
    let m_bool = false;
    $this.mapViewer.scene.globe.depthTestAgainstTerrain = true;
    $this.handler = new $this.mapWorld.ScreenSpaceEventHandler(
      $this.mapViewer.canvas
    );
    $this.handler.setInputAction(function (movement) {
      // movement.position.x = movement.position.x - outerW;
      let cartesian = $this.mapViewer.scene.pickPosition(movement.position);
      if (positions.length == 0) {
        positions.push(cartesian.clone());
      }
      positions.push(cartesian);
      if (m_bool && poly) {
        //进行插值计算
        $this.interPoints(positions);
        distance = $this.getSpaceDistance($this.positions_Inter);
      } else {
        distance = $this.getSpaceDistance(positions);
      }
      let textDisance = distance + "m";
      DistanceArray.push(distance);
      $this.floatingPoint = $this.mapViewer.entities.add({
        parent: $this.MeasureObject,
        name: "直线距离",
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: $this.mapWorld.Color.RED,
          outlineColor: $this.mapWorld.Color.WHITE,
          outlineWidth: 2,
          heightReference: $this.mapWorld.HeightReference.NONE,
        },
        label: {
          text: textDisance,
          font: "12pt sans-serif",
          style: $this.mapWorld.LabelStyle.FILL_AND_OUTLINE, //FILL  FILL_AND_OUTLINE OUTLINE
          fillColor: $this.mapWorld.Color.YELLOW,
          showBackground: true, //指定标签后面背景的可见性
          backgroundColor: new $this.mapWorld.Color(0.165, 0.165, 0.165, 0.8), // 背景颜色
          backgroundPadding: new $this.mapWorld.Cartesian2(6, 6), //指定以像素为单位的水平和垂直背景填充padding
          pixelOffset: new $this.mapWorld.Cartesian2(0, -25),
          // text: textDisance,
          // font: "18px sans-serif",
          // fillColor: $this.mapWorld.Color.GOLD,
          // style: $this.mapWorld.LabelStyle.FILL_AND_OUTLINE,
          // outlineWidth: 2,
          // verticalOrigin: $this.mapWorld.VerticalOrigin.BOTTOM,
          // pixelOffset: new $this.mapWorld.Cartesian2(20, -20),
          // heightReference: $this.mapWorld.HeightReference.NONE,
        },
      });
    }, $this.mapWorld.ScreenSpaceEventType.LEFT_CLICK);

    $this.handler.setInputAction(function (movement) {
      let cartesian = $this.mapViewer.scene.pickPosition(movement.endPosition);
      if (!cartesian) {
        return;
      }
      type == "space" ? (m_bool = false) : (m_bool = true);
      if (positions.length >= 2) {
        if (!$this.mapWorld.defined(poly)) {
          poly = $this.PolyLinePrimitive(positions, m_bool);
        } else {
          positions.pop();
          positions.push(cartesian);
        }
      }
    }, $this.mapWorld.ScreenSpaceEventType.MOUSE_MOVE);
    $this.handler.setInputAction(function () {
      $this.handler.destroy(); //关闭事件句柄
      positions.pop(); //最后一个点无效
      $this.mapViewer.scene.globe.depthTestAgainstTerrain = false;
    }, $this.mapWorld.ScreenSpaceEventType.RIGHT_CLICK);
  },
  heightMeasure() {
    let $this = this;
    let positions = [];
    let labelEntity_1 = null; // 标签实体
    let labelEntity_2 = null; // 标签实体
    let labelEntity_3 = null; // 标签实体
    $this.mapViewer.scene.globe.depthTestAgainstTerrain = true;
    $this.handler = new $this.mapWorld.ScreenSpaceEventHandler(
      $this.mapViewer.canvas
    );
    // 注册鼠标左击事件
    $this.handler.setInputAction(function (clickEvent) {
      let cartesian = $this.mapViewer.scene.pickPosition(clickEvent.position); // 坐标
      // 存储第一个点
      if (positions.length == 0) {
        positions.push(cartesian.clone());
        $this.addPoint(cartesian);
        // 注册鼠标移动事件
        $this.handler.setInputAction(function (moveEvent) {
          let movePosition = $this.mapViewer.scene.pickPosition(
            moveEvent.endPosition
          ); // 鼠标移动的点
          if (positions.length >= 2) {
            positions.pop();
            positions.pop();
            positions.pop();
            let cartographic = $this.mapWorld.Cartographic.fromCartesian(
              movePosition
            );
            let height = $this.mapWorld.Cartographic.fromCartesian(positions[0])
              .height;
            let verticalPoint = $this.mapWorld.Cartesian3.fromDegrees(
              $this.mapWorld.Math.toDegrees(cartographic.longitude),
              $this.mapWorld.Math.toDegrees(cartographic.latitude),
              height
            );
            positions.push(verticalPoint);
            positions.push(movePosition);
            positions.push(positions[0]);
            // 绘制label
            if (labelEntity_1) {
              $this.mapViewer.entities.remove(labelEntity_1);
              $this.mapViewer.entities.remove(labelEntity_2);
              $this.mapViewer.entities.remove(labelEntity_3);
            }
            // 计算中点
            let centerPoint_1 = $this.mapWorld.Cartesian3.midpoint(
              positions[0],
              positions[1],
              new $this.mapWorld.Cartesian3()
            );
            // 计算距离
            let lengthText_1 =
              "水平：" + $this.getLengthText(positions[0], positions[1]);
            labelEntity_1 = $this.addLabel(centerPoint_1, lengthText_1);
            // 计算中点
            let centerPoint_2 = $this.mapWorld.Cartesian3.midpoint(
              positions[1],
              positions[2],
              new $this.mapWorld.Cartesian3()
            );
            // 计算距离
            let lengthText_2 =
              "垂直：" + $this.getLengthText(positions[1], positions[2]);
            labelEntity_2 = $this.addLabel(centerPoint_2, lengthText_2);
            // 计算中点
            let centerPoint_3 = $this.mapWorld.Cartesian3.midpoint(
              positions[2],
              positions[3],
              new $this.mapWorld.Cartesian3()
            );
            // 计算距离
            let lengthText_3 =
              "直线：" + $this.getLengthText(positions[2], positions[3]);
            labelEntity_3 = $this.addLabel(centerPoint_3, lengthText_3);
          } else {
            let verticalPoint = new $this.mapWorld.Cartesian3(
              movePosition.x,
              movePosition.y,
              positions[0].z
            );
            positions.push(verticalPoint);
            positions.push(movePosition);
            positions.push(positions[0]);
            // 绘制线
            $this.addLine(positions);
          }
        }, $this.mapWorld.ScreenSpaceEventType.MOUSE_MOVE);
      } else {
        // 存储第二个点
        positions.pop();
        positions.pop();
        positions.pop();
        let cartographic = $this.mapWorld.Cartographic.fromCartesian(cartesian);
        let height = $this.mapWorld.Cartographic.fromCartesian(positions[0])
          .height;
        let verticalPoint = $this.mapWorld.Cartesian3.fromDegrees(
          $this.mapWorld.Math.toDegrees(cartographic.longitude),
          $this.mapWorld.Math.toDegrees(cartographic.latitude),
          height
        );
        positions.push(verticalPoint);
        positions.push(cartesian);
        positions.push(positions[0]);
        $this.addPoint(cartesian);
        $this.mapViewer.scene.globe.depthTestAgainstTerrain = false;
        $this.handler.destroy();
      }
    }, $this.mapWorld.ScreenSpaceEventType.LEFT_CLICK);
  },
  /**
   * 添加点
   * @param position
   */
  addPoint(position) {
    let $this = this;
    $this.mapViewer.entities.add(
      new $this.mapWorld.Entity({
        parent: $this.MeasureObject,
        position: position,
        point: {
          pixelSize: 5,
          color: $this.mapWorld.Color.RED,
          outlineColor: $this.mapWorld.Color.WHITE,
          outlineWidth: 2,
          heightReference: $this.mapWorld.HeightReference.NONE,
        },
      })
    );
  },
  /**
   * 添加标签
   * @param position
   * @param text
   */
  addLabel(centerPoint, text) {
    let $this = this;
    return $this.mapViewer.entities.add(
      new $this.mapWorld.Entity({
        parent: $this.MeasureObject,
        position: centerPoint,
        label: {
          text: text,
          font: "12pt sans-serif",
          style: $this.mapWorld.LabelStyle.FILL_AND_OUTLINE, //FILL  FILL_AND_OUTLINE OUTLINE
          fillColor: $this.mapWorld.Color.YELLOW,
          showBackground: true, //指定标签后面背景的可见性
          backgroundColor: new $this.mapWorld.Color(0.165, 0.165, 0.165, 0.8), // 背景颜色
          backgroundPadding: new $this.mapWorld.Cartesian2(6, 6), //指定以像素为单位的水平和垂直背景填充padding
          pixelOffset: new $this.mapWorld.Cartesian2(0, -25),
        },
      })
    );
  },
  /**
   * 计算两点距离
   * @param firstPoint
   * @param secondPoint
   */
  getLengthText(firstPoint, secondPoint) {
    let $this = this;
    // 计算距离
    let length = $this.mapWorld.Cartesian3.distance(firstPoint, secondPoint);
    if (length > 1000) {
      length = (length / 1000).toFixed(2) + " km";
    } else {
      length = length.toFixed(2) + " m";
    }
    return length;
  },
  /**
   * 添加线
   * @param positions
   */
  addLine(positions) {
    let $this = this;
    let dynamicPositions = new $this.mapWorld.CallbackProperty(function () {
      return positions;
    }, false);
    $this.mapViewer.entities.add(
      new $this.mapWorld.Entity({
        parent: $this.MeasureObject,
        polyline: {
          show: true,
          positions: dynamicPositions,
          material: $this.mapWorld.Color.CHARTREUSE,
          width: 2,
          clampToGround: false,
          // positions: dynamicPositions,
          // width: 4,
          // clampToGround: false,
          // material: $this.mapWorld.Color.RED,
        },
      })
    );
  },
  PolyLinePrimitive: function (positions, boolTerrain) {
    let $this = this;
    let _options = {
      parent: $this.MeasureObject,
      polyline: {
        show: true,
        positions: [],
        material: $this.mapWorld.Color.CHARTREUSE,
        width: 2,
        clampToGround: boolTerrain,
      },
    };
    let _update = function () {
      return positions;
    };
    //实时更新polyline.positions
    _options.polyline.positions = new $this.mapWorld.CallbackProperty(
      _update,
      false
    );
    $this.mapViewer.entities.add(_options);
    return positions;
  },
  //线段插值点
  interPoints: function (positions) {
    let $this = this;
    let positionsCartographic = [];
    let terrainSamplePositions = [];
    for (let index = 0; index < positions.length - 1; index++) {
      const element = positions[index];
      let ellipsoid = $this.mapViewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(element);
      positionsCartographic.push(cartographic);
    }
    for (let i = 0; i < positionsCartographic.length; i++) {
      const m_Cartographic0 = positionsCartographic[i];
      const m_Cartographic1 = positionsCartographic[i + 1];
      if (m_Cartographic1) {
        let a =
          Math.abs(m_Cartographic0.longitude - m_Cartographic1.longitude) *
          10000000;
        let b =
          Math.abs(m_Cartographic0.latitude - m_Cartographic1.latitude) *
          10000000;
        if (a > b) b = a;
        let length = parseInt(b / 10);
        if (length > 1000) length = 1000;
        if (length < 2) length = 2;
        for (let j = 0; j < length; j++) {
          terrainSamplePositions.push(
            new $this.mapWorld.Cartographic(
              $this.mapWorld.Math.lerp(
                m_Cartographic0.longitude,
                m_Cartographic1.longitude,
                j / (length - 1)
              ),
              $this.mapWorld.Math.lerp(
                m_Cartographic0.latitude,
                m_Cartographic1.latitude,
                j / (length - 1)
              )
            )
          );
        }
        terrainSamplePositions.pop();
      } else {
        terrainSamplePositions.push(m_Cartographic0);
      }
    }
    $this.positions_Inter = [];
    for (let n = 0; n < terrainSamplePositions.length; n++) {
      //地理坐标（弧度）转经纬度坐标
      let m_cartographic = terrainSamplePositions[n];
      let height = $this.mapViewer.scene.globe.getHeight(m_cartographic);
      let point = $this.mapWorld.Cartesian3.fromDegrees(
        (m_cartographic.longitude / Math.PI) * 180,
        (m_cartographic.latitude / Math.PI) * 180,
        height
      );
      $this.positions_Inter.push(point);
    }
  },
  //空间多点距离计算函数
  getSpaceDistance: function (positions) {
    let $this = this;
    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      let point1cartographic = $this.mapWorld.Cartographic.fromCartesian(
        positions[i]
      );
      let point2cartographic = $this.mapWorld.Cartographic.fromCartesian(
        positions[i + 1]
      );
      /**根据经纬度计算出距离**/
      let geodesic = new $this.mapWorld.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      //返回两点之间的距离
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      );
      distance = distance + s;
    }
    return distance.toFixed(2);
  },
};
export default MeasurementAnalysis;
