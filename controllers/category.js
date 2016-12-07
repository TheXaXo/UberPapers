const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = {
    listCategoryArticles: (req, res) => {
        let id = req.params.id;

        // Yes, it's a valid ObjectId, proceed with `findById` call.
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            res.redirect('/');
            return
        }

        let currentPage = req.query.page;

        let currentPageInt = 0;
        if (currentPage) {
            currentPageInt = parseInt(currentPage);
        }

        let currentUrl = req.originalUrl.split("?")[0];

        let currentSort = req.query.sort;
        if (!currentSort) {
            currentSort = 'undefined'
        }

        let currentResolution = req.query.res;
        if (!currentResolution) {
            currentResolution = 'all'
        }
        let currentWidth = 0;
        let currentHeight = 0;
        if (currentResolution !== 'all') {
            currentWidth = parseInt(currentResolution.split("x")[0]);
            currentHeight = parseInt(currentResolution.split("x")[1]);
        }
        let onAllResolutions = false;
        if (currentResolution === 'all') {
            onAllResolutions = true;
        }

        Category.findById(id).populate('articles').then(category => {
            User.populate(category.articles, {path: 'author'}, (err) => {
                if (err) {
                    console.log(err.message);
                }

                let categoryArticles = category.articles;

                if (currentResolution !== 'all') {
                    categoryArticles = categoryArticles.filter(function (article) {
                        return article.width === currentWidth &&
                            article.height === currentHeight;
                    })
                }

                var pages = [];
                let articlesCount = categoryArticles.length;
                let numberOfPages = Math.ceil(articlesCount / 15);

                for (var a = 1; a <= numberOfPages; a++) {
                    if (currentPageInt + 1 === a) {
                        var page = {text: a, index: a - 1, isSelected: true};
                    } else {
                        var page = {text: a, index: a - 1, isSelected: false};
                    }
                    pages.push(page);
                }

                if (currentSort === 'views') {
                    categoryArticles = categoryArticles
                        .sort(function (a, b) {
                            if (a.views > b.views) return -1;
                            if (a.views < b.views) return 1;
                        })
                } else if (currentSort === 'downloads') {
                    categoryArticles = categoryArticles
                        .sort(function (a, b) {
                            if (a.downloads > b.downloads) return -1;
                            if (a.downloads < b.downloads) return 1;
                        })
                } else {
                    categoryArticles = categoryArticles.reverse();
                }

                categoryArticles = categoryArticles
                    .slice(currentPageInt * 15, currentPageInt * 15 + 15);


                res.render('home/articles', {
                    articles: categoryArticles,
                    pages: pages,
                    pagesExist: true,
                    sortingExists: true,
                    symbol: '?',
                    onPageWithWallpapers: true,
                    onAllResolutions: onAllResolutions,

                    currentUrl: currentUrl,
                    currentSort: currentSort,
                    currentPage: currentPage,
                    currentResolution: currentResolution
                })
            });
        });
    }
};