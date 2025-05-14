import L from "leaflet";

const IconMap: Record<string, L.Icon> = {};

export function createMarkerIcon(name: string): L.Icon {
  if (!IconMap[name]) {
    IconMap[name] = L.icon({
      iconUrl: `images/markers/${name}.png`,
      shadowUrl: `images/markers/shadow.png`, //"leaf-shadow.png",
      iconSize: [56, 56], // size of the icon
      shadowSize: [60, 55], // size of the shadow
      iconAnchor: [28, 77], // point of the icon which will correspond to marker's location
      shadowAnchor: [7, 75], // the same for the shadow
      popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
    });
  }
  return IconMap[name];
}
