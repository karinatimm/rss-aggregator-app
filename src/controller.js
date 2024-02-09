import axios from 'axios';
import _ from 'lodash';
import {
  validateInputValue,
  parseRSSFeed,
  generateAxiosGetRequestUrl,
  generateNewFeedObj,
  generateNewPostsObjOfFeed,
} from './helpers.js';

const handleValidationError = (watchedState, i18nInstance, error) => {
  watchedState.form.loadingProcess.processState = 'validationError';
  watchedState.form.validError = i18nInstance.t(error.message.key);
};

const handleResponseAndNetworkError = (watchedState, i18nInstance, error) => {
  watchedState.form.loadingProcess.processState = 'responseAndNetworkError';
  if (error.message === 'The XML document is not well-formed') {
    watchedState.form.loadingProcess.processError = i18nInstance.t('errors.noValidRss');
  } else {
    watchedState.form.loadingProcess.processError = i18nInstance.t(
      'errors.errorNetwork',
    );
  }
};

export const controlValidationAndAxiosRequest = (
  watchedState,
  elements,
  i18nInstance,
) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const inputUrlByUser = e.target.url.value;
    watchedState.form.loadingProcess.processState = 'formFilling';

    validateInputValue(watchedState, inputUrlByUser)
      .then((validUserUrl) => {
        watchedState.form.loadingProcess.processState = 'completed';
        watchedState.form.processError = null;
        watchedState.form.arrOfValidUrls.push(inputUrlByUser);
        watchedState.form.loadingProcess.processState = 'processingRequest';
        axios
          .get(generateAxiosGetRequestUrl(validUserUrl))
          .then((responseData) => {
            watchedState.form.loadingProcess.processState = 'completed';

            const uniqueFeedId = _.uniqueId();
            const parsedResponseData = parseRSSFeed(responseData);

            const feedObj = generateNewFeedObj(
              parsedResponseData,
              uniqueFeedId,
              validUserUrl,
            );

            const postsObjOfCurrentFeed = generateNewPostsObjOfFeed(
              parsedResponseData,
              uniqueFeedId,
            );

            watchedState.feeds.push(feedObj);
            watchedState.posts.push(postsObjOfCurrentFeed);
          })
          .catch((error) => {
            handleResponseAndNetworkError(watchedState, i18nInstance, error);
          });
      })
      .catch((error) => {
        handleValidationError(watchedState, i18nInstance, error);
      });
  };

  elements.formEl.form.addEventListener('submit', handleFormSubmit);
};

export const controlClickedPostLinks = (watchedState, elements) => {
  const { postsMainDivContainer } = elements.feedsAndPostsEl;
  const { arrOfClickedPostLinks } = watchedState.stateUi;

  const handleViewedPost = (e) => {
    const clickedElement = e.target;

    if (clickedElement.tagName === 'A') {
      const clickedPostLink = clickedElement.getAttribute('href');

      if (!arrOfClickedPostLinks.includes(clickedPostLink)) {
        const copyState = { ...watchedState };
        copyState.stateUi.arrOfClickedPostLinks.push(clickedPostLink);

        Object.assign(watchedState, copyState);
      }
    }
  };

  postsMainDivContainer.addEventListener('click', handleViewedPost);
};

export const controlModalWindow = (watchedState, elements) => {
  const { modalWindow } = elements.modalWindowEl;
  const { posts } = watchedState;
  const { arrOfClickedPostLinks } = watchedState.stateUi;

  const handleModalWindow = (e) => {
    const closestPostLiItem = e.relatedTarget.parentElement;

    const aElement = closestPostLiItem.querySelector('a');

    const href = aElement.getAttribute('href');
    const arrOfFlattenPosts = posts.flat();
    const post = arrOfFlattenPosts.find((postInarr) => postInarr.link === href);

    watchedState.stateUi.modalWindowContent = { post };

    if (!arrOfClickedPostLinks.includes(href)) {
      arrOfClickedPostLinks.push(href);
    }
  };

  modalWindow.addEventListener('show.bs.modal', handleModalWindow);
};
