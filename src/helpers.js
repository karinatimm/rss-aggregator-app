import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';

export const createValidationSchema = (state) => yup.string().trim().required().url()
  .notOneOf(state.form.arrOfValidUrls);

export const validateInputValue = (state, url) => {
  const validationSchema = createValidationSchema(state);
  return validationSchema.validate(url);
};

export const generateAxiosGetRequestUrl = (inputUrlByUser) => {
  const proxyOriginUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyOriginUrl.searchParams.set('url', inputUrlByUser);
  proxyOriginUrl.searchParams.set('disableCache', true);
  return proxyOriginUrl.toString();
};

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

export const updateExistingRssPostsWithTimer = (watchedState) => {
  const arrOfAxiosRequests = watchedState.feeds.map(({ url }) => {
    const existingFeedUrl = generateAxiosGetRequestUrl(url);
    return axios.get(existingFeedUrl);
  });

  Promise.all(arrOfAxiosRequests)
    .then((responsesData) => {
      const arrOfNewPosts = responsesData.flatMap(
        (responseData) => parseRSSFeed(responseData).posts,
      );

      const existingPostsLinks = watchedState.posts
        .flat()
        .map((post) => post.link);

      const arrOfNewPostsForAdding = arrOfNewPosts.filter(
        (post) => !existingPostsLinks.includes(post.link),
      );

      if (arrOfNewPostsForAdding.length > 0) {
        watchedState.posts.push(...arrOfNewPostsForAdding);
      }
    })
    .catch((error) => {
      console.log(`Parsing error: ${error.message}`);
    })
    .finally(() => {
      const time = 5000;
      setTimeout(() => updateExistingRssPostsWithTimer(watchedState), time);
    });
};
