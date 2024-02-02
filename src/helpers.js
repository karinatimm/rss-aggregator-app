// https://frontend-project-11-nine-psi.vercel.app/
export const parseRSSFeed = (rssData) => {
  try {
    const {
      data: { contents },
    } = rssData;

    // Create a new DOMParser object to parse XML
    const DOMParserObj = new DOMParser();

    // Parse the XML data (rssData) using the DOMParser into DOM representation of the document
    const xmlDoc = DOMParserObj.parseFromString(contents, "text/xml");

    // Check for a 'parsererror' node in the parsed XML document
    const parseError = xmlDoc.querySelector("parsererror");

    // If 'parsererror' node exists, it indicates that the XML is not well-formed
    if (parseError) {
      // Throw a new Error with a custom message to indicate parsing error
      throw new Error("The XML document is not well-formed");
    }

    // Extract the 'channel' element from the parsed document
    const channel = xmlDoc.querySelector("channel");

    // Extract information from the 'channel' element and create a 'feed' object
    const feed = {
      title: channel.querySelector("title").textContent, // Extract channel title
      description: channel.querySelector("description").textContent, // Extract channel description
    };

    /// Extract all 'item' elements from the parsed document
    const itemsOfChannel = xmlDoc.querySelectorAll("item");

    // Process each 'item' element and create an array of 'posts'
    const posts = [...itemsOfChannel].map((item) => {
      // Create an object for each post and extract title, link, and description
      return {
        title: item.querySelector("title").textContent,
        link: item.querySelector("link").textContent,
        description: item.querySelector("description").textContent,
      };
    });

    // Return an object with 'posts' array and 'feed' information
    return { feed, posts };
  } catch (error) {
    // Handle any errors that occur during parsing and provide a custom error message
    throw new Error(`Parsing error: ${error.message}`);
  }
};

// generate a URL that can be used in an Axios GET request
export const generateAxiosGetRequestUrl = (inputUrlByUser) => {
  const proxyOriginUrl = new URL("/get", "https://allorigins.hexlet.app");
  proxyOriginUrl.searchParams.set("url", inputUrlByUser);
  proxyOriginUrl.searchParams.set("disableCache", true);
  return proxyOriginUrl.toString();
};

export const generateNewFeedObj = (
  parsedResponseData,
  uniqueFeedId,
  validUserUrl
) => {
  const { feed } = parsedResponseData;

  feed.feedId = uniqueFeedId;

  feed.url = validUserUrl;

  // Return the modified feed object
  return feed;
};

export const generateNewPostsObjOfFeed = (parsedResponseData, uniqueFeedId) => {
  const { posts } = parsedResponseData;
  posts.forEach((post) => {
    post.feedId = uniqueFeedId;

    post.postId = _.uniqueId();
  });

  return posts;
};
