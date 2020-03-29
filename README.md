# Ali Express Scraper

> This is a half-manual, half-automatic web crawler for Ali Express

# Project Setup

```bash
$ npm i
```

# Crawling Process

* Step 1: You have to sign in manually, this is the easiest way to get past Ali Express's authentication system
* Step 2: Modify the `root` url in the source code (it's probably best if it is a mobile link, not a desktop link)
* Step 3: Run the crawler with `node main.js`, this will download all the product detail pages into the `pages` directory
* Step 4: Run a parser that you like, such as BeautifulSoup, this code is not included in this repository