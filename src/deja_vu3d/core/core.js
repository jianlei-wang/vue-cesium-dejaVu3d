import "../css/index.css";
import Components from "../js/components";
import * as Cesium from "cesium/Cesium";
import "cesium/Widgets/widgets.css";

const coreMap = function (eleId, options) {
  this.key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDhhOThhNy0zMzUzLTRiZDktYWM3Ni00NGI5MGY2N2UwZDUiLCJpZCI6MjQzMjYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODUwMzUwNDh9.DYuDF_RPKe5_8w849_y-sutM68LM51O9o3bTt_3rF1w";
  this.eleId = eleId;
  this.options = options;
  this.init();
};
coreMap.prototype = {
  init: function () {
    let $this = this;
    Cesium.Ion.defaultAccessToken = $this.key;
    $this.mapViewer = new Cesium.Viewer($this.eleId, {
      imageryProvider: new Cesium.SingleTileImageryProvider({
        url: require("../GlobalBkLayer.jpg"),
        rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
      }),
      //加载在线地形图数据
      terrainProvider: $this.initTerrain($this.options),
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: true,
      timeline: true,
      fullscreenButton: false,
      vrButton: false,

      //关闭点选出现的提示框
      selectionIndicator: false,
      infoBox: false,
    });
    $this.mapWorld = Cesium;
    if ($this.options && $this.options.imageLayer) {
      $this.mapViewer.imageryLayers.addImageryProvider(
        $this.initImageLayer($this.options)
      );
    }

    $this.Components = new Components(this.mapViewer, this.mapWorld);
  },
  initImageLayer: function (options) {
    let imageProvider;
    if (
      options &&
      options != null &&
      options.imageLayer &&
      options.imageLayer != null
    ) {
      switch (options.imageLayer.type) {
        case "tms":
          imageProvider = new Cesium.TileMapServiceImageryProvider({
            url: options.imageLayer.url,
          });
          break;
        case "single":
          imageProvider = new Cesium.SingleTileImageryProvider({
            url: options.imageLayer.url,
            rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
          });
          break;
        default:
          break;
      }
    } else {
      imageProvider = new Cesium.UrlTemplateImageryProvider({
        url:
          "http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=6",
      });
    }
    return imageProvider;
  },
  initTerrain: function (options) {
    let terrainLayer;
    if (
      options &&
      options != null &&
      options.terrainLayer &&
      options.terrainLayer != null
    ) {
      terrainLayer = new Cesium.CesiumTerrainProvider({
        url: options.terrainLayer.url,
        minimumLevel: options.terrainLayer.minimumLevel,
        maximumLevel: options.terrainLayer.maximumLevel,
        requestVertexNormals: true,
      });
    } else {
      terrainLayer = null;
    }
    return terrainLayer;
  },
};
export default coreMap;
