const MeasurementAnalysis = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
};
MeasurementAnalysis.prototype = {
  init: function () {
    alert("我是测量组件");
  },
  distance: function () {},
};
export default MeasurementAnalysis;
