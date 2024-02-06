export const controlClickedPostLinks = (watchedState, elements) => {
  const {
    feedsAndPostsEl: { postsMainDivContainer },
  } = elements;
  const {
    stateUi: { arrOfClickedPostLinks },
  } = watchedState;

  const handleViewedPost = (e) => {
    const clickedElement = e.target;
    console.log(clickedElement);

    if (clickedElement.tagName === "A") {
      // extract value of href attribute
      const clikedPostLink = clickedElement.getAttribute("href");
      // console.log(clikedPostLink);

      if (!arrOfClickedPostLinks.includes(clikedPostLink)) {
        arrOfClickedPostLinks.push(clikedPostLink);
        // console.log(arrOfClickedPostLinks);
      }
    }
  };

  postsMainDivContainer.addEventListener("click", handleViewedPost);
};

// export const controlModalWindow = (watchedState, elements) => {
//   const {
//     feedsAndPostsEl: { postsMainDivContainer },
//   } = elements;
// };
