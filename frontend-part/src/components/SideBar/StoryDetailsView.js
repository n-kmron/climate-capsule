import { useState } from "react";
import { CCarousel, CCarouselItem, CModal, CModalBody, CModalHeader, CModalTitle } from "@coreui/react";
import styles from "./storyDetailsView.module.css";
import arrowBackIcon from "../../icons/arrow-back.png";

const Book = ({ story, isOpen, setIsOpen }) => {
    const renderPage = page => {
        switch (page.type) {
            case "IMAGE":
                return (
                    <div className={styles.imagePage}>
                        <img src={page.content} alt={story.title} />;
                    </div>
                );
            case "TEXT":
                return <div className={styles.textPage}>{page.content}</div>;
            default:
                return null;
        }
    };

    return (
        <CModal fullscreen visible={isOpen} onClose={() => setIsOpen(false)}>
            <CModalHeader>
                <CModalTitle>{story.title}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CCarousel dark indicators interval={false} controls style={{ height: "100%" }}>
                    {story.book.pages.map(page => (
                        <CCarouselItem key={page.type + page.content} style={{ height: "100%" }}>
                            <div className={styles.pageContainer}>{renderPage(page)}</div>
                        </CCarouselItem>
                    ))}
                </CCarousel>
            </CModalBody>
        </CModal>
    );
};

const StoryDetailsView = ({ story, onGoBack }) => {
    const [isBookOpen, setIsBookOpen] = useState(false);

    return (
        <div className={styles.container}>
            <button className={styles.goBackBtn} onClick={onGoBack}>
                <img src={arrowBackIcon} alt={"go back"} />
            </button>
            <div className={styles.title}>{story.title}</div>
            <div className={styles.content}>{story.summary.slice(0, 1_200)}...</div>
            <div className={styles.showMore}>
                <button onClick={() => setIsBookOpen(true)}>continue reading?</button>
                <Book story={story} isOpen={isBookOpen} setIsOpen={setIsBookOpen} />
            </div>
            <div className={styles.footer}>
                <div className={styles.date}>Jack Huffmann</div>
                <div className={styles.author}>10-1-1982</div>
            </div>
        </div>
    );
};

export default StoryDetailsView;
