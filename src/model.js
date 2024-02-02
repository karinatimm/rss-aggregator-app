// it is used to create an object with keys taken from the path property of each error
// in the Yup validation error
import onChange from "on-change";
import * as yup from "yup";
import { renderFeedbacksAndErrors } from "./view.js";
import i18next from "i18next";
import ru from "./locales/ru.js";
import en from "./locales/en.js";
import axios from "axios";
import {
  parseRSSFeed,
  generateAxiosGetRequestUrl,
  generateNewFeedObj,
  generateNewPostsObjOfFeed,
} from "./helpers.js";
import _ from "lodash";

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

// validateInputValue function is asynchronous because it relies on the asynchronous
// capabilities of the yup library for validation
const validateInputValue = (state, url) => {
  const validationSchema = createValidationSchema(state);
  return validationSchema.validate(url);
};

const app = () => {
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

  const state = {
    lng: defaultLanguage,
    form: {
      loadingProcess: {
        processState: "formFilling",
        processError: null,
        processErrorNetwork: null,
      },
      isValid: true,
      validError: null,
      arrOfValidUrls: [],
      feedbackMessage: "",
    },
    posts: [],
    feeds: [],
    stateUi: {
      // состояние того, как отображается страница
      clickedIdPosts: [], // seenPosts
      modalWinContent: null,
    },
  };
  // ensures renderTextContent function will be automatically called whenever there is a
  // change in the watchedState

  const watchedState = onChange(state, () => {
    renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
  });

  elements.formEl.form.addEventListener("submit", (e) => {
    e.preventDefault();
    // an input element with the name or id attribute set to "url" within the form
    const inputUrlByUser = e.target.url.value;
    // console.log(inputUrlByUser);
    watchedState.form.loadingProcess.processState = "formFilling";
    validateInputValue(watchedState, inputUrlByUser) // promise is pending
      // if validation is successful save this url into variable validUserUrl
      // receives the validUserUrl as the resolved value (resolved proise)
      .then((validUserUrl) => {
        watchedState.form.loadingProcess.processState = "completed";
        // promise is resolved (fulfilled)
        // Validation successful
        watchedState.isValid = true;
        watchedState.form.validErrors = null;
        watchedState.networkError = false;
        watchedState.form.arrOfValidUrls.push(inputUrlByUser);
        // console.log(Array.from(watchedState.form.arrOfValidUrls));
        // make request
        watchedState.form.loadingProcess.processState = "processingRequest";
        axios
          .get(generateAxiosGetRequestUrl(validUserUrl)) // promise is pending
          .then((responseData) => {
            watchedState.form.loadingProcess.processState = "completed";
            // console.log(responseData);

            //generate unique ID for each feed
            const uniqueFeedId = _.uniqueId();
            const parsedResponseData = parseRSSFeed(responseData);
            // console.log(parsedResponseData);

            const feedObj = generateNewFeedObj(
              parsedResponseData,
              uniqueFeedId,
              validUserUrl
            );
            // console.log(feedObj);

            const postsObjOfCurrentFeed = generateNewPostsObjOfFeed(
              parsedResponseData,
              uniqueFeedId
            );
            // console.log(postsObjOfCurrentFeed);

            watchedState.feeds.push(feedObj);
            console.log(Array.from(watchedState.feeds));
            watchedState.posts.push(postsObjOfCurrentFeed);

            watchedState.form.feedbackMessage = i18nInstance.t("rssUploaded");
            // console.log(watchedState.form.feedbackMessage);
          })
          .catch((error) => {
            watchedState.form.loadingProcess.processState =
              "responseAndNetworkError";
            watchedState.form.isValid = false;
            if (
              error.message ===
              "Parsing error: The XML document is not well-formed"
            ) {
              watchedState.form.loadingProcess.processError =
                i18nInstance.t("errors.noValidRss");
              // console.log(watchedState.form.processErrorNetwork);
            }
            // The navigator.onLine check if the browser has internet access
            if (!navigator.onLine) {
              watchedState.form.loadingProcess.processErrorNetwork =
                i18nInstance.t("errors.errorNetwork");
              // console.log(watchedState.form.loadingProcess.processErrorNetwork);
            }
          });
      })
      .catch((error) => {
        // Validation failed
        watchedState.form.loadingProcess.processState = "validationError";
        watchedState.form.isValid = false;
        watchedState.form.validError = i18nInstance.t(error.message.key); //error.message
        // console.log(error.message.key);
      });
  });
};

export default app;
