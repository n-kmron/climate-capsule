var GraphHopperRouting = require("graphhopper-js-api-client/src/GraphHopperRouting")
var GHInput = require('graphhopper-js-api-client/src/GHInput')
var express = require('express');
var router = express.Router();
const { getAll } = require('../repository/mongo.js');
const { isInRadius, getCoordonatesFromCity } = require('./stories.js');



const graphHopperAPIKey = '46867b44-2a2f-40e1-8b23-f9d4190750c4'
const ghRouting = new GraphHopperRouting({
        key: graphHopperAPIKey,
        vechile: 'foot'
    })

/* Start a new adventure. */
router.get('/new', async function(req, res, next) {
    const city = req.query.city;
    const radius = req.query.radius;
    if(city != null && city.length > 0 && radius != null && radius.length > 0) {
        //case that we want only stories in a radius
        try {
            const cityCoordinates= await getCoordonatesFromCity(city);
            const radiusThing = isInRadius(radius, cityCoordinates, await getAll());
            const finalLocation = radiusThing.location;
            const stories = radiusThing.stories.length>4 ?  radiusThing.stories.slice(0, 4) : radiusThing.stories;

            var points = stories.map(story => [story.location.lng, story.location.lat])

            if(stories.length<2) {
                res.send({location : finalLocation, stories: stories, path: {coordinates: []}})
            } else {
                ghRouting.doRequest({points:points})
                    .then(function(json) {
                        let coordinates = json.paths[0].points.coordinates
                        let parsedCoordinates = coordinates.map(coordinate => {return {lat: coordinate[1], lng : coordinate[0]}})
                        res.send({location : finalLocation, stories: stories, path: {coordinates: parsedCoordinates}})
                    })
                    .catch(function(err) {
                        console.error(err.message)
                    })
            }
        }
        catch (err) {
            res.send("Adventure path does not work");
        }
    }


})

module.exports = router;