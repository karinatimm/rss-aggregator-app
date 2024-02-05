// it is used to create an object with keys taken from the path property of each error
// in the Yup validation error
import onChange from "on-change";
import * as yup from "yup";
import { renderUIView } from "./view.js";
import i18next from "i18next";
import ru from "./locales/ru.js";
import en from "./locales/en.js";
import axios from "axios";
import {
  parseRSSFeed,
  generateAxiosGetRequestUrl,
  generateNewFeedObj,
  generateNewPostsObjOfFeed,
  checkActualRss,
} from "./helpers.js";
import { controlClickedPostLinks } from "./controller.js";
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
const getNewPostTitlesByComparison = (
  arrOfNewPostsTitles,
  arrOfExistingPostsTitles
) =>
  arrOfNewPostsTitles.filter(
    (newPost) => !arrOfExistingPostsTitles.includes(newPost)
  );

// function is responsible for fetching new posts from an RSS feed, comparing
// them with the existing posts, and adding any new posts to the watchedState.posts.
const updateWatchedStateWithNewPosts = (
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

      // find the feed object corresponding to the chosen URL
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

const startRssChecking = (state, elements, watchedState) => {
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
      feedsMainDivContainer: document.querySelector(".feeds"),
      postsMainDivContainer: document.querySelector(".posts"),
      h2FeedCardTitle: i18nInstance.t("feedCardTitle"),
      h2PostCardTitle: i18nInstance.t("postCardTitle"),
      watchBtn: i18nInstance.t("buttons.watchPostBtn"),
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
      },
      validError: null,
      arrOfValidUrls: [],
      feedbackMessage: "",
    },
    posts: [],
    feeds: [],
    stateUi: {
      arrOfClickedPostLinks: [],
      modalWinContent: null,
    },
  };

  const watchedState = onChange(state, (pathToEl) => {
    renderUIView(watchedState, i18nInstance, elements)(pathToEl);
  });

  controlClickedPostLinks(watchedState, elements);

  elements.formEl.form.addEventListener("submit", (e) => {
    e.preventDefault();
    // an input element with the name or id attribute set to "url" within the form
    const inputUrlByUser = e.target.url.value;
    // console.log(inputUrlByUser);
    watchedState.form.loadingProcess.processState = "formFilling";
    validateInputValue(watchedState, inputUrlByUser) // promise is pending
      // receives the validUserUrl as the resolved value (resolved proise)
      .then((validUserUrl) => {
        watchedState.form.loadingProcess.processState = "completed";
        // promise is resolved (fulfilled)
        // Validation successful
        watchedState.form.processError = null;
        watchedState.form.arrOfValidUrls.push(inputUrlByUser);
        // console.log(Array.from(watchedState.form.arrOfValidUrls));
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

            startRssChecking(state, elements, watchedState);
          })
          .catch((error) => {
            watchedState.form.loadingProcess.processState =
              "responseAndNetworkError";
            if (
              error.message ===
              "Parsing error: The XML document is not well-formed"
            ) {
              watchedState.form.loadingProcess.processError =
                i18nInstance.t("errors.noValidRss");
            }
            // The navigator.onLine check if the browser has internet access
            if (!navigator.onLine) {
              watchedState.form.loadingProcess.processError = i18nInstance.t(
                "errors.errorNetwork"
              );
            }
          });
      })
      .catch((error) => {
        // Validation failed
        watchedState.form.loadingProcess.processState = "validationError";
        watchedState.form.validError = i18nInstance.t(error.message.key); //error.message
        // console.log(error.message.key);
      });
  });
};

export default app;
