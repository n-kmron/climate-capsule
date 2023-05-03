import closed from "../../icons/closed.png";
import * as L from "leaflet";

const storyClosed = L.icon({
    iconUrl: `${closed}`,

    iconSize: [20, 20], // size of the icon
    iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
});

export default storyClosed;
