import useSWR, { mutate as globalMutate } from "swr";

const SERVER_ADDRESS = "http://139.162.167.224:3000";

const isFilteredStoriesKey = key => {
    return Array.isArray(key) && key.length === 3 && key[0] === "filteredStories";
};

export const useStories = () => {
    const { data, isLoading, mutate } = useSWR("stories", () => {
        return fetch(`${SERVER_ADDRESS}/stories`).then(res => res.json());
    });

    const addStory = async newStory => {
        try {
            await mutate(oldStories => [...oldStories, newStory], { revalidate: false });
            await fetch(`${SERVER_ADDRESS}/stories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStory),
            });
            await globalMutate(isFilteredStoriesKey);
        } catch (error) {
            alert("error adding story");
            mutate();
        }
    };

    return { stories: data, isLoading, addStory };
};

export const useFilteredStories = ({ place, radius }) => {
    const { data, error, mutate } = useSWR(["filteredStories", place, radius], async ([_, place, radius]) => {
        let url = `${SERVER_ADDRESS}/stories`;
        if (place) url += `?city=${place}&radius=${radius}`;
        return fetch(url).then(res => res.json());
    });

    return {
        filteredStories: data?.stories ?? [],
        location: data?.location ?? null,
        isLoading: !data && !error,
        error,
        revalidate: () => mutate(),
    };
};
