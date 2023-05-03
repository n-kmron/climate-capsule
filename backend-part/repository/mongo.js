const mongoose = require("mongoose");
const {connect} = require("mongoose");

/**
 * Create a schema to match with an object of the MongoDB databse
 * */
const storySchema = new mongoose.Schema({
    location: {lat: Number, lng: Number},
    title: String,
    summary: String,
    author: String,
    date: Date,
    book: {
        pages: {
            type: [
                mongoose.Schema.Types.Mixed
            ]
        }
    }
});

const Story = mongoose.model('Story', storySchema);


/**
 * Ensures the connection with the database
 * @returns {Promise<void>}
 */
async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/climate-capsule", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        const db = mongoose.connection;
    })
        .catch(err => {
            console.log('Error connecting to MongoDB:', err);
        });
}

/**
 * Get all the stories from the databse
 * @returns {Promise<Array<HydratedDocument<unknown, {}, {}>>>}
 */
async function getAll() {
    await connectDB();
    try {
        const stories = await Story.find({ }).exec();
        // Close the connection
        mongoose.connection.close();
        console.log(stories);
        return stories;
    } catch (err) {
        console.error(err);
    }
}

/**
 * Add a story in the database
 * @param story
 * @returns {Promise<void>}
 */
async function addStory(story) {
    await connectDB();
    const newStory = new Story({
        location: story.location,
        title: story.title,
        summary: story.summary,
        author: story.author,
        date: story.date,
        book: story.book
    });
    await newStory.save();
    mongoose.connection.close();
}

module.exports = {
    getAll,
    addStory
};
