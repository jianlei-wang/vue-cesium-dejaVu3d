<template>
  <div id="cesiumContainer">
  </div>
</template>
<script type="text/javascript">
export default {
  name: 'cesiumViewer',
  mounted() {
    // var viewer = new this.Cesium.Viewer('cesiumContainer')
     window.deja_vu3d = this.deja_vu3d = new this.$deja_vu3d("cesiumContainer", {
      imageLayer: {
        type: "tms",
        url: "http://8.140.187.173/static/ImageLayer",
      },
      terrainLayer: {
        url: "http://8.140.187.173/static/TerrainLayer",
        minimumLevel: 0,
        maximumLevel: 15,
      },
    });
  }
}
</script>
<style>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>