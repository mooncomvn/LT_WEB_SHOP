var express = require("express"); //Nạp thư viện express
var bodyParser = require("body-parser");
var app = express(); //Gọi thư viện để sử dụng
app.use(express.static("public")); //Mặc định thư mục ban đầu là public
app.set("view engine", "ejs"); //Sử dụng ejs
app.set("views", "./views"); //Thư mục views để chứa các ejs...
const bcrypt = require('bcrypt');
// const LocalStrategy = require("passport-local").Strategy;
// function initialize(passport){
//     const autheticateUser = (email, password, done)=>{
//         pool.query(
//             `SELECT * FROM users WHERE email = $1`,
//             [email],
//             (err,result)=>{
//             if(err){
//                 throw err;
//             }
//             console.log(result.rows);
//             if(result.rows.length>0){
//                 const user = result.rows[0];
//                 bcrypt.compare(password, user.password,(err, isMatch)=>{
//                     if(err){
//                         throw err;
//                     }
//                     if(isMatch){
//                         return done(null, user);
//                     }else{
//                         return done(null, false, {message:"Password is not correct"})
//                     }
//                 });
//             }else{
//                 return done(null, false, {message: "Email is not registered!"})
//             }
//         }
//         )
//     }
//     passport.use(new LocalStrategy({
//         usernameField: "email",
//         passwordField: "password", 
//     }, autheticateUser
//     )
//     );
//     passport.serializeuser((user, done)=>done(null, user.id));
//     passport.deserializeUser((id, done)=>{
//         pool.query(
//             `SELECT * FROM users WHERE id = $1`, [id], (err, result)=>{
//                 if(err){
//                     throw err;
//                 }
//                 return done(null, result.rows[0]);
//             }
//         );
//     });
// }

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000);

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
const { name } = require("ejs");
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
            var number_book = result.rowCount;
            var number_page = (number_book/20);
            res.render("shop.ejs",{data:result, page:number_page});
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
        client.query('select * from book', function(err,count){
            client.query("select * from book offset '" + offset + "' limit 20 ", function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                var number_book = count.rowCount;
                var number_page = (number_book/20);
                res.render("shop_page.ejs",{data:result, page:number_page});
            });
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
                var sql = "insert into book (name,detail,author,pre_cost,cur_cost,type,categ) values ('"+req.body.name+"','"+req.body.detail+"','"+req.body.author+"','"+req.body.pre_cost+"','"+req.body.cur_cost+"','"+req.body.type+"','"+req.body.categ+"')";
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
                    var sql = "update book set name = '"+req.body.name+"', pre_cost = '"+req.body.pre_cost+"', cur_cost = '"+req.body.cur_cost+"', type= '"+req.body.type+"', categ= '"+req.body.categ+"', detail='"+req.body.detail+"', author='"+req.body.author+"' where id="+id;
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
                    var sql = "update book set name = '"+req.body.name+"',image ='"+req.file.originalname+"', pre_cost = '"+req.body.pre_cost+"', cur_cost = '"+req.body.cur_cost+"', type= '"+req.body.type+"', categ= '"+req.body.categ+"', detail='"+req.body.detail+"', author='"+req.body.author+"' where id="+id;
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

app.get("/login.html", function(req,res){
    res.render("login");
});

app.post("/login.html",function(req,res){
    var message=[];
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        var sql = "select * from users where email= '"+req.body.email+"' ";
        client.query(sql, function(err, result){
            client.query("select * from users where password= '"+req.body.password+"' ", function(err, result1){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                if(result.rows.length<1){
                    message = "Email does not exist!";
                    res.render("login", {mess:message});
                }
                if(result1.rows.length<1){
                    message = "Password is not correct!";
                    res.render("login", {mess:message});
                }
                
                else{
                    var id = result.rows[0].id;
                    res.redirect("user/dashboard/"+id+"");
                // res.render("dashboard", {char:result1.rows[0]});
                }
            
            });   
            
        });   
    });
});

app.post("/register.html",async function(req,res){

    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;
    var password2 = req.body.password2;
    var message =[];
    // console.log(email);
    if(password!=password2){
        message ="Password do not match!";
        res.render("register", {mess:message});
    }
    else{
        // let hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);
        pool.connect(function(err, client, done){
            if(err){
                return console.error('error fetching client from pool', err);
            }
            var sql = "select * from users where email= '"+req.body.email+"' ";
            client.query(sql, function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                if(result.rows.length>0){
                     message = "Email already registered";
                     res.render("register", {mess:message});
                }
                else{
                    pool.connect(function(err, client, done){
                        if(err){
                            return console.error('error fetching client from pool', err);
                        }
                        client.query("insert into users (email, name, password) values ('"+req.body.email+"','"+req.body.name+"','"+req.body.password+"')", function(err, result){
                            done();
                            if(err){
                                return console.error('error running query', err);
                            }
                            res.render("login");
                        });

                });
                 }
            });
            
        });

    }
        // pool.query(
        //     `select * from user where email= $email`,
        //     [email],
        //     (err, result) => {
        //          console.log(result.rows);
        //          if(result.rows.length>0){
        //              message = "Email already registered";
        //              res.render("register", {mess:message});
        //          }
        //     }

        // );


});

app.get("/register.html", function(req,res){
    
    res.render("register");
});


app.get("/product/:id", function(req,res){
    var id = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book', function(err,count){
            client.query('select * from book where id =' + id, function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                res.render("product-single",{data:result.rows[0], data2:count});
            });
        });
        
    });
});

app.get("/shop.html/:id", function(req,res){
    var categ = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book', function(err, result){
            done();
                if(err){
                    return console.error('error running query', err);
                }
                res.render("shop_categ",{data:result, categ_data:categ});
        });
        
    });
});


//---------------------------USER---------------------------
app.get("/user/dashboard/:id", function(req,res){
    var id = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from users where id =' + id, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.render("dashboard",{char:result.rows[0]});
        });
        
    });
});

app.post("/user/dashboard/:id",urlencodeParser, function(req,res){
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
                    var sql = "update users set name = '"+req.body.name+"', phone = '"+req.body.phone+"' where id="+id;
                    client.query(sql, function(err, result){
                        done();
                        if(err){
                            return console.error('error running query', err);
                        }
                        res.redirect("../dashboard/"+id+"");
                    });
                    
                });
            }
            else{
                pool.connect(function(err, client, done){
                    if(err){
                        return console.error('error fetching client from pool', err);
                    }
                    var sql = "update users set name = '"+req.body.name+"', email = '"+req.body.email+"', phone = '"+req.body.phone+"', image= '"+req.file.originalname+"' where id="+id;
                    client.query(sql, function(err, result){
                        done();
                        if(err){
                            return console.error('error running query', err);
                        }
                        res.redirect("../dashboard/"+id+"");
                    });
                    
                });
            }
            
        }
      });
});

app.get("/user/index.html/:id", function(req,res)
{
    var id = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from book', function(err, result1){
            client.query('select * from users where id =' + id, function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                res.render("home_user",{char:result.rows[0], data:result1});
            });
    });
    });
    
})

app.get("/user/about.html/:id", function(req,res)
{
    var id = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        
            client.query('select * from users where id =' + id, function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                res.render("about_user",{char:result.rows[0]});
            
        });
    });
    
})