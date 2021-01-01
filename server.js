var jwt = require("jsonwebtoken");
const cryptoRandomString = require("crypto-random-string");
const multer = require("multer");
var bcrypt = require("bcryptjs");
const path = require("path");
const cors = require("cors");
const { User } = require("./Model/User");
// const payment =require('./Model/Payment')
const { Product } = require("./Model/Product");
const { Cartitem } = require("./Model/Cart");
const { Cart } = require("./Model/Cart");
const { Order } = require("./Model/Order");
const { UserValidation } = require("./Middleware/validation");
const bodyParser = require("body-parser");
var schedule = require("node-schedule");
var express = require("express");
var app = express();
const stripe = require("stripe")(
  "sk_test_51HQ9l9Bl9xvRzSgFgDR5kHcwvOUGcpvskOIdLzB9O5HmVzQi4RIiFCj0UhLLZdTTuX0yfXly8174Ex64ybwOU3xC00d8KcrDHA"
);
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(cors({origin:"*"}));

const port =process.env.PORT || 5000;;


app.post("/forget", async (req, res) => {
  console.log("Email", req.body.Email);

  User.findOne({ Email: req.body.Email })
    .then((d) => {
      console.log("Find Email", d.Email);
      User.findOneAndUpdate(
        { _id: d._id },
        { forgettoken: cryptoRandomString({ length: 15 }) },
        { new: true }
      )
        .then((d) => {
          console.log("return data", d.forgettoken);
          setjob(d._id);
          main(`https://sp18-bse-026frontend.herokuapp.com/newpass/${d.forgettoken}`)
            .then((d) => {
              console.log("Email return", d);
              res.status(200).json(true);
            })
            .catch((e) => {res.status(200).json("from mail end");console.log(e)});
        })
        .catch((e) => {res.status(200).json("from email update end");console.log(e)});
    })
    .catch((e) =>{res.status(200).json("from email not found update end");console.log(e)});
});

app.post("/Cart", auth, async (req, res) => {
  console.log("cart data in cart", req.body);
  let sum = 0;
  let user = User.findOne({ _id: req.body.Userid });

  let cart = new Cart({
    helpid: req.body.Userid,
    UserId: { ...user },
  });
  req.body.cartdata.map((item) => {
    console.log("developd", item);
    sum = sum + item.price * item.quantity;
    cart.product.push({
      product: {
        productId: item.id,
        ProductName: item.productname,
        Image: item.Image,
        Rating: item.Rating,
      },

      quantity: item.quantity,
      price: item.price,
    });
  });
  cart.total = sum;
  cart
    .save()
    .then((d) => console.log("Cart Save", d))
    .catch((e) => console.log(e));

  res.send("Hello");
});

app.post("/store/payment", auth, async (req, res) => {
  console.log("user detail", req.body);
  // let allcart=await Cart.find({})
  // console.log("check desire cart",allcart)
  //  let cartfinal;
  //  allcart.map((item,index)=>{
  //    console.log("item found",item)
  //    console.log("item index",index)
  //   if(item.UserId._id==req.body.Userid)
  //   { console.log("match found",index)

  // }})
  //  console.log("Fianl cart",cartfinal)
  let cart = await Cart.findOne({ helpid: req.body.Userid });
  console.log("Cart get", cart);
  let order = await new Order({
    Shippingaddress: req.body.Shippingaddress,
    Productlsit: cart,
  });
  //   console.log("card",cart)

  // order.productID=cart
  let user = User.findOne({ _id: req.body.Userid });

  order.User = user;
  order.helpid = req.body.Userid;
  order
    .save()
    .then((d) => {
      console.log(d);
      res.status(200).json(d);
      console.log("order done", d);
      let pay = new Payment({
        amount: req.body.amount,
      });
      pay.order = d;
      pay.User = user;
      pay
        .save()
        .then((d) => {
          console.log("done", d);
          Cart.remove({ helpid: req.body.Userid })
            .then((d) => console.log(d))
            .catch((e) => console.log(e));
          res.status(200).json(d);
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
});

app.get("/order",auth, (req, res) => {
  Order.find({ helpid: req.body.Userid })
    .then((d) => {
      console.log("order value", d);
      res.status(200).json({order:d});
    })
    .catch((e) => console.log(e));
});
app.post("/payment/create", async (req, res) => {
  const amount = req.query.total;
  console.log("this is payment from user", amount);
  const paymentintent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
  });

  res.status(201).send({ clientsecret: paymentintent.client_secret });
});

let image = [];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    console.log(file);
    image.push(Date.now() + path.extname(file.originalname));
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

upload = multer({ storage });

app.post(
  "/image/upload",
  (req, res, next) => {
    image = [];
    next();
  },
  upload.array("image", 4),
  (req, res, next) => {
    let pro = new Product(({} = req.body));
    image.map((img) => pro.Image.push({ imgkey: img }));
    pro
      .save()
      .then((d) => res.status(201).json(d))
      .catch((e) => res.status(401).json(e));
  }
);

// app.get("/product", (req, res) => {
//  Product.find({}).then(d=>{console.log(d)
// res.status(201).json(d);}).catch(e=>{console.log(e);res.status(401).json(e)})

// });

app.post("/cartitem", async (req, res) => {
  let cartitem = await Cartitem.findOne({ productId: req.body.productid });
  console.log("from client", req.body);
  if (req.body.update) {
    if (req.body.update == "INC") {
      Cartitem.findOneAndUpdate(
        { product: req.body.productid },
        { quantity: cartitem.quantity + 1 },
        (err, update) => {
          if (err) console.log(err);
          console.log(update);
          res.status(200).json(update);
        }
      );
    } else {
      Cartitem.findOneAndUpdate(
        { product: req.body.productid },
        { quantity: cartitem.quantity + 1 },
        (err, update) => {
          if (err) console.log(err);
          console.log(update);
          res.status(200).json(update);
        }
      );
    }
  } else {
    let item = new Cartitem({
      product: {
        productId: req.body.product.id,
        ProductName: req.body.product.ProductName,
        Image: req.body.product.Image,
        Rating: req.body.product.Rating,
      },
      quantity: req.body.quantity,
      price: req.body.price,
    });
    item
      .save()
      .then((d) => res.status(200).json(d))
      .catch((e) => res.status(401).json(e));
  }
});

app.get("/detail/:productid", (req, res) => {
  console.log(req.params);
  if (req.params.productid) {
    Product.findOne({ _id: req.params.productid })
      .then((d) => res.status(200).json(d))
      .catch((e) => res.status(401).json(e));
  }
});
app.get("/getcart", (req, res) => {
  console.log("getcart called");
  Cartitem.find({})
    .then((d) => {
      console.log(d), res.status(200).json(d);
    })
    .catch((e) => res.status(200).json(e));
});

app.post("/removecartid", (req, res) => {
  Cartitem.delete({ _id: req.body.cartid })
    .then((d) => console.log(d))
    .then((e) => console.log(e));
  res.status(200).json({ mg: "done" });
});
app.get("/product", (req, res) => {
  Cartitem.remove()
    .then((d) => console.log(d))
    .catch((d) => console.log(e));
  Product.find({})
    .then((d) => res.status(200).json(d))
    .catch((e) => res.status(401).json(e));
});

const setjob = (id) => {
  var date = new Date();
  date.setSeconds(date.getSeconds() + 60);
  // console.log(date.getHours())
  var j = schedule.scheduleJob(date, function () {
    User.updateOne({ _id: id }, { forgettoken: "" })
      .then((d) => console.log(d))
      .catch((e) => console.log(e));
  });
};
app.post("/newpass/:token", (req, res) => {
  if (req.params.token) {
    User.findOne({ forgettoken: req.params.token })
      .then((d) => {
        if (d)
          User.updateOne(
            { _id: d._id },
            { forgettoken: "", Password: req.body.Password }
          )
            .then((d) => {
              res.send("password changed");
            })
            .catch((e) => {
              res.send(false);
            });
      })
      .catch((e) => {
        console.log("Value of e", e);
        res.send(false);
      });
  } else {
    res.send("not a valid url ");
  }
});


const validatedata=(req,res,next)=>{
  let userNamepattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/;
  let emailpattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  let passwordpattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (
      userNamepattern.test(req.body.UserName) &&
      emailpattern.test(req.body.Email) &&
      passwordpattern.test(req.body.password)
    )
    {
      next()
    }
    else{
      res.status(401).json("false")
    }



}


app.post("/registration",validatedata, async (req, res) => {
  console.log("value data", req.body);
  let user=await User.findOne({Email:req.body.Email})
  console.log("user",user)
    if(user){
     console.log("exits")
      res.status(200).json({Email:"Email Already exist!"});
    }else{


  let user = new User();
  user.UserName = req.body.UserName;
  user.Email = req.body.Email;
  user.Password = req.body.password;
  await user.generateHashedPassword();
  console.log("before save")
  user.save()
    .then((d) => {
      console.log("data add", d);
      res.status(200).json("True");
    }).catch(e=>console.log("not save",e))}
   
 

 
});

const nodemailer = require("nodemailer");
const Payment = require("./Model/Payment");
const Commit = require("./Model/Commit");

// async..await is not allowed in global scope, must use a wrapper
async function main(link) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    // true for 465, false for other ports
    auth: {
      user: "movie0world@gmail.com", // generated ethereal user
      pass: "toqeerali12", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "movie0world@gmail.com", // sender address
    to: "toqeerhussain1224@gmail.com", // list of receivers
    subject: "Reset Your Password", // Subject line
    text: "Hello world?", // plain text body
    html: `<br>${link}</br>`, // html body
  });
  transporter.sendMail(info, (err, info) => {
    if (err) return err;
    else return info;
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

app.post("/login",async (req, res) => {
  console.log("values", req.body);

  let user = await User.findOne({ Email: req.body.Email });
  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.Password);
  if (!isValid) return   res.status(200).json({invalid:"Invalid Credential"})
  var token = jwt.sign({ id: user._id }, "Tokendetail")
   res.status(200).json({token:token,user:user});
  // User.findOne({ Email: req.body.Email })
  //   .then((d) => {
  //     if(d){
  //     console.log("Data", d);
  //     bcrypt.compare(req.body.password, d.Password).then(d=>{
  //       if(d)
  //       {
  //         var token = jwt.sign({ id: d._id }, "Tokendetail")
  //    }
  //     })
      
  //   }else
  // {
  //   res.status(200).json({invalid:"Invalid Credential"})
  // }}
    
    // )
    // .catch((e) => {
    //   console.log(e);
    //   res.status(401).json("Invalid Credential");
    // });
});
function auth(req, res, next) {
  let token = req.header("Authorization-token");
  console.log("token", token);
  if (token) {
    try {
      let user = jwt.verify(token, "Tokendetail");
      console.log("user", user);
      req.body.Userid = user.id;
      next();
      // res.status(200).json(user);
    } catch (e) {
      res.status(401).json(e);
    }
  } else {
    res.status(401).json("LoginFirst");
  }
}
app.get("/data", auth, (req, res) => {
  res.status(200).send("your data");
});

// app.get('/get',auth,(req,res)=>{

// })
// app.post('/data', (req, res) => {
//    console.log(req.body)
//    MA.push(req.body)

//  res.status(200).json(message)
// })
// app.get('/',(req,res)=>{
//   MA=[]
//   res.send("jjj")
// })

app.get('/Commit',(req,res)=>{

  Commit.find({}).then(
    d=>{
      res.status(200).json(d)
    }
  ).catch(e=>console.log(e))
})

io.on("connection",(socket)=>{
 console.log("connected")
    socket.once("message",(message)=>{
     let msg=new Commit()
     console.log("message",message)
      if(message.user){
       
       msg.User=message.user,
         msg.Message=message.message
       }
       else{
        msg.Message=message.message;
       }
       msg.save().then(d=>{
         io.emit("result",{message})
       }).catch(e=>console.log(e))
          
   
        })
     console.log("user",socket.id)
})

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
