// it is used to create an object with keys taken from the path property of each error
// in the Yup validation error
import onChange from "on-change";
import * as yup from "yup";

const createValidationSchema = (state) => {
  // Extract all existing feed URLs from state
  const urlOfExistingFeeds = state.feeds.map((feed) => feed.url);
  return yup.object().shape({
    url: yup
      .string()
      .trim()
      .required("URL is required!")
      .url("Invalid URL! Check it again.")
      .notOneOf(urlOfExistingFeeds, "URL already exists!"),
  });
};

const validateInputValue = (state, url) => {
  const validationSchema = createValidationSchema(state);
  return validationSchema.validate(url);
};

const app = () => {
  const elements = {
    formEl: {
      formInput: document.querySelector("#url-input"),
      form: document.querySelector(".rss-form"),
      submitBtn: document.querySelector(".btn-lg"),
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
  };
  const defaultLanguage = "ru";

  const state = {
    lng: defaultLanguage,
    form: {
      loadingProcess: {
        processState: "filling",
        processError: null,
      },
      isValid: true,
      validErrors: null,
      feedbackMsg: "",
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
  const renderFeedback = (watchedState, elements) => {
    // Clear previous classes
    elements.formEl.feedback.classList.remove("text-danger", "text-success");
    elements.formEl.formInput.classList.remove("is-invalid");

    if (!watchedState.form.isValid) {
      // Display error feedback
      elements.formEl.feedback.classList.add("text-danger");
      elements.formEl.formInput.classList.add("is-invalid");

      // Set feedback text based on the validation error
      elements.formEl.feedback.textContent = watchedState.form.validErrors;
    } else {
      // Display success feedback
      elements.formEl.feedback.classList.add("text-success");
      // Clear the form input and set focus
      elements.formEl.formInput.value = "";
      elements.formEl.formInput.focus();
      // Clear feedback text on success
      elements.formEl.feedback.textContent = "";
    }
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
        renderFeedback(watchedState, elements);
      })
      .catch((error) => {
        // Validation failed
        watchedState.form.isValid = false;
        watchedState.form.validErrors = error.message;
        renderFeedback(watchedState, elements);
      });
  });
};

export default app;
