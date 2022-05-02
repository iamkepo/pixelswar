const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var indexRouter = require('./index');
var setuserRouter = require('./routes/setuser');
var getusersRouter = require('./routes/getusers');
var getuserRouter = require('./routes/getuser');
var getconfigRouter = require('./routes/getconfig');

var connect = require('./db/connect');

//route
app.use('/', indexRouter);
app.use('/setuser', setuserRouter);
app.use('/getusers', getusersRouter);
app.use('/getuser', getuserRouter);
app.use('/getconfig', getconfigRouter);

app.get('/file/:file', (req, res) => {
  res.sendFile(__dirname + '/'+req.params.file);
});

connect.start().then(()=>{
  //connect.insertCellules();
  io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('Color', (data) => {
      var objet = {};
      if (data) {
        objet = list_nft[data];
      } else {
        objet = list_nft_libre[Math.floor( Math.random() * (list_nft_libre.length-0)+0 )];
      }
      console.log(objet);
      listNft();
      listNftLibre();
      socket.emit('Color', objet);
    });
  
    socket.on('Click', (click) => {
      console.log(click);
      connect.updateCellule(click);
      io.emit('Click', click);
    });
    
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    
  });
});


http.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});
