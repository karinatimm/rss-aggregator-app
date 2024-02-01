// it is used to create an object with keys taken from the path property of each error
// in the Yup validation error
import onChange from "on-change";
import * as yup from "yup";
import { renderFeedback } from "./view.js";
import i18next from "i18next";
import ru from "./locales/ru.js";
import en from "./locales/en.js";

const defaultLanguage = "ru";

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
    notOneOf: () => ({ key: "errors.rssAlreadyExists" }),
  },
  string: {
    url: () => ({ key: "errors.invalidUrl" }),
  },
});

const createValidationSchema = (state) => {
  return yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(state.form.arrOfValidUrls);
};

const validateInputValue = (state, url) => {
  const validationSchema = createValidationSchema(state);
  return validationSchema.validate(url);
};

const app = () => {
  const state = {
    lng: defaultLanguage,
    form: {
      loadingProcess: {
        processState: "filling",
        processError: null,
      },
      isValid: true,
      validErrors: null,
      arrOfValidUrls: [],
      networkError: false,
    },
    posts: [],
    feeds: [],
    stateUi: {
      // состояние того, как отображается страница
      clickedIdPosts: [], // seenPosts
      modalWinContent: null,
    },
  };

  const elements = {
    formEl: {
      formInput: document.querySelector("#url-input"),
      form: document.querySelector(".rss-form"),
      addUrlBtn: document.querySelector(".btn-lg"),
      feedback: document.querySelector(".feedback"),
      formTitle: document.querySelector(".display-3"),
      formSubtitle: document.querySelector(".lead"),
      placeholder: document.querySelector('[for="url-input"]'),
      urlExample: document.querySelector(".example"),
    },
    modalWindowEl: {
      modalWindow: document.querySelector(".modal"),
      modalTitle: document.querySelector(".modal-title"),
      modalText: document.querySelector(".modal-body"),
      modalReadBtn: document.querySelector(".btn-primary.full-article"),
      modalCloseBtn: document.querySelector(".btn-secondary"),
    },

    feedsAndPostsEl: {
      feedsContainer: document.querySelector(".feeds"),
      postsContainer: document.querySelector(".posts"),
    },
    footer: {
      authorContainer: document.querySelector(".text-center"),
    },
  };

  // ensures renderTextContent function will be automatically called whenever there is a
  // change in the watchedState
  const watchedState = onChange(state, () => {
    renderFeedback(watchedState, elements);
  });

  elements.formEl.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // an input element with the name or id attribute set to "url" within the form
    const inputUrlByUser = e.target.url.value;
    console.log(inputUrlByUser);

    validateInputValue(watchedState, inputUrlByUser)
      .then((urlIsValid) => {
        // Validation successful
        watchedState.isValid = true;
        watchedState.form.validErrors = null;
        watchedState.networkError = false;
        watchedState.form.arrOfValidUrls.push(inputUrlByUser);
        console.log(watchedState.form.arrOfValidUrls);
      })
      .catch((error) => {
        // Validation failed
        watchedState.form.isValid = false;
        watchedState.form.validErrors = i18nInstance.t(error.key); //error.message
        console.log(error.key);
      });
  });
};

export default app;
