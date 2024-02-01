export const renderFeedback = (watchedState, elements) => {
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
