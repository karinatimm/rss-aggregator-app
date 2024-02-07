export const controlClickedPostLinks = (watchedState, elements) => {
  const {
    feedsAndPostsEl: { postsMainDivContainer },
  } = elements;
  const {
    stateUi: { arrOfClickedPostLinks },
  } = watchedState;

  const handleViewedPost = (e) => {
    const clickedElement = e.target;

    if (clickedElement.tagName === 'A') {
      const clikedPostLink = clickedElement.getAttribute('href');

      if (!arrOfClickedPostLinks.includes(clikedPostLink)) {
        arrOfClickedPostLinks.push(clikedPostLink);
      }
    }
  };

  postsMainDivContainer.addEventListener('click', handleViewedPost);
};

export const controlModalWindow = (watchedState, elements) => {
  const {
    modalWindowEl: { modalWindow },
  } = elements;
  const { posts } = watchedState;

  const {
    stateUi: { arrOfClickedPostLinks },
  } = watchedState;

  const handleModalWindow = (e) => {
    const closestPostLiItem = e.relatedTarget.parentElement;

    if (closestPostLiItem) {
      const aElement = closestPostLiItem.querySelector('a');

      if (aElement) {
        const href = aElement.getAttribute('href');
        const arrOfFlattenPosts = posts.flat();
        const post = arrOfFlattenPosts.find(
          (postInarr) => postInarr.link === href,
        );

        watchedState.stateUi.modalWindowContent = { post };

        if (!arrOfClickedPostLinks.includes(href)) {
          arrOfClickedPostLinks.push(href);
        }
      }
    }
  };

  modalWindow.addEventListener('show.bs.modal', handleModalWindow);
};
