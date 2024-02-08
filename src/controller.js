import axios from 'axios';
import _ from 'lodash';
import {
  validateInputValue,
  parseRSSFeed,
  generateAxiosGetRequestUrl,
  generateNewFeedObj,
  generateNewPostsObjOfFeed,
  updateExistingRssPostsWithTimer,
} from './helpers.js';

const handleValidationError = (state, i18nInstance, error) => {
  const copyState = { ...state };
  copyState.form.loadingProcess.processState = 'validationError';
  copyState.form.validError = i18nInstance.t(error.message.key);
  return copyState;
};

const handleResponseAndNetworkError = (state, i18nInstance, error) => {
  const copyState = { ...state };
  copyState.form.loadingProcess.processState = 'responseAndNetworkError';
  if (error.message === 'The XML document is not well-formed') {
    copyState.form.loadingProcess.processError = i18nInstance.t('errors.noValidRss');
  } else {
    copyState.form.loadingProcess.processError = i18nInstance.t(
      'errors.errorNetwork',
    );
  }
  return copyState;
};

export const controlValidationAndAxiosRequest = (
  watchedState,
  elements,
  i18nInstance,
) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const inputUrlByUser = e.target.url.value;
    const newState = { ...watchedState };
    newState.form.loadingProcess.processState = 'formFilling';

    validateInputValue(newState, inputUrlByUser)
      .then((validUserUrl) => {
        newState.form.loadingProcess.processState = 'completed';
        newState.form.processError = null;
        newState.form.arrOfValidUrls.push(inputUrlByUser);
        newState.form.loadingProcess.processState = 'processingRequest';
        axios
          .get(generateAxiosGetRequestUrl(validUserUrl))
          .then((responseData) => {
            newState.form.loadingProcess.processState = 'completed';

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

            newState.feeds.push(feedObj);
            newState.posts.push(postsObjOfCurrentFeed);

            updateExistingRssPostsWithTimer(newState);
          })
          .catch((error) => {
            const errorState = handleResponseAndNetworkError(
              newState,
              i18nInstance,
              error,
            );

            Object.assign(watchedState, errorState);
          });
      })
      .catch((error) => {
        const errorState = handleValidationError(newState, i18nInstance, error);

        Object.assign(watchedState, errorState);
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

    const copyState = { ...watchedState };
    copyState.stateUi.modalWindowContent = { post };

    if (!arrOfClickedPostLinks.includes(href)) {
      arrOfClickedPostLinks.push(href);
    }

    Object.assign(watchedState, copyState);
  };

  modalWindow.addEventListener('show.bs.modal', handleModalWindow);
};
