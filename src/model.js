import i18next from 'i18next';
import { DEFAULT_LANGUAGE } from './config.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

export const initializeElements = (i18nInstance) => {
  const formEl = {
    formInput: document.querySelector('#url-input'),
    form: document.querySelector('.rss-form'),
    addUrlBtn: document.querySelector('.btn-lg'),
    feedback: document.querySelector('.feedback'),
    formTitle: document.querySelector('.display-3'),
    formSubtitle: document.querySelector('.lead'),
    placeholder: document.querySelector('[for="url-input"]'),
    urlExample: document.querySelector('.example'),
  };

  const modalWindowEl = {
    modalWindow: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-body'),
    modalReadBtn: document.querySelector('.btn-primary.full-article'),
    modalCloseBtn: document.querySelector('.btn-secondary'),
  };

  const feedsAndPostsEl = {
    feedsMainDivContainer: document.querySelector('.feeds'),
    postsMainDivContainer: document.querySelector('.posts'),
    h2FeedCardTitle: i18nInstance.t('feedCardTitle'),
    h2PostCardTitle: i18nInstance.t('postCardTitle'),
    watchBtn: i18nInstance.t('buttons.watchPostBtn'),
  };

  return { formEl, modalWindowEl, feedsAndPostsEl };
};

export const initializeI18n = () => {
  const i18nInstance = i18next.createInstance();
  return i18nInstance
    .init({
      lng: DEFAULT_LANGUAGE,
      debug: false,
      resources: {
        ru,
        en,
      },
    })
    .then(() => i18nInstance);
};

export const initializeState = () => {
  const state = {
    lng: DEFAULT_LANGUAGE,
    form: {
      loadingProcess: {
        processState: 'formFilling',
        processError: null,
      },
      validError: null,
    },
    posts: [],
    feeds: [],
    stateUi: {
      arrOfClickedPostLinks: [],
      modalWindowContent: null,
    },
  };
  return state;
};
