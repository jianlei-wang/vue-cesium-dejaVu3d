import Radar from "./Radar";
const Creator = function (mapViewer, mapWorld) {
  this.Radar = new Radar(mapViewer, mapWorld);
};
export default Creator;
