export const controlClickedPostLinks = (watchedState, elements) => {
  const {
    feedsAndPostsEl: { postsMainDivContainer },
  } = elements;
  const {
    stateUi: { arrOfClickedPostLinks },
  } = watchedState;

  const handleViewedPost = (e) => {
    const clickedElement = e.target;
    // console.log(clickedElement);
    // When a click event occurs, it checks if the clicked element is an anchor (<a>)
    // element, which usually represents a post link.
    if (clickedElement.tagName === 'A') {
      // extract value of href attribute
      // If the clicked element is a post link, it extracts the value of the href
      // attribute, which contains the URL of the post.
      const clikedPostLink = clickedElement.getAttribute('href');
      // console.log(clikedPostLink);
      // It then checks if the extracted post link is already present in the
      // arrOfClickedPostLinks array stored in the watched state.
      if (!arrOfClickedPostLinks.includes(clikedPostLink)) {
        // If the post link is not already in the array, it adds the link to the
        // arrOfClickedPostLinks array.
        arrOfClickedPostLinks.push(clikedPostLink);
        // console.log(arrOfClickedPostLinks);
      }
    }
  };
  // This function listens for click events on the postsMainDivContainer, which typically
  // contains the list of post elements.
  postsMainDivContainer.addEventListener('click', handleViewedPost);
};

// This function is responsible for handling the opening of a modal window when a user
// clicks on a post link.
export const controlModalWindow = (watchedState, elements) => {
  const {
    modalWindowEl: { modalWindow },
  } = elements;
  const { posts } = watchedState;

  const {
    stateUi: { arrOfClickedPostLinks },
  } = watchedState;

  const handleModalWindow = (e) => {
    const { parentNode } = e.relatedTarget;

    // Check if parentNode and modalLink exist before using them
    if (parentNode) {
      console.log(parentNode);
      const modalLink = parentNode.querySelector('a');
      console.log(modalLink);

      // Check if modalLink exists before trying to get its href attribute
      if (modalLink) {
        const href = modalLink.getAttribute('href');
        console.log(href);
        // console.log(posts.flat());
        const arrOfFlattenPosts = posts.flat();
        const post = arrOfFlattenPosts
          .flat()
          .find((post) => post.link === href);
        console.log(post);

        watchedState.stateUi.modalWindowContent = { post };

        if (!arrOfClickedPostLinks.includes(href)) {
          arrOfClickedPostLinks.push(href);
        }
      }
    }
  };
  // It listens for the show.bs.modal event on the modalWindow element, which represents
  // the modal window.
  modalWindow.addEventListener('show.bs.modal', handleModalWindow);
};
