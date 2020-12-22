var jwt = require("jsonwebtoken");
const cryptoRandomString = require("crypto-random-string");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { User } = require("./Model/User");
const  {Product}  = require("./Model/Product");
const { Cartitem } = require("./Model/Cart");
const { Cart } = require("./Model/Cart");
const { UserValidation } = require("./Middleware/validation");
const bodyParser = require("body-parser");
var schedule = require("node-schedule");
var express = require("express");
var app = express();
var http = require("http").createServer(app);
// var io = require("socket.io")(http, {
//   cors: {
//     origin: "*",
//   },
// });

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

const port = 5000;
let MA = [];

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
          main(`http://localhost:3000/newpass/${d.forgettoken}`)
            .then((d) => {
              console.log("Email return", d);
              res.status(200).json(true);
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => {
      console.log(e);
      res.status(200).json(false);
    });
});

app.post("/Cart",auth, async (req, res) => {
  let sum = 0;
  let itemcart = await Cartitem.find({});
  // console.log(data)
  let cart = new Cart({
    UserId: req.body.user,
  });
  itemcart.map((item) => {
    console.log("developd", item);
    sum = sum + item.price * item.quantity;
    cart.product.push({
      product: item.product,
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

app.post("/image/upload",(req,res,next)=>{image=[];next()}, upload.array("image", 4), (req, res, next) => {
  let pro = new Product(({} = req.body));
   image.map(img=>pro.Image.push({imgkey:img}))
  pro
    .save()
    .then((d) => res.status(201).json(d))
    .catch((e) => res.status(401).json(e));
});

// app.get("/product", (req, res) => {
//  Product.find({}).then(d=>{console.log(d)
// res.status(201).json(d);}).catch(e=>{console.log(e);res.status(401).json(e)})
  
// });

app.post("/cartitem", (req, res) => {
  console.log("from client", req.body);
  if (req.body.update) {
    Cartitem.findOneAndUpdate(
      { product: req.body.product },
      { quantity: req.body.quantity },
      (err, update) => {
        if (err) console.log(err);
        console.log(update);
        res.status(200).json(update);
      }
    );
  } else {
    let item = new Cartitem({
      product: req.body.product,
      quantity: req.body.quantity,
      price: req.body.price,
    });
    item
      .save()
      .then((d) => res.status(200).json(d))
      .catch((e) => res.status(401).json(e));
  }
});


app.get('/detail/:productid',(req, res) => {
  console.log(req.params)
  if(req.params.productid){
    Product.findOne({_id:req.params.productid})
    .then((d) => res.status(200).json(d))
    .catch((e) => res.status(401).json(e));
 }


})
app.get("/product/", (req, res) => {

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

app.post("/registration", (req, res) => {
  console.log("value data", req.body);
  let newuser = new User({
    Email: req.body.Email,
    UserName: req.body.UserName,
    Password: req.body.Password,
  });
  newuser
    .save()
    .then((d) => {
      console.log("data add", d);
      res.status(200).json("True");
    })
    .catch((e) => res.status(200).json("false"));
});
const nodemailer = require("nodemailer");

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

app.post("/login", (req, res) => {
  console.log("values", req.body);
  User.findOne({ Email: req.body.Email, Password: req.body.password })
    .then((d) => {
      console.log("Data", d);
      var token = jwt.sign({ id: d._id }, "Tokendetail");
      res.status(200).json(d.UserName);
    })
    .catch((e) => {
      console.log(e);
      res.status(401).json("Invalid credential");
    });
});
function auth(req, res, next) {
  let token = req.header("Authorization-token");
  console.log("token", token);
  if (token) {
    try {
      let user = jwt.verify(token, "Tokendetail");
      console.log("user", user);
      res.status(200).json(user);
    } catch (e) {
      res.status(401).json(e);
    }
  } else {
    res.status(401).json(e);
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

// io.on("connection",(socket)=>{
//     socket.on("message",(message)=>{
//         MA.push(message)
//         console.log(message)
//     io.emit("message",{message})
//         })
//      console.log("user",socket.id)
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
