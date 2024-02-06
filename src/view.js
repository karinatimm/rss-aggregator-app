const renderFeedbacksAndErrors = (watchedState, i18nInstance, elements) => {
  const {
    formEl: { formInput, feedback, addUrlBtn, form },
  } = elements;

  feedback.classList.remove("text-danger", "text-success", "rss-uploading");
  formInput.classList.remove("is-invalid");
  addUrlBtn.removeAttribute("disabled");

  switch (watchedState.form.loadingProcess.processState) {
    case "processingRequest": {
      addUrlBtn.setAttribute("disabled", "");
      feedback.textContent = i18nInstance.t("rssIsLoading");
      feedback.classList.add("rss-uploading");
      break;
    }
    case "completed": {
      addUrlBtn.removeAttribute("disabled");
      feedback.classList.add("text-success");
      feedback.textContent = i18nInstance.t("rssUploaded");
      //   console.log(feedback);
      form.reset();
      formInput.focus();
      break;
    }
    case "responseAndNetworkError": {
      addUrlBtn.removeAttribute("disabled");
      formInput.classList.add("is-invalid");
      feedback.classList.add("text-danger");

      feedback.textContent = navigator.onLine
        ? watchedState.form.loadingProcess.processError
        : watchedState.form.loadingProcess.processError;
      break;
    }
    case "validationError": {
      addUrlBtn.removeAttribute("disabled");
      formInput.classList.add("is-invalid");
      feedback.textContent = watchedState.form.validError;
      //   console.log(feedback.textContent);
      feedback.classList.add("text-danger");
      break;
    }
  }
};

const renderFeedAndPostCardContainer = (mainDivContainer, elements) => {
  const cardDivContainer = document.createElement("div");
  cardDivContainer.classList.add("card", "border-0");
  mainDivContainer.append(cardDivContainer);

  const cardDivBodyContainer = document.createElement("div");
  cardDivBodyContainer.classList.add("card-body");
  cardDivContainer.append(cardDivBodyContainer);

  const h2CardTitle = document.createElement("h2");

  h2CardTitle.textContent = mainDivContainer.classList.contains("feeds")
    ? elements.feedsAndPostsEl.h2FeedCardTitle
    : elements.feedsAndPostsEl.h2PostCardTitle;

  h2CardTitle.classList.add("card-title", "h4");
  cardDivBodyContainer.append(h2CardTitle);

  const ulList = document.createElement("ul");
  ulList.classList.add("list-group", "border-0", "rounded-0");
  mainDivContainer.append(ulList);
};

const renderFeeds = (watchedState, elements) => {
  const {
    feedsAndPostsEl: { feedsMainDivContainer },
  } = elements;

  const { feeds } = watchedState;

  if (!feedsMainDivContainer.querySelector("div")) {
    renderFeedAndPostCardContainer(feedsMainDivContainer, elements);
  }

  const lastAddedFeed = feeds.at(-1);

  const li = document.createElement("li");
  li.classList.add("list-group-item", "border-0", "border-end-0");

  const h3 = document.createElement("h3");
  h3.classList.add("h6", "m-0");
  h3.textContent = lastAddedFeed.title;

  const p = document.createElement("p");
  p.classList.add("m-0", "small", "text-black-50");
  p.textContent = lastAddedFeed.description;

  feedsMainDivContainer.querySelector("ul").prepend(li);
  li.append(h3);
  h3.append(p);
};

const renderPosts = (watchedState, elements) => {
  const {
    feedsAndPostsEl: { postsMainDivContainer },
  } = elements;

  const { posts } = watchedState;
  //   console.log(posts);

  if (!postsMainDivContainer.querySelector("div")) {
    renderFeedAndPostCardContainer(postsMainDivContainer, elements);
  }

  const lastAddedRss = posts.at(-1);
  //   console.log(lastAddedRss);

  lastAddedRss.forEach((postInRss) => {
    // create li element
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-start",
      "border-0",
      "border-end-0"
    );

    // create href a
    const aHref = document.createElement("a");
    aHref.setAttribute("href", `${postInRss.link}`);
    aHref.setAttribute("class", "fw-bold");
    aHref.setAttribute("target", "_blank");
    aHref.setAttribute("data-id", `${postInRss.postId}`);
    aHref.setAttribute("rel", "noopener noreferrer");
    aHref.textContent = postInRss.title;

    li.append(aHref);
    postsMainDivContainer.querySelector("ul").prepend(li);

    const watchPostBtn = document.createElement("button");
    watchPostBtn.setAttribute("type", "button");
    watchPostBtn.classList.add("btn", "btn-outline-primary", "btn-sm");
    watchPostBtn.setAttribute("data-id", `${postInRss.postId}`);
    watchPostBtn.setAttribute("data-bs-toggle", "modal");
    watchPostBtn.setAttribute("data-bs-target", "#modal");
    watchPostBtn.textContent = elements.feedsAndPostsEl.watchBtn;

    li.append(watchPostBtn);
  });
};

const renderClickedPostLinks = (watchedState, elements) => {
  const {
    feedsAndPostsEl: { postsMainDivContainer },
  } = elements;
  const {
    stateUi: { arrOfClickedPostLinks },
  } = watchedState;

  postsMainDivContainer.querySelectorAll("a").forEach((aPostLinkElement) => {
    // extarct value(postLink itself) from a
    const postLink = aPostLinkElement.getAttribute("href");
    const isPostClicked = arrOfClickedPostLinks.includes(postLink);

    if (isPostClicked) {
      aPostLinkElement.classList.remove("fw-bold");
      aPostLinkElement.classList.add("fw-normal", "link-secondary");
    }
  });
};

export const renderUIView =
  (watchedState, i18nInstance, elements) => (pathToEl) => {
    switch (pathToEl) {
      case "form.loadingProcess.processState":
        renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
        break;
      case "form.loadingProcess.processError":
        renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
        break;
      case "form.validError":
        renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
        break;
      case "feeds":
        renderFeeds(watchedState, elements);
        break;
      case "posts":
        renderPosts(watchedState, elements);
        break;
      case "stateUi.arrOfClickedPostLinks":
        renderClickedPostLinks(watchedState, elements);
        break;
    }
  };
