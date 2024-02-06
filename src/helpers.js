import axios from "axios";

export const parseRSSFeed = (rssData) => {
  const {
    data: { contents },
  } = rssData;

  const DOMParserObj = new DOMParser();

  const xmlDoc = DOMParserObj.parseFromString(contents, "text/xml");

  const parseError = xmlDoc.querySelector("parsererror");

  if (parseError) {
    throw new Error("The XML document is not well-formed");
  }
  const channel = xmlDoc.querySelector("channel");

  const feed = {
    title: channel.querySelector("title").textContent,
    description: channel.querySelector("description").textContent,
  };

  const itemsOfChannel = xmlDoc.querySelectorAll("item");

  const posts = [...itemsOfChannel].map((item) => {
    return {
      title: item.querySelector("title").textContent,
      link: item.querySelector("link").textContent,
      description: item.querySelector("description").textContent,
    };
  });

  return { feed, posts };
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

export const updateRssPostsWithTimer = (watchedStatestate) => {
  const arrOfAxiosRequests = watchedStatestate.feeds.map(({ url }) => {
    const updatedUrl = generateAxiosGetRequestUrl(url);
    return axios.get(updatedUrl);
  });

  Promise.all(arrOfAxiosRequests)
    .then((responsesData) => {
      const arrOfNewPosts = responsesData.flatMap(
        (responseData) => parseRSSFeed(responseData).posts
      );
      console.log(arrOfNewPosts);

      const existingPostsLinks = watchedStatestate.posts
        .flat()
        .map((post) => post.link);
      console.log(existingPostsLinks);

      const arrOfNewPostsForAdding = arrOfNewPosts.filter(
        (post) => !existingPostsLinks.includes(post.link)
      );

      if (arrOfNewPostsForAdding.length > 0) {
        watchedStatestate.posts.push(...arrOfNewPostsForAdding);
      }
    })
    .catch((error) => {
      console.log(`Parse error: ${error.message}`);
    })
    .finally(() => {
      const updateTimer = 5000;
      setTimeout(() => updateRssPostsWithTimer(watchedStatestate), updateTimer);
    });
};
