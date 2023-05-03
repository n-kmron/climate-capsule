import useSWR from "swr";

const fetchAdventure = async ({ adventure }) => {
    if (adventure) return [];
    await new Promise(resolve => setTimeout(resolve, 1000));
    return fetch("http://139.162.167.224:3000/adventures/new").then(res => res.json());
};

export const useAdventure = () => {
    const { data, isLoading } = useSWR("useadventure", fetchAdventure);
    return { adventure: data, isLoading };
};
