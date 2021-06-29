import Convert from "../core/Convert";
import MeasurementAnalysis from "../core/MeasurementAnalysis";
import Navigate from "../core/Navigate";
import Creator from "../core/Creator/Creator";
import Layers from "../core/Layers";
const Components = function (mapViewer, mapWorld) {
  this.Convert = new Convert(mapViewer, mapWorld);
  this.MeasurementAnalysis = new MeasurementAnalysis(mapViewer, mapWorld);
  this.Navigate = new Navigate(mapViewer, mapWorld);
  this.Creator = new Creator(mapViewer, mapWorld);
  this.Layers = new Layers(mapViewer, mapWorld);
};
export default Components;
