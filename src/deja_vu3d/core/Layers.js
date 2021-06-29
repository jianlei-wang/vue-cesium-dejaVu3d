/* * @Author: Wang jianLei
 * @Date: 2021-05-27 10:51:40
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2021-05-28 18:20:59
 * 新增获取模型位置方法getModelPosition
 */
const Layers = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
  this.handler = null;
  this.imageLayers = [];
  this.vectorLayers = [];
  this.meshLayers = [];
  this.init();
};
Layers.prototype = {
  init() {
    this.imageLayers = this.mapViewer.imageryLayers._layers;
  },
  /**
   * 加载模型数据
   * @param {string} type 模型数据类型 '3DTile'
   * @param {string} url 模型路径
   * @param {Boolean} boolZoom 是否在加载完成后跳转
   * @param {Function} callback 执行回调方法
   * @returns {object} model对象
   */
  createMeshLayer(type, url, boolZoom, callback) {
    let $this = this;
    let model = null;
    switch (type) {
      case "3DTile":
        model = new $this.mapWorld.Cesium3DTileset({
          url: url,
        });
        model.readyPromise.then(function (model) {
          $this.mapViewer.scene.primitives.add(model);
          $this.meshLayers.push(model);
          if (boolZoom) {
            $this.mapViewer.flyTo(model);
          }
          if (typeof callback == "function") callback();
        });
        break;
      default:
        break;
    }
    return model;
  },
  /**
   * 移除所有模型数据
   * 注意：这里只移除了通过createMeshLayer接口加载的数据
   */
  removeMeshLayerAll() {
    let $this = this;
    for (const meshLayer of $this.meshLayers) {
      $this.mapViewer.scene.primitives.remove(meshLayer);
    }
  },
  /**
   * 获取模型位置信息
   * @param {object} model 模型对象
   * @returns {object} 模型位置信息
   */
  getModelPosition(model) {
    let center = model.boundingSphere.center;
    //获取3Dtlies的范围中心点的弧度
    let cartographic = this.mapWorld.Cartographic.fromCartesian(center);
    let lat = this.mapWorld.Math.toDegrees(cartographic.latitude);
    let lon = this.mapWorld.Math.toDegrees(cartographic.longitude);
    let height = cartographic.height;
    return {
      Cartesian3: center,
      Cartographic: cartographic,
      Degrees: [lon, lat, height],
    };
  },
};
export default Layers;
