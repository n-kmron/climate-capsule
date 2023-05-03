var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const { getAll, addStory } = require('../repository/mongo.js');


/* GET users listing. */

const http = require('http');
const querystring = require('querystring');
const {json} = require("express");


/**
 * Validate if the object is a valid json story
 * @param {Object} story
 * @returns {boolean}
 */
function isValidJsonStory(story) {
    if (typeof story === 'object' && story !== null && !Array.isArray(story)) {
        if (!story.location || !story.location.lat || !story.location.lng) {
            console.log("location");
            return false;
        }
        if (!story.title || typeof story.title !== 'string' || !story.title.trim().length > 0) {
            console.log("title");
            return false;
        }
        if (!story.summary || typeof story.summary !== 'string' || !story.summary.trim().length > 0) {
            console.log("summary");
            return false;
        }
        if (!story.author || typeof story.author !== 'string' || !story.author.trim().length > 0) {
            console.log("author");
            return false;
        }
        if (!story.date || isNaN(Date.parse(story.date))) {
            console.log("date");
            return false;
        }
        const today = new Date();
        const storyDate = new Date(story.date);
        console.log("result ", storyDate.getTime() < today.getTime());
        if(!(storyDate.getTime() < today.getTime())) {
            console.log("date cannot be greater than today")
            return false;
        }
        if (!story.book.pages || !Array.isArray(story.book.pages)) {
            console.log("pages");
            return false;
        } else {
            let invalidPageFound = false;
            for (let page of story.book.pages) {
                if (!page.type || typeof page.type !== 'string' || !page.content) {
                    // The page is missing a type or content field
                    invalidPageFound = true;
                    break;
                } else if (page.type === 'TEXT' && (typeof page.content !== 'string' || page.content.trim().length === 0)) {
                    // The text page is invalid
                    invalidPageFound = true;
                    break;
                } else if (page.type === 'IMAGE' && (typeof page.content !== 'string' || !/^https?:\/\/\S+$/.test(page.content))) {
                    // The image page is invalid
                    invalidPageFound = true;
                    break;
                }
            }
            if (invalidPageFound) {
                console.log("other");
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}


/**
 * Get the coordonates of a city from an API (opencagedata)
 * @param city string
 * @returns {{lat, lng}}
 */
function getCoordonatesFromCity(city) {
    const apiKey = 'ba96c5fccf934a96b624f1b41879bbbd';
    const endpoint = `http://api.opencagedata.com/geocode/v1/json?q=${querystring.escape(city)}&key=${apiKey}`;
    return new Promise((resolve, reject) => {
        http.get(endpoint, (response) => {
            let rawData = '';

            response.on('data', (chunk) => {
                rawData += chunk;
            });

            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    const lat = parsedData.results[0].geometry.lat;
                    const lng = parsedData.results[0].geometry.lng;
                    const location = {
                        lat: lat,
                        lng: lng
                    };
                    resolve(JSON.stringify(location));
                } catch (e) {
                    console.log("did not find the coordinates with API");
                    reject(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(e.message);
            throw new Error('Internal Server Error');
        });
    })

}

/**
 * Concert a value from degrees to radians
 * @param degrees
 * @returns {number}
 */
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Calculate the distance between 2 locations (lat and lng)
 * @param l1 the first location
 * @param l2 the second location
 * @returns {number} the distance in kilometers
 */
function calculateDistanceBetween(l1, l2) {
    const earthRadiusKm = 6371;
    const dLat = degreesToRadians(l2.lat - l1.lat);
    const dLon = degreesToRadians(l2.lng - l1.lng);

    const lat1 = degreesToRadians(l1.lat);
    const lat2 = degreesToRadians(l2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

/**
 * for a radius, compare each story with the coordinates of a city given
 * @param {number} radius
 * @param {{lat, lng}} cityCoordinates
 * @param stories
 */
function isInRadius(radius, cityCoordinates, stories) {
    const jsonCityCoordinates = JSON.parse(cityCoordinates); //objet à comparer
    const jsonStories = stories;
    let allStoriesInRadius = [];
    for (let i = 0; i < jsonStories.length; i++) {
        const currentObject = jsonStories[i];
        if(calculateDistanceBetween(jsonCityCoordinates, currentObject.location) <= radius) {
            allStoriesInRadius.push(jsonStories[i]);
        }
    }
    const location = {lat: jsonCityCoordinates.lat, lng: jsonCityCoordinates.lng};
    return {location: location, stories: allStoriesInRadius};
}

//ROUTES---------

/**
 * Route to get all the story (json array) ond if we precise a city and a radius, return only stories are in this radius
 */
router.get('/', async function(req, res, next) {
    const city = req.query.city;
    const radius = req.query.radius;
    if(city != null && city.length > 0 && radius != null && radius.length > 0) {
        //case that we want only stories in a radius
        try {
            const cityCoordinates= await getCoordonatesFromCity(city);
            const stories = await getAll();
            res.send(isInRadius(radius, cityCoordinates, stories));
        }
        catch (err) {
            res.status(400)
            res.send("Something went wrong")
        }
        //case that we want all the stories
    } else {
        res.setHeader("Content-Type", "application/json");
        res.send(await getAll());
    }
});


/**
 * Route to add a new story via the post method
 */
router.post('/', async function(req, res, next) {

    const story = req.body;
    //check if the json we received is valid
    if(!isValidJsonStory(story)) res.status(400).send('received an invalid json object');
    await addStory(story);
    res.send("story successfully added");
});

module.exports = {
    isInRadius,
    getCoordonatesFromCity,
    router
};

