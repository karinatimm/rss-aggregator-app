import onChange from 'on-change';
import {
  initializeElements,
  initializeI18n,
  initializeState,
} from './model.js';
import {
  controlValidationAndAxiosRequest,
  controlClickedPostLinks,
  controlModalWindow,
} from './controller.js';
import { renderUIView } from './view.js';
import { updateExistingRssPostsWithTimer, initializeYup } from './helpers.js';

const initializeApp = () => {
  const state = initializeState();
  initializeYup();

  initializeI18n().then((i18nInstance) => {
    const elements = initializeElements(i18nInstance);

    const watchedState = onChange(state, (pathToEl) => {
      renderUIView(state, i18nInstance, elements)(pathToEl);
    });
    updateExistingRssPostsWithTimer(watchedState);

    controlValidationAndAxiosRequest(watchedState, elements, i18nInstance);
    controlClickedPostLinks(watchedState, elements);
    controlModalWindow(watchedState, elements);
  });
};

export default initializeApp;
