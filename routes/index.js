
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports = function(app){
	app.get('/',function(req, res){
		Post.get(null, function (err, posts){
			if (err) {
				posts = [];
			}
			res.render('index',{
				title : 'Home',
				posts: posts,
				user: req.session.user,
	   			success: req.flash('success').toString(),
	    		error: req.flash('error').toString()
			});
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg',function (req, res){
		res.render('reg',{
			title: 'User sign up',
			user: req.session.user,
    		success: req.flash('success').toString(),
    		error: req.flash('error').toString()
		});
	});

	app.post('/reg',checkNotLogin);
	app.post('/reg', function (req, res) {
	  var name = req.body.username,
	      password = req.body.password,
	      password_re = req.body['password-repeat'];
	  //检验用户两次输入的密码是否一致
	  if (password_re != password) {
	    req.flash('error', 'The two passwords are not same!'); 
	    return res.redirect('/reg');//返回注册页
	  }
	  //生成密码的 md5 值
	  var md5 = crypto.createHash('md5'),
	      password = md5.update(req.body.password).digest('hex');
	  var newUser = new User({
	      password: password,
	      email: req.body.username
	  });
	  //检查用户名是否已经存在 
	  User.get(newUser.email, function (err, user) {
	    if (user) {
	      req.flash('error', 'user is exists!');
	      return res.redirect('/reg');//返回注册页
	    }
	    //如果不存在则新增用户
	    newUser.save(function (err, user) {
	      if (err) {
	        req.flash('error', err);
	        return res.redirect('/reg');//注册失败返回主册页
	      }
	      req.session.user = newUser;//用户信息存入 session
	      req.flash('success', 'register successfully');
	      res.redirect('/');//注册成功后返回主页
	    });
	  });
	});
	
	app.get('/login', checkNotLogin);
	app.get('/login', function (req, res){
		res.render('login', {
			title: 'login',
			user: req.session.user,
			success: req.flash('success').toString(),
    		error: req.flash('error').toString()

		});
	});

	app.post('/login', checkNotLogin);
	app.post('/login',function (req, res){
		//生成密码的 md5 值
	  	var md5 = crypto.createHash('md5'),
	    password = md5.update(req.body.password).digest('hex');
	  	//检查用户是否存在
	  	User.get(req.body.name, function (err, user) {
    	if (!user) {
      		req.flash('error', 'User not exists!'); 
      		return res.redirect('/login');//用户不存在则跳转到登录页
	    }
	    //检查密码是否一致
	    if (user.password != password) {
	      req.flash('error', 'password error!'); 
	      return res.redirect('/login');//密码错误则跳转到登录页
	    }
	    //用户名密码都匹配后，将用户信息存入 session
	    req.session.user = user;
	    req.flash('success', 'login successfully!');
	    res.redirect('/');//登陆成功后跳转到主页
	  });
	});

	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) { 
		req.session.user = null; 
		req.flash('success', 'logout successfully'); 
		res.redirect('/');
	});

	app.post('/post', checkLogin);
	app.post('/post', function (req, res) {
		var currentUser = req.session.user;
		var post = new Post(currentUser.email, req.body.post);
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', 'post successfully!');
			res.redirect('/u/' + currentUser.email);
		});
	});

	app.get('/u/:user', function (req, res){
		User.get(req.params.user, function(err, user){
			if (!user){
				req.flash('error', 'user not exists!');
				return res.redirect('/');
			}
			Post.get(user.email, function (err, posts){
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					posts: posts,
					user: req.session.user,
					title : user.email,
	   				success: req.flash('success').toString(),
	    			error: req.flash('error').toString()
				});
			});
		});
	});

	function checkLogin (req, res, next){
		if (!req.session.user){
			req.flash('error','not login');
			return res.redirect('login');
		}
		next();
	}

	function checkNotLogin (req, res, next){
		if(req.session.user){
			req.flash('error', 'already longin');
			return res.redirect('back');
		}
		next();
	}
};