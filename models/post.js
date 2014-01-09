var mongodb = require('./db');

function Post(email, post, time) {
	this.user = email;
	this.post = post;
	if (time) {
		this.time = time;
	}
	else {
		this.time = new Date();
	}
};

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
	//要存入数据库的文档
	var post = {
		user: this.user,
		post: this.post,
		time: this.time
	};
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//将文档插入 posts 集合
			//collection.ensureIndex('user');
			collection.insert(post, {
				safe: true
			}, function(err, post) {
				mongodb.close();
				callback(err, post); //返回 err 为 null
			});
		});
	});
};

//读取文章及其相关信息
Post.get = function(name, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (name) {
				query.user = name;
			}
			//根据 query 对象查询文章
			collection.find(query).sort({
				time: -1
			}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					allback(err, null); //失败！返回 err
				}
				var posts = [];
				docs.forEach(function (doc, index){
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});
				callback(null, posts);
			});
		});
	});
};