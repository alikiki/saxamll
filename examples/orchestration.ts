/**
 * Take actions depending on the XML tags encountered.
 */

import { SaxaMLLParser, XMLNodeDescription } from "../src";
import { XMLNode } from "../src/types";

// On the generator side
const imageSearchTag = new XMLNodeDescription({
    tag: "imageSearch",
    selfClosing: true,
    description: "Search for an image given a keyword. The `query` attribute should contain the keyword"
})

imageSearchTag.setExamples([
    {
        input: "Tell me more about lobsters.",
        output: "<imageSearch query='lobster' />"
    },
    {
        input: "Who was muhammad ali?",
        output: "<imageSearch query='muhammad ali'/>"
    },
])

const videoSearchTag = new XMLNodeDescription({
    tag: "videoSearch",
    selfClosing: true,
    description: "Search for a video given a keyword. The `query` attribute should contain the keyword"
})

videoSearchTag.setExamples([
    {
        input: "Tell me more about lobsters.",
        output: "<videoSearch query='lobster' />"
    },
    {
        input: "Who was muhammad ali?",
        output: "<videoSearch query='muhammad ali'/>"
    },
])

const blogSearchTag = new XMLNodeDescription({
    tag: "blogSearch",
    selfClosing: true,
    description: "Search for a blog post given a search query. The `query` attribute should contain the query. The query should reflect text that might be used to 'introduce' the link to the blog post."
})

blogSearchTag.setExamples([
    {
        input: "Tell me more about lobsters.",
        output: "<blogSearch query='Here is an interesting blog post about lobsters:' />"
    },
    {
        input: "Who was muhammad ali?",
        output: "<blogSearch query='Muhammad Ali was a legendary heavyweight boxer. Here's an interesting story about Muhammad Ali:'/>"
    },
])


// On the parser side:
const saxParser = new SaxaMLLParser();

// The `tagOpen` event is triggered when all the attributes of <imageSearch> are parsed.
saxParser.emitter.addHandler('tagOpen', imageSearchTag, async (node: XMLNode) => {
    // Search for the image
    const query = node.attributes.query;
    const image = await fetch("https://api.unsplash.com/search/photos?query=" + query);
    const imageJson = await image.json();

    // If the image is found
    if (imageJson.results.length > 0) {
        console.log(`<img src="${imageJson.results[0].urls.full}"></img>`);
    } else {
        console.log("No images found.");
    }
})

saxParser.emitter.addHandler('tagOpen', videoSearchTag, async (node: XMLNode) => {
    // Search for the video
    const query = node.attributes.query;
    const video = await fetch("https://api.youtube.com/search/videos?query=" + query);
    const videoJson = await video.json();

    // If the video is found
    if (videoJson.results.length > 0) {
        // This is from the Youtube Data API
        console.log(`<iframe src="${videoJson.results[0].urls.full}"></iframe>`);
    } else {
        console.log("No videos found.");
    }
})

saxParser.emitter.addHandler('tagOpen', blogSearchTag, async (node: XMLNode) => {
    // Search for the blog post
    const query = node.attributes.query;
    const blog = await fetch("https://api.blog.com/search/posts?query=" + query);
    const blogJson = await blog.json();

    // If the blog post is found
    if (blogJson.results.length > 0) {
        console.log(`<a href="${blogJson.results[0].urls.full}">${query}</a>`);
    } else {
        console.log("No blog posts found.");
    }
})
