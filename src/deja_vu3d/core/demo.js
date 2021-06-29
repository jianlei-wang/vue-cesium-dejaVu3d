const DemoTool = function (mapViewer, mapWorld) {
  this.mapViewer = mapViewer;
  this.mapWorld = mapWorld;
};
DemoTool.prototype = {
  init: function () {
    alert("我是Demo组件");
  },
  distance: function () {},
};
export default DemoTool;
