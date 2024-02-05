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

export const getNewPostTitlesByComparison = (
  arrOfNewPostsTitles,
  arrOfExistingPostsTitles
) =>
  arrOfNewPostsTitles.filter(
    (newPost) => !arrOfExistingPostsTitles.includes(newPost)
  );

// function is responsible for fetching new posts from an RSS feed, comparing
// them with the existing posts, and adding any new posts to the watchedState.posts.
export const updateWatchedStateWithNewPosts = (
  state,
  newInputUrlByUser,
  watchedState
) => {
  axios
    .get(generateAxiosGetRequestUrl(newInputUrlByUser))
    .then((newResponseData) => {
      const arrOfNewPostsTitles = parseRSSFeed(newResponseData).posts.map(
        (post) => post.title
      );
      // console.log(arrOfNewPostsTitles);

      // Find the feed object corresponding to the chosen URL
      const foundFeedObj = state.feeds.find(
        (feedObj) => feedObj.url === newInputUrlByUser
      );
      // console.log(state.feeds);
      // console.log(foundFeedObj);

      const feedIdOfFoundFeedObj = foundFeedObj.feedId;
      // console.log(feedIdOfFoundFeedObj);

      // find posts in the state corresponding to the feed ID
      const existingPostsOfFeedId = state.posts
        .flat()
        .filter((post) => post.feedId === feedIdOfFoundFeedObj);
      // console.log(existingPostsOfFeedId);

      // extract titles of existing posts
      const arrOfExistingPostsTitles = existingPostsOfFeedId.map(
        (post) => post.title
      );
      // console.log(arrOfExistingPostsTitles);

      // check for new posts
      const arrOfNewPostsTitlesForAdding = getNewPostTitlesByComparison(
        arrOfNewPostsTitles,
        arrOfExistingPostsTitles
      );
      console.log(arrOfNewPostsTitlesForAdding);

      if (arrOfNewPostsTitlesForAdding.length > 0) {
        // filters the posts array to include only those posts whose titles are present in
        // the newPostObjForAdding array
        const newPostObjForAdding = parseRSSFeed(newResponseData).posts.filter(
          (post) => arrOfNewPostsTitlesForAdding.includes(post.title)
        );
        console.log(newPostObjForAdding);

        const updatedPostsObj = generateNewPostsObjOfFeed(
          newPostObjForAdding,
          feedIdOfFoundFeedObj
        );
        // console.log(updatedPostsObj);
        watchedState.posts.push(updatedPostsObj);
      }
    })
    .catch((err) => console.log(err));
};

export const startRssChecking = (state, elements, watchedState) => {
  const arrOfUpdatedPostsPromises = Promise.all(
    state.form.arrOfValidUrls.map((url) =>
      updateWatchedStateWithNewPosts(state, url, watchedState)
    )
  );

  arrOfUpdatedPostsPromises.finally(
    setTimeout(() => {
      startRssChecking(state, elements, watchedState);
    }, 5000)
  );
};
