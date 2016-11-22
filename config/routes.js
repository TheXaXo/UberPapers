const multer = require('multer');
const path = require('path');
const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const adminController = require('./../controllers/admin/admin');
const articleController = require('./../controllers/article');
const tagController = require('./../controllers/tag');

module.exports = (app) => {
    app.get('/', homeController.index);

    app.get('/category/:id', homeController.listCategoryArticles);

    app.post('/search', homeController.search);

    app.get('/article/create', articleController.createGet);

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads');
        },
        filename: function (req, file, cb) {
            cb(null, (Math.random().toString(36) + '00000000000000000').slice(2, 10) + Date.now() + path.extname(file.originalname));
        }
    });

    function fileFilter(req, file, cb) {
        var type = file.mimetype;
        var typeArray = type.split("/");
        if (typeArray[0] == "image") {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }

    var upload = multer({storage: storage, dest: "public/uploads", fileFilter: fileFilter});
    app.post('/article/create', upload.single('photo'), articleController.createPost);

    app.get('/article/details/:id', articleController.details);

    app.get('/article/edit/:id', articleController.editGet);
    app.post('/article/edit/:id', articleController.editPost);

    app.get('/article/delete/:id', articleController.deleteGet);
    app.post('/article/delete/:id', articleController.deletePost);

    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/logout', userController.logout);

    app.get('/tag/:name', tagController.listArticlesByTag);

    app.use((req, res, next) => {
        if (req.isAuthenticated()){
            req.user.isInRole('Admin').then(isAdmin => {
                if (isAdmin){
                   next();
                } else {
                    res.redirect('/');
                }
            })
        } else {
            res.redirect('/user/login');
        }
    });

    app.get('/admin/user/all', adminController.user.all);

    app.get('/admin/user/edit/:id', adminController.user.editGet);
    app.post('/admin/user/edit/:id', adminController.user.editPost);

    app.get('/admin/user/delete/:id', adminController.user.deleteGet);
    app.post('/admin/user/delete/:id', adminController.user.deletePost);

    app.get('/admin/category/all', adminController.category.all);

    app.get('/admin/category/create', adminController.category.createGet);
    app.post('/admin/category/create', adminController.category.createPost);

    app.get('/admin/category/edit/:id', adminController.category.editGet);
    app.post('/admin/category/edit/:id', adminController.category.editPost);

    app.get('/admin/category/delete/:id', adminController.category.deleteGet);
    app.post('/admin/category/delete/:id', adminController.category.deletePost);
};
