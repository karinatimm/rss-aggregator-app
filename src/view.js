export const renderFeedbacksAndErrors = (
  watchedState,
  i18nInstance,
  elements
) => {
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
        : watchedState.form.loadingProcess.processErrorNetwork;
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
    default: {
      throw new Error(
        `Uknown error: ${watchedState.form.loadingProcess.processState}`
      );
    }
  }
};
