import axios from 'axios';

export const parseRSSFeed = (rssData) => {
  const {
    data: { contents },
  } = rssData;

  const DOMParserObj = new DOMParser();

  const xmlDoc = DOMParserObj.parseFromString(contents, 'text/xml');

  const parseError = xmlDoc.querySelector('parsererror');

  if (parseError) {
    throw new Error('The XML document is not well-formed');
  }
  const channel = xmlDoc.querySelector('channel');

  const feed = {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
  };

  const itemsOfChannel = xmlDoc.querySelectorAll('item');

  const posts = [...itemsOfChannel].map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }));

  return { feed, posts };
};

// generate a URL that can be used in an Axios GET request
export const generateAxiosGetRequestUrl = (inputUrlByUser) => {
  const proxyOriginUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyOriginUrl.searchParams.set('url', inputUrlByUser);
  proxyOriginUrl.searchParams.set('disableCache', true);
  return proxyOriginUrl.toString();
};

export const generateNewFeedObj = (
  parsedResponseData,
  uniqueFeedId,
  validUserUrl,
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

// This function is responsible for periodically fetching new posts from the provided
// RSS feed URLs and updating the watched state with the new posts.
export const updateExistingRssPostsWithTimer = (watchedState) => {
  // These requests are not sent immediately but are prepared for execution.
  // needs to fetch the updated RSS feed data from each URL
  // fetching data from the existing feed URLs stored in the watchedState.feeds array
  const arrOfAxiosRequests = watchedState.feeds.map(({ url }) => {
    const existingFeedUrl = generateAxiosGetRequestUrl(url);
    return axios.get(existingFeedUrl);
  });
  //   console.log(watchedState.feeds);
  //   console.log(arrOfAxiosRequests);

  // The function then uses Promise.all to wait for all the Axios requests to resolve.
  // This means it waits for all the RSS feed URLs to be fetched.
  //  The responsesData variable is an array because of the Promise.all method.
  Promise.all(arrOfAxiosRequests)
    .then((responsesData) => {
      // Once all the requests are resolved, the function proceeds to extract the
      // responses' data, which typically contain the content of the RSS feeds.
      // It then parses each RSS feed's content to extract the new posts.
      const arrOfNewPosts = responsesData.flatMap(
        (responseData) => parseRSSFeed(responseData).posts,
      );
      //   console.log(responsesData);
      //   console.log(arrOfNewPosts);

      const existingPostsLinks = watchedState.posts
        .flat()
        .map((post) => post.link);
      //   console.log(watchedState.posts);
      //   console.log(existingPostsLinkes);

      // The filter method is used to create a new array, arrOfNewPostsForAdding,
      // containing only the posts from arrOfNewPosts that do not have titles matching
      // any of the links in the existingPostsLinks array.
      const arrOfNewPostsForAdding = arrOfNewPosts.filter(
        (post) => !existingPostsLinks.includes(post.link),
      );

      // It then updates the watched state by adding the new posts.
      if (arrOfNewPostsForAdding.length > 0) {
        watchedState.posts.push(...arrOfNewPostsForAdding);
      }
    })
    .catch((error) => {
      console.log(`Parsing error: ${error.message}`);
    })
    // The finally method in a Promise chain is used to specify code that should be
    // executed regardless of whether the promise was fulfilled or rejected.
    .finally(() => {
      const time = 5000;
      setTimeout(() => updateExistingRssPostsWithTimer(watchedState), time);
    });
};
