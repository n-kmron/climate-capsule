import redLocatorImg from "../../icons/red-map-locator-marker.png";
import * as L from "leaflet";

const redLocator = L.icon({
    iconUrl: `${redLocatorImg}`,

    iconSize: [24, 36], // size of the icon
    iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
});

export default redLocator;
