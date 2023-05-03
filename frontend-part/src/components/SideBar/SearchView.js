import styles from "./searchView.module.css";
import { useCallback, useState } from "react";
import { useEvent } from "react-use";
import clsx from "clsx";

const StoryItem = ({ isActive, story, onClick }) => {
    const autoScrollRefCallback = useCallback(
        node => {
            if (node !== null && isActive) {
                node.scrollIntoView({ behavior: "auto", block: "nearest" });
            }
        },
        [isActive]
    );

    return (
        <li ref={autoScrollRefCallback} className={clsx(styles.place, isActive && styles.active)} onClick={onClick}>
            {story.title}
        </li>
    );
};

const SearchView = ({
    stories,
    isStoriesLoading,
    storiesError,
    searchPlace,
    setSearchPlace,
    searchRadius,
    setSearchRadius,
    onStorySelect,
    onAddClicked,
}) => {
    const [activeStoryIndex, setActiveStoryIndex] = useState(-1);

    useEvent("keydown", event => {
        if (!stories) return;

        // navigate the stories with arrow keys
        if (event.key === "ArrowDown") {
            setActiveStoryIndex((activeStoryIndex + 1) % stories.length);
        } else if (event.key === "ArrowUp") {
            setActiveStoryIndex((activeStoryIndex - 1 + stories.length) % stories.length);
        } else if (event.key === "Enter") {
            onStorySelect(stories[activeStoryIndex]);
        }
    });

    const handleSearchTextChange = event => {
        setSearchPlace(event.target.value);
        setActiveStoryIndex(-1);
    };

    const handleInputKeyDown = event => {
        const isStoriesNavigationKey = ["ArrowDown", "ArrowUp", "Enter"].includes(event.key);
        if (isStoriesNavigationKey) event.preventDefault();
    };

    return (
        <>
            <input
                type={"text"}
                autoComplete="off"
                className={styles.input}
                placeholder={"Search a place"}
                onKeyDown={handleInputKeyDown}
                onChange={handleSearchTextChange}
                value={searchPlace}
            />
            <div style={{ margin: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label htmlFor="radius" style={{}}>
                    Radius (KM):
                </label>
                <input
                    id={"radius"}
                    type={"number"}
                    min={1}
                    style={{ margin: 0 }}
                    className={styles.input}
                    placeholder={"radius in KM (default 1)"}
                    onKeyDown={handleInputKeyDown}
                    value={searchRadius}
                    onChange={event => setSearchRadius(Number(event.target.value) || 1)}
                />
            </div>
            <div style={{ flex: 1, marginTop: 12 }}>
                {storiesError ? (
                    <div className={styles.error}>Place not found</div>
                ) : isStoriesLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : stories.length > 0 ? (
                    <ul className={styles.pacesList}>
                        {stories.map((story, index) => (
                            <div key={story._id} onMouseOver={() => setActiveStoryIndex(index)}>
                                <StoryItem
                                    story={story}
                                    isActive={index === activeStoryIndex}
                                    onClick={() => onStorySelect(story)}
                                />
                            </div>
                        ))}
                    </ul>
                ) : (
                    <div className={styles.emptyStories}>No stories</div>
                )}
            </div>
            <button style={{ margin: 16 }} onClick={onAddClicked}>
                Add Story
            </button>
        </>
    );
};

export default SearchView;
