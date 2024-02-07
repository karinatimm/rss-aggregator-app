import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import { renderUIView } from './view.js';
import ru from './locales/ru.js';
import en from './locales/en.js';
import {
  validateInputValue,
  parseRSSFeed,
  generateAxiosGetRequestUrl,
  generateNewFeedObj,
  generateNewPostsObjOfFeed,
  updateExistingRssPostsWithTimer,
} from './helpers.js';
import { controlClickedPostLinks, controlModalWindow } from './controller.js';

const defaultLanguage = 'ru';

const i18nInstance = i18next.createInstance();
i18nInstance.init({
  lng: defaultLanguage,
  debug: false,
  resources: {
    ru,
    en,
  },
});

yup.setLocale({
  mixed: {
    notOneOf: () => ({ key: 'errors.rssAlreadyExists' }),
  },
  string: {
    url: () => ({ key: 'errors.invalidUrl' }),
  },
});

const app = () => {
  const elements = {
    formEl: {
      formInput: document.querySelector('#url-input'),
      form: document.querySelector('.rss-form'),
      addUrlBtn: document.querySelector('.btn-lg'),
      feedback: document.querySelector('.feedback'),
      formTitle: document.querySelector('.display-3'),
      formSubtitle: document.querySelector('.lead'),
      placeholder: document.querySelector('[for="url-input"]'),
      urlExample: document.querySelector('.example'),
    },
    modalWindowEl: {
      modalWindow: document.querySelector('.modal'),
      modalTitle: document.querySelector('.modal-title'),
      modalDescription: document.querySelector('.modal-body'),
      modalReadBtn: document.querySelector('.btn-primary.full-article'),
      modalCloseBtn: document.querySelector('.btn-secondary'),
    },

    feedsAndPostsEl: {
      feedsMainDivContainer: document.querySelector('.feeds'),
      postsMainDivContainer: document.querySelector('.posts'),
      h2FeedCardTitle: i18nInstance.t('feedCardTitle'),
      h2PostCardTitle: i18nInstance.t('postCardTitle'),
      watchBtn: i18nInstance.t('buttons.watchPostBtn'),
    },
    footer: {
      authorContainer: document.querySelector('.text-center'),
    },
  };

  const state = {
    lng: defaultLanguage,
    form: {
      loadingProcess: {
        processState: 'formFilling',
        processError: null,
      },
      validError: null,
      arrOfValidUrls: [],
    },
    posts: [],
    feeds: [],
    stateUi: {
      arrOfClickedPostLinks: [],
      modalWindowContent: null,
    },
  };

  const watchedState = onChange(state, (pathToEl) => {
    renderUIView(state, i18nInstance, elements)(pathToEl);
  });

  elements.formEl.form.addEventListener('submit', (e) => {
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

            updateExistingRssPostsWithTimer(watchedState);
          })
          .catch((error) => {
            watchedState.form.loadingProcess.processState = 'responseAndNetworkError';
            if (error.message === 'The XML document is not well-formed') {
              watchedState.form.loadingProcess.processError = i18nInstance.t('errors.noValidRss');
            } else {
              watchedState.form.loadingProcess.processError = i18nInstance.t(
                'errors.errorNetwork',
              );
            }
          });
      })
      .catch((error) => {
        watchedState.form.loadingProcess.processState = 'validationError';
        watchedState.form.validError = i18nInstance.t(error.message.key);
      });
  });

  controlClickedPostLinks(watchedState, elements);
  controlModalWindow(watchedState, elements);
};

export default app;
