var express = require("express"); //Nạp thư viện express
var app = express(); //Gọi thư viện để sử dụng
app.use(express.static("public")); //Mặc định thư mục ban đầu là public
app.set("view engine", "ejs"); //Sử dụng ejs
app.set("views", "./views"); //Thư mục views để chứa các ejs...

app.listen(3000); //Port  

var pg = require("pg");
var config = {
    user: 'postgres',
    database: 'book_shop',
    password: '0918303693',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};


var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended:false });

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/upload')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
var upload = multer({ storage: storage }).single('image');  


var pool = new pg.Pool(config);


app.get("/", function(req,res)
{
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book', function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            
            res.render("home.ejs",{data:result});
        });
    });
    
})

app.get("/index.html", function(req,res)
{
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book', function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            
            res.render("home.ejs",{data:result});
        });
    });
    
})



app.get("/shop.html", function(req,res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        
        client.query('select * from book', function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.render("shop.ejs",{data:result});
        });
    });
});

app.get("/shop.html/page/:id", function(req,res){
    var id = req.params.id;
    var offset = (id-1)*20;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        
        client.query("select * from book offset '" + offset + "' limit 20 ", function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.render("shop_page.ejs",{data:result});
        });
    });
 });

app.get("/admin", function(req,res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book', function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.render("admin.ejs",{data:result});
        });
    });
});

app.get("/delete/:id", function(req,res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('delete from book where id =' +req.params.id, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.redirect("../admin");
        });
        
    });
});

app.get("/add", function(req,res){
    res.render("add");
});

app.post("/add",urlencodeParser, function(req,res){
    upload(req, res, function (err) {
        if (err) {
            res.send("error");
        }
        else if(typeof(req.file)=='undefined')
        {
            pool.connect(function(err, client, done){
                if(err){
                    return console.error('error fetching client from pool', err);
                }
                var sql = "insert into book (name,detail,pre_cost,cur_cost,type,categ) values ('"+req.body.name+"','"+req.body.detail+"','"+req.body.pre_cost+"','"+req.body.cur_cost+"','"+req.body.type+"','"+req.body.categ+"')";
                client.query(sql, function(err, result){
                    done();
                    if(err){
                        return console.error('error running query', err);
                    }
                    res.redirect("../admin");
                });
                
            });
        }
        else{
            pool.connect(function(err, client, done){
                if(err){
                    return console.error('error fetching client from pool', err);
                }
                var sql = "insert into book (name,image,detail,pre_cost,cur_cost,type,categ) values ('"+req.body.name+"','"+req.file.originalname+"','"+req.body.detail+"','"+req.body.pre_cost+"','"+req.body.cur_cost+"','"+req.body.type+"','"+req.body.categ+"')";
                client.query(sql, function(err, result){
                    done();
                    if(err){
                        return console.error('error running query', err);
                    }
                    res.redirect("../admin");
                });
                
            });
        }
      })
});

app.get("/edit/:id", function(req,res){
    var id = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book where id =' + id, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.render("edit",{data:result.rows[0]});
        });
        
    });
});

app.post("/edit/:id",urlencodeParser, function(req,res){
    var id=req.params.id;
    upload(req, res, function (err) {
        if (err) {
            res.send("error");
        }
        else{
            if(typeof(req.file)=='undefined'){
                pool.connect(function(err, client, done){
                    if(err){
                        return console.error('error fetching client from pool', err);
                    }
                    var sql = "update book set name = '"+req.body.name+"', pre_cost = '"+req.body.pre_cost+"', cur_cost = '"+req.body.cur_cost+"', type= '"+req.body.type+"', categ= '"+req.body.categ+"', detail='"+req.body.detail+"' where id="+id;
                    client.query(sql, function(err, result){
                        done();
                        if(err){
                            return console.error('error running query', err);
                        }
                        res.redirect("../admin");
                    });
                    
                });
            }
            else{
                pool.connect(function(err, client, done){
                    if(err){
                        return console.error('error fetching client from pool', err);
                    }
                    var sql = "update book set name = '"+req.body.name+"',image ='"+req.file.originalname+"', pre_cost = '"+req.body.pre_cost+"', cur_cost = '"+req.body.cur_cost+"', type= '"+req.body.type+"', categ= '"+req.body.categ+"', detail='"+req.body.detail+"' where id="+id;
                    client.query(sql, function(err, result){
                        done();
                        if(err){
                            return console.error('error running query', err);
                        }
                        res.redirect("../admin");
                    });
                    
                });
            }
            
        }
      });
});


app.get("/about.html", function(req,res){
    res.render("about");
});

app.get("/faq.html", function(req,res){
    res.render("faq");
});
