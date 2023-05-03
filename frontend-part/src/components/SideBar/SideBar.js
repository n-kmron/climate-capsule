import { useRef, useState } from "react";
import styles from "./sideBar.module.css";
import SearchView from "./SearchView";
import StoryDetailsView from "./StoryDetailsView";
import NewStory from "./NewStory";
import clsx from "clsx";
import menuIcon from "../../icons/menu.png";
import { isDesktop } from "react-device-detect";
import { useEvent } from "react-use";

const SideBar = ({
    filteredStories,
    isFilteredStoriesLoading,
    filteredStoriesError,
    searchPlace,
    setSearchPlace,
    searchRadius,
    setSearchRadius,
    selectedStory,
    onStorySelect,
    onGoBackToSearch,
    isAddStoryMode,
    setIsAddStoryMode,
    selectedLocation,
    handleAddNewStory,
}) => {
    const [isVisible, setIsVisible] = useState(isDesktop);

    const containerRef = useRef(null);

    useEvent("keydown", event => {
        const isAnInputFocused = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
        if (event.key === "Escape" && !isAnInputFocused) setIsVisible(false);
    });

    return (
        <>
            <button className={styles.collapseBtn} onClick={() => setIsVisible(!isVisible)}>
                <img src={menuIcon} alt={isVisible ? "Collapse" : "Expand"} />
            </button>
            <div ref={containerRef} className={clsx(styles.container, !isVisible && styles.hidden)}>
                {selectedStory ? (
                    <StoryDetailsView story={selectedStory} onGoBack={onGoBackToSearch} />
                ) : isAddStoryMode ? (
                    <NewStory
                        selectedLocation={selectedLocation}
                        onCancel={() => setIsAddStoryMode(false)}
                        onSubmit={handleAddNewStory}
                    />
                ) : (
                    <SearchView
                        {...{
                            stories: filteredStories,
                            isStoriesLoading: isFilteredStoriesLoading,
                            storiesError: filteredStoriesError,
                            searchPlace,
                            setSearchPlace,
                            searchRadius,
                            setSearchRadius,
                            onStorySelect,
                            onAddClicked: () => setIsAddStoryMode(true),
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default SideBar;
