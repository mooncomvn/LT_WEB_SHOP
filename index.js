var express = require("express"); //Nạp thư viện express
var bodyParser = require("body-parser");
var app = express(); //Gọi thư viện để sử dụng
app.use(express.static("public")); //Mặc định thư mục ban đầu là public
app.set("view engine", "ejs"); //Sử dụng ejs
app.set("views", "./views"); //Thư mục views để chứa các ejs...
const bcrypt = require('bcrypt');
const nodeExternals = require('webpack-node-externals');
// var http = require("http");
// var url = require('url');



app.use(bodyParser.urlencoded({ extended: false }));
app.listen(3000);

// var windowVar = global.sourceUrl;

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

// var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended:false });

var multer  = require('multer');
const { name, render } = require("ejs");
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

// ---------------------------USER NO LOGIN-----------------------------
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
    if(req.body.email=='admin@admin.com' & req.body.password==1)
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
                res.render("admin.ejs",{data:result});
            });
        });
    }
    else{
    var message=[];
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        var sql = "select * from users where email= '"+req.body.email+"' ";
        client.query(sql, function(err, result2){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                if(result2.rows.length<1){
                    message = "Email không tồn tại!";
                    res.render("login", {mess:message});
                }
                else{
                if(result2.rows[0].status==false)
                {
                    message = "Tài khoản của bạn đã bị khóa!";
                    res.render("login", {mess:message});
                }
                else{
                if(result2.rows[0].password!=req.body.password){
                    message = "Mật khẩu không chính xác!";
                    res.render("login", {mess:message});
                }
                else{
                    var id = result2.rows[0].id;
                    res.redirect("user/dashboard/"+id+"");
                // res.render("dashboard", {char:result1.rows[0]});
                }}
            }
            
            
        });   
    });
}
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
                        client.query("insert into users (email, name, password, status) values ('"+req.body.email+"','"+req.body.name+"','"+req.body.password+"',true)", function(err, result){
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
        client.query('select * from comment where id_product='+id, function(err, cmt){
            client.query('select* from users', function(err, allchar){
                    client.query('select * from book', function(err,count){
                        client.query('select * from book where id =' + id, function(err, result){
                            done();
                            if(err){
                                return console.error('error running query', err);
                            }
                            res.render("product-single",{data:result.rows[0], data2:count, allchar:allchar, cmt:cmt});
                    });
                });
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

app.post("/comment/:id", function(req,res){
    var id=req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        var sql = "insert into comment (data,name, id_product) values ('"+req.body.detail+"','"+req.body.name+"','"+id+"')"
        client.query(sql, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.redirect("/product/"+id+"");
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

app.get("/user/faq.html/:id", function(req,res)
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
                res.render("faq_user",{char:result.rows[0]});
            
        });
    });
    
})

app.get("/user/shop.html", function(req,res)
{   var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    // var product = JavascriptgetURLParameterValues("product", fullUrl);
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from users where id=' +user, function(err, char){
            client.query('select * from book', function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                var number_book = result.rowCount;
                var number_page = (number_book/20);
                res.render("shop_user",{data:result, char:char.rows[0], page:number_page});
            });
        });
    });
    
})

app.get("/user/shop.html/page", function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var page = JavascriptgetURLParameterValues("page", fullUrl);
    var offset = (page-1)*20;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from users where id='+user, function(err,char){
        client.query('select * from book', function(err,count){
            client.query("select * from book offset '" + offset + "' limit 20 ", function(err, result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                var number_book = count.rowCount;
                var number_page = (number_book/20);
                res.render("shop_page_user.ejs",{data:result, page:number_page, char:char.rows[0]});
            });
        });
    });
    });
 });

 app.get("/user/shop.html/categ", function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var categ = JavascriptgetURLParameterValues("categ", fullUrl);
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from users where id=' +user, function(err,char){
        client.query('select * from book', function(err, result){
            done();
                if(err){
                    return console.error('error running query', err);
                }
                res.render("shop_categ_user",{data:result, categ_data:categ, char:char.rows[0]});
            });
        });
        
    });
});

