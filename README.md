# The RSS Aggregator App

### Progect description:

The RSS Aggregator is a web application designed to aggregate and display RSS feeds from various sources. It allows users to add RSS feed URLs, fetch the latest posts from those feeds, and view them in a unified interface. The application provides features such as feed validation, error handling, and modal windows for viewing full post content. Feel free to explore the deployed application and provide any feedback or suggestions for improvement. Enjoy!

### Features

- **RSS Feed Aggregation**: Aggregate RSS feeds from multiple sources.
- **Adding RSS Feeds**: Users can add RSS feed URLs through a form input.
- **Feed Validation**: Validate added feed URLs to ensure they are valid RSS feeds.
- **Fetching Latest Posts**: Fetch the latest posts from added feeds and display them in the UI.
- **User-Friendly Interface**: Intuitive interface for easy navigation and consumption of RSS content.
- **Error Handling**: Handle errors gracefully, providing informative feedback to users.
- **Modal Windows**: Utilize modal windows to display full post content when a user clicks on a post.

### Additional Highlights

- **Responsive Design**: The application is designed to be responsive and work seamlessly across different devices.

### Here are some real RSS feeds for testing or your daily use:

- **https://aljazeera.com/xml/rss/all.xml**
- **https://buzzfeed.com/world.xml**
- **https://thecipherbrief.com/feed**
- **http://www.dp.ru/exportnews.xml**

### Deployment

This project has been deployed on Vercel and is accessible at the following URL:
[RSS Aggregator on Vercel](https://rss-aggregator-app.vercel.app/)

## System Requirements if one wants to run the RSS Aggregator project locally:

To run the RSS Aggregator app locally, ensure you have the following software installed on your system:

- Node.js(version 20.3.0 LTS or higher) **(https://nodejs.org/)**
- Node Package Manager(npm) **(https://www.npmjs.com/)**

### Installation and usage instructions:

Follow these steps to install and run RSS Aggregator app:

- Check if Node.js and npm are installed:

Check if you Node.js and npm are installed on your computer. If they are not installed, use the links provided in the "System requirements" section above to install them. If they are already installed, check their versions by opening your terminal or command prompt and running the following commands:

**node -v**
**npm -v**

- Clone the RSS Aggregator app repository:

Open the terminal or command prompt, navigate to your desired directory, and clone the repository from GitHub using the provided link:

**git clone https://github.com/karinatimm/RSS-Aggregator-App.git**

- Move to the project directory on your computer. If desired, rename the directory as required:

**cd RSS-Aggregator-App**

- Install project dependencies using npm:

**npm ci**

- Execute the following command to start working with this project locally by opening the localhost reference in the browser:

  **npm run develop**

### Quality Assurance

### Hexlet tests and linter status:

[![Actions Status](https://github.com/karinatimm/RSS-Aggregator-App/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/karinatimm/RSS-Aggregator-App/actions)

### CodeClimate badge in order to display this project's quality:

[![Maintainability](https://api.codeclimate.com/v1/badges/5008988e470b6d860762/maintainability)](https://codeclimate.com/github/karinatimm/RSS-Aggregator-App/maintainability)
