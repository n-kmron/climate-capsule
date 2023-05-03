import { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents, ZoomControl } from "react-leaflet";
import SideBar from "../components/SideBar/SideBar";
import storyClosed from "../components/Map/storyClosed";
import { useAdventure } from "../hooks/useAdventure";
import { useFilteredStories, useStories } from "../hooks/useStories";
import redLocator from "../components/Map/RedMarker";
import styles from "./HomePage.module.css";

function LocationMarker() {
    const [position, setPosition] = useState(null);

    const map = useMapEvents({
        locationfound(e) {
            setPosition(e.latlng);
            map.setZoom(13);
            map.flyTo(e.latlng);
        },
    });

    useEffect(() => {
        map.locate();
    }, [map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Current Location</Popup>
        </Marker>
    );
}

const SelectedLocationMarker = ({ name, location, setLocation }) => {
    const map = useMapEvents({
        click(event) {
            setLocation(event.latlng);
            map.flyTo(event.latlng);
        },
    });

    return location === null ? null : (
        <Marker position={location} icon={redLocator}>
            {name && <Popup>{name}</Popup>}
        </Marker>
    );
};

function MultipleMarkers({ stories, onMarkerClick }) {
    return stories.map(story => <SingleMarker key={story._id} story={story} onMarkerClick={onMarkerClick} />);
}

function SingleMarker({ story, onMarkerClick }) {
    const eventHandlers = {
        click() {
            onMarkerClick(story);
        },
    };

    return (
        <Marker position={story.location} icon={storyClosed} eventHandlers={eventHandlers}>
            <Popup>Marker</Popup>
        </Marker>
    );
}

const HomePage = () => {
    const [map, setMap] = useState(null);

    const [searchPlace, setSearchPlace] = useState("");
    const [searchRadius, setSearchRadius] = useState(5);
    const [isAddStoryMode, setIsAddStoryMode] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [adventure, setAdventure] = useState(null);

    const [selectedStory, setSelectedStory] = useState(null);

    const { stories, addStory } = useStories();

    const {
        filteredStories,
        location: searchPlaceLocation,
        isLoading: isFilteredStoriesLoading,
        error: filteredStoriesError,
        revalidate: revalidateFilteredStories,
    } = useFilteredStories({
        place: searchPlace,
        radius: searchRadius,
    });

    const onAdventureClick = () => {
        const cityName = prompt("Please enter a city name");
        const radius = prompt("Please enter a radius");

        fetch(`http://139.162.167.224:3000/adventures/new?city=${cityName}&radius=${radius}`)
            .then(res => res.json())
            .then(result => {
                map.setView(result.path.coordinates[0], 13, { animate: true });
                setAdventure(result);
            });
    };

    const selectStory = story => {
        setSelectedStory(story);
        selectLocation(story.location);
    };

    const selectLocation = useCallback(
        location => {
            setSelectedLocation(location);
            map.setView(location, 13, { animate: true });
        },
        [map]
    );

    useEffect(() => {
        if (searchPlaceLocation) {
            selectLocation(searchPlaceLocation);
        }
    }, [searchPlaceLocation, selectLocation]);

    const greenOptions = { color: "red" };

    const handleGoBackToSearch = () => {
        setSelectedStory(null);
        setSelectedLocation(null);
        map.locate();
    };

    const handleAddNewStory = async newStory => {
        await addStory(newStory);
        setIsAddStoryMode(false);
        selectStory(newStory);
        await revalidateFilteredStories();
    };

    return (
        <div>
            <SideBar
                searchPlace={searchPlace}
                setSearchPlace={setSearchPlace}
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                filteredStories={filteredStories}
                isFilteredStoriesLoading={isFilteredStoriesLoading}
                filteredStoriesError={filteredStoriesError}
                onStorySelect={selectStory}
                onGoBackToSearch={handleGoBackToSearch}
                selectedStory={selectedStory}
                isAddStoryMode={isAddStoryMode}
                setIsAddStoryMode={setIsAddStoryMode}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                handleAddNewStory={handleAddNewStory}
            />
            <div className={styles.adventure} onClick={onAdventureClick}>
                <button>Start Adventure</button>
            </div>
            <MapContainer
                ref={setMap}
                className="map-container"
                center={[50.8476, 4.3572]}
                zoom={8}
                scrollWheelZoom={false}
                zoomControl={false}>
                <ZoomControl position="bottomright" />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
                <SelectedLocationMarker
                    name={selectedStory?.title}
                    location={selectedLocation}
                    setLocation={location => {
                        setSelectedLocation(location);
                        if (selectedStory) setSelectedStory(null);
                    }}
                />
                {stories && <MultipleMarkers stories={stories} onMarkerClick={selectStory} />}
                {adventure && <Polyline pathOptions={greenOptions} positions={adventure.path.coordinates} />}
            </MapContainer>
        </div>
    );
};

export default HomePage;
