import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
// import _ from 'lodash';
import { renderUIView } from './view.js';
import ru from './locales/ru.js';
import en from './locales/en.js';
import {
  controlClickedPostLinks,
  controlModalWindow,
  controlValidationAndAxiosRequest,
} from './controller.js';

const initializeElements = (i18nInstance) => {
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

  const elements = { formEl, modalWindowEl, feedsAndPostsEl };
  return elements;
};

const defaultLanguage = 'ru';

const initializeI18n = () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
      en,
    },
  });
  return i18nInstance;
};

const initializeYup = () => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.rssAlreadyExists' }),
    },
    string: {
      url: () => ({ key: 'errors.invalidUrl' }),
    },
  });
};

const initializeState = () => {
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
  return state;
};

const initializeApp = () => {
  const i18nInstance = initializeI18n();
  const elements = initializeElements(i18nInstance);
  const state = initializeState();
  initializeYup();

  const watchedState = onChange(state, (pathToEl) => {
    renderUIView(state, i18nInstance, elements)(pathToEl);
  });

  controlValidationAndAxiosRequest(watchedState, elements, i18nInstance);
  controlClickedPostLinks(watchedState, elements);
  controlModalWindow(watchedState, elements);
};

export default initializeApp;
