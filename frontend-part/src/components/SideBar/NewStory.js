import { useState } from "react";
import styles from "./newStory.module.css";

const defaultPage = { type: "TEXT", content: "" };

export default function NewStory({ selectedLocation, onSubmit, onCancel }) {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [author, setAuthor] = useState("");
    const [date, setDate] = useState("");
    const [pages, setPages] = useState([defaultPage]);

    const updatePage = (index, updates) => {
        setPages(current => {
            const newPages = [...current];
            newPages[index] = { ...newPages[index], ...updates };
            return newPages;
        });
    };

    const handleAddPageClick = () => {
        setPages(current => [...current, defaultPage]);
    };

    const renderPages = () => {
        return pages.map((page, index) => (
            <div style={{ display: "flex", alignItems: "center", columnGap: 16, marginBottom: 6 }}>
                <input
                    type="text"
                    id="pages"
                    placeholder={"your memories :("}
                    value={pages[index].content}
                    onChange={event => updatePage(index, { content: event.target.value })}
                />
                <select onChange={event => updatePage(index, { type: event.target.value })}>
                    <option value="TEXT">Text</option>
                    <option value="IMAGE">Image</option>
                </select>
            </div>
        ));
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <h5>Story info</h5>
                <div className={styles.row}>
                    <label htmlFor="aname">Author:</label>
                    <input type="text" name="aname" value={author} onChange={evt => setAuthor(evt.target.value)} />
                </div>
                <div className={styles.row}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" name="title" value={title} onChange={evt => setTitle(evt.target.value)} />
                </div>
                <div className={styles.row}>
                    <label htmlFor="summary">Summary:</label>
                    <input type="text" name="summary" value={summary} onChange={evt => setSummary(evt.target.value)} />
                </div>
                <div className={styles.row}>
                    <label htmlFor="date">Date:</label>
                    <input type="date" name="date" value={date} onChange={evt => setDate(evt.target.value)} />
                </div>
                <div style={{ marginTop: 26 }}>
                    <h5>Location</h5>
                    {selectedLocation ? (
                        <div>
                            <div>lat: {selectedLocation.lat}</div>
                            <div>lng: {selectedLocation.lng}</div>
                        </div>
                    ) : (
                        <span style={{ fontSize: 10 }}>click anywhere on the map to choose a location</span>
                    )}
                </div>
                <h5 style={{ marginTop: 26 }}>Pages</h5>
                {renderPages()}
                <button onClick={handleAddPageClick} style={{ width: 100 }}>
                    Add page
                </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", columnGap: 12 }}>
                <button onClick={onCancel}>Cancel</button>
                <button
                    onClick={() =>
                        onSubmit({ author, title, summary, date, book: { pages }, location: selectedLocation })
                    }>
                    Submit
                </button>
            </div>
        </div>
    );
}
