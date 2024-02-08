const resetFeedbackStyles = (feedback, formInput, addUrlBtn) => {
  feedback.classList.remove('text-danger', 'text-success', 'rss-uploading');
  formInput.classList.remove('is-invalid');
  addUrlBtn.removeAttribute('disabled');
};

const processingRequestFeedbackStyles = (addUrlBtn, feedback) => {
  addUrlBtn.setAttribute('disabled', '');
  feedback.classList.add('rss-uploading');
};

const completedFeedbackStyles = (formInput, feedback, addUrlBtn, form) => {
  addUrlBtn.removeAttribute('disabled');
  feedback.classList.add('text-success');
  form.reset();
  formInput.focus();
};

const errorFeedbackStyles = (addUrlBtn, formInput, feedback) => {
  addUrlBtn.removeAttribute('disabled');
  formInput.classList.add('is-invalid');
  feedback.classList.add('text-danger');
};

const renderFeedbacksAndErrors = (watchedState, i18nInstance, elements) => {
  const {
    formInput, feedback, addUrlBtn, form,
  } = elements.formEl;

  resetFeedbackStyles(feedback, formInput, addUrlBtn);

  switch (watchedState.form.loadingProcess.processState) {
    case 'processingRequest': {
      feedback.textContent = i18nInstance.t('rssIsLoading');
      processingRequestFeedbackStyles(addUrlBtn, feedback);
      break;
    }
    case 'completed': {
      feedback.textContent = i18nInstance.t('rssUploaded');
      completedFeedbackStyles(formInput, feedback, addUrlBtn, form);
      break;
    }
    case 'responseAndNetworkError': {
      feedback.textContent = watchedState.form.loadingProcess.processError;
      errorFeedbackStyles(addUrlBtn, formInput, feedback);
      break;
    }
    case 'validationError': {
      feedback.textContent = watchedState.form.validError;
      errorFeedbackStyles(addUrlBtn, formInput, feedback);
      break;
    }
    default: {
      break;
    }
  }
};

const renderFeedAndPostCardContainer = (mainDivContainer, elements) => {
  const cardDivContainer = document.createElement('div');
  cardDivContainer.classList.add('card', 'border-0');
  mainDivContainer.append(cardDivContainer);

  const cardDivBodyContainer = document.createElement('div');
  cardDivBodyContainer.classList.add('card-body');
  cardDivContainer.append(cardDivBodyContainer);

  const h2CardTitle = document.createElement('h2');

  h2CardTitle.textContent = mainDivContainer.classList.contains('feeds')
    ? elements.feedsAndPostsEl.h2FeedCardTitle
    : elements.feedsAndPostsEl.h2PostCardTitle;

  h2CardTitle.classList.add('card-title', 'h4');
  cardDivBodyContainer.append(h2CardTitle);

  const ulList = document.createElement('ul');
  ulList.classList.add('list-group', 'border-0', 'rounded-0');
  mainDivContainer.append(ulList);
};

const renderFeeds = (watchedState, elements) => {
  const { feedsMainDivContainer } = elements.feedsAndPostsEl;
  const { feeds } = watchedState;

  if (!feedsMainDivContainer.querySelector('div')) {
    renderFeedAndPostCardContainer(feedsMainDivContainer, elements);
  }
  feedsMainDivContainer.querySelector('ul').innerHTML = '';

  feeds.forEach((feedInRss) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feedInRss.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feedInRss.description;

    feedsMainDivContainer.querySelector('ul').prepend(li);
    li.append(h3);
    h3.append(p);
  });
};

const createPostListItem = (post, elements) => {
  const li = document.createElement('li');
  li.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );

  const aHref = document.createElement('a');
  aHref.setAttribute('href', `${post.link}`);
  aHref.setAttribute('class', 'fw-bold');
  aHref.setAttribute('target', '_blank');
  aHref.setAttribute('data-id', `${post.postId}`);
  aHref.setAttribute('rel', 'noopener noreferrer');
  aHref.textContent = post.title;

  const watchPostBtn = document.createElement('button');
  watchPostBtn.setAttribute('type', 'button');
  watchPostBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  watchPostBtn.setAttribute('data-id', `${post.postId}`);
  watchPostBtn.setAttribute('data-bs-toggle', 'modal');
  watchPostBtn.setAttribute('data-bs-target', '#modal');
  watchPostBtn.textContent = elements.feedsAndPostsEl.watchBtn;

  li.append(aHref, watchPostBtn);

  return li;
};

export const renderPosts = (watchedState, elements) => {
  const { postsMainDivContainer } = elements.feedsAndPostsEl;
  const { posts } = watchedState;

  if (!postsMainDivContainer.querySelector('div')) {
    renderFeedAndPostCardContainer(postsMainDivContainer, elements);
  }

  postsMainDivContainer.querySelector('ul').innerHTML = '';

  const arrOfFlattenPosts = posts.flat();

  arrOfFlattenPosts.forEach((postInRss) => {
    const postListItem = createPostListItem(postInRss, elements);
    postsMainDivContainer.querySelector('ul').prepend(postListItem);
  });
};

const renderClickedPostLinks = (watchedState, elements) => {
  const { postsMainDivContainer } = elements.feedsAndPostsEl;
  const { arrOfClickedPostLinks } = watchedState.stateUi;

  postsMainDivContainer.querySelectorAll('a').forEach((aEl) => {
    const postLink = aEl.getAttribute('href');
    const isPostClicked = arrOfClickedPostLinks.includes(postLink);

    if (isPostClicked) {
      aEl.classList.remove('fw-bold');
      aEl.classList.add('fw-normal', 'link-secondary');
    }
  });
};

const renderModalWindow = (watchedState, elements) => {
  const { post } = watchedState.stateUi.modalWindowContent;
  const { modalTitle, modalDescription, modalReadBtn } = elements.modalWindowEl;

  if (post) {
    const { title, description, link } = post;

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalReadBtn.setAttribute('href', link);
  }
};

export const renderUIView = (watchedState, i18nInstance, elements) => (pathToEl) => {
  switch (pathToEl) {
    case 'form.loadingProcess.processState':
      renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
      break;
    case 'form.loadingProcess.processError':
      renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
      break;
    case 'form.validError':
      renderFeedbacksAndErrors(watchedState, i18nInstance, elements);
      break;
    case 'feeds':
      renderFeeds(watchedState, elements);
      break;
    case 'posts':
      renderPosts(watchedState, elements);
      break;
    case 'stateUi.arrOfClickedPostLinks':
      renderClickedPostLinks(watchedState, elements);
      break;
    case 'stateUi.modalWindowContent':
      renderModalWindow(watchedState, elements);
      break;
    default:
      break;
  }
};
