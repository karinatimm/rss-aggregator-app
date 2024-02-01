export default {
  ru: {
    // // Translation resources for Russian
    translation: {
      formTitle: "RSS агрегатор",
      formSubtitle: "Твои главные новости всегда под рукой",
      placeholder: "ссылка RSS",
      urlExample: "Пример: https://ru.hexlet.io/lessons.rss",
      rssUploaded: "RSS успешно загружен", // rssLoaded should create
      rssIsLoading: "RSS загружается", // should create
      feedsTitle: "Фиды", // feedElTitle should create feedTitle
      postsTitle: "Посты", // postElTitle should create postTitle
      authorContainer: "создано",
      buttons: {
        addUrlBtn: "Добавить",
        watchBtn: "Просмотр", // btnWatch should create
        modalReadBtn: "Читать полностью",
        modalCloseBtn: "Закрыть",
      },
      errors: {
        rssAlreadyExists: "RSS уже существует", // rssExist
        invalidUrl: "Ссылка должна быть валидным URL",
        errorNetwork: "Ошибка сети",
        noValidRss: "Ресурс не содержит валидный RSS", // wrongRss
      },
    },
  },
};