app.get("/product",function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    // var url = 'https://product?parameter1=1&parameter=2&&parameter=2';
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var product = JavascriptgetURLParameterValues("product", fullUrl);
    // console.log(user);
    // console.log(product);
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from comment where id_product='+product, function(err, cmt){
            client.query('select* from users', function(err, allchar){
                client.query('select * from users where id='+user, function(err, char){
                    client.query('select * from book', function(err,count){
                        client.query('select * from book where id =' + product, function(err, result){
                            done();
                            if(err){
                                return console.error('error running query', err);
                            }
                            res.render("product-single_user",{data:result.rows[0], data2:count, char:char.rows[0], allchar:allchar, cmt:cmt});
                        });
                    });
                });
            });
        });
    });

});

app.get("/addcart",function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var product = JavascriptgetURLParameterValues("product", fullUrl);
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query("UPDATE users SET book = book || "+product+" where id="+user, function(err, result){
                        done();
                        if(err){
                            return console.error('error running query', err);
                        }
                        res.redirect("/product/?user="+user+"&product="+product+"");
                    });
        
    });
});

app.get("/user/buycart",function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var product = JavascriptgetURLParameterValues("product", fullUrl);
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
                    client.query("UPDATE users SET book = book || "+product+" where id="+user, function(err, char2){
                    done();
                    if(err){
                        return console.error('error running query', err);
                    }
                    res.redirect("/user/buycart/"+user+""); 
        });
        
    });
    
});

app.get("/user/buycart/:id",function(req,res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from users where id='+req.params.id, function(err, char){
                client.query('select * from book', function(err, result){
                    done();
                    if(err){
                        return console.error('error running query', err);
                    }
                    res.render("shop_cart",{data:result, char:char.rows[0]});
            });
        });
    });
        
});
    
app.get("/buycart/delete", function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var product = JavascriptgetURLParameterValues("product", fullUrl);
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('UPDATE users SET book = array_remove(book, '+product+') where id='+user, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.redirect("/user/buycart/"+user+"");
        });
        
    });
});

app.post("/comment", function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var product = JavascriptgetURLParameterValues("product", fullUrl);

    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        var sql = "insert into comment (data,id_user, id_product) values ('"+req.body.detail+"','"+user+"','"+product+"')"
        client.query(sql, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.redirect("/product/?user="+user+"&product="+product+"");
        });
        
    });
});

// ---------------------------ADMIN-----------------------------
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

app.get("/user", function(req,res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select * from users', function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.render("user.ejs",{data:result});
        });
    });
});

app.get("/user/delete/:id", function(req,res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('delete from users where id =' +req.params.id, function(err, result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.redirect("../../user");
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
                var sql = "insert into book (name,image,detail,author,pre_cost,cur_cost,type,categ) values ('"+req.body.name+"','"+req.file.originalname+"','"+req.body.detail+"','"+req.body.author+"','"+req.body.pre_cost+"','"+req.body.cur_cost+"','"+req.body.type+"','"+req.body.categ+"')";
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

app.post("/user", function(req,res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    var user = JavascriptgetURLParameterValues("user", fullUrl);
    var status = JavascriptgetURLParameterValues("status", fullUrl);
    if(status=='false')
    {
        status='true';
    }
    else{status='false';}
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query("update users set status='"+status+"'where id="+user,function(err,result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            res.redirect("../user");
        });
    });
});


function JavascriptgetURLParameterValues(parameterName, url) {
    if (!url) url = window.location.href;
    parameterName= parameterName.replace(/[\[\]]/g, "\\><");
    var regularExpression = 
        new RegExp("[?&]" + parameterName + "(=([^&#]*)|&|#|$)"),
    results = regularExpression.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
