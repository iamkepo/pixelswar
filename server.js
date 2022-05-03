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
var loginRouter = require('./routes/login');
var setuserRouter = require('./routes/setuser');
var getusersRouter = require('./routes/getusers');
var getuserRouter = require('./routes/getuser');
var getconfigRouter = require('./routes/getconfig');
var getrandomcolorRouter = require('./routes/getrandomcolor');
var getcolorRouter = require('./routes/getcolor');

var connect = require('./db/connect');

//route
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/setuser', setuserRouter);
app.use('/getusers', getusersRouter);
app.use('/getuser', getuserRouter);
app.use('/getconfig', getconfigRouter);
app.use('/getrandomcolor', getrandomcolorRouter);
app.use('/getcolor', getcolorRouter);

app.get('/file/:file', (req, res) => {
  res.sendFile(__dirname + '/'+req.params.file);
});


connect.start().then(()=>{
  //connect.insertColors();
  //connect.insertCellules();
  io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('Click', (click) => {
      //console.log(click);
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
