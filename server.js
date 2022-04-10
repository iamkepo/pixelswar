const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { MongoClient } = require("mongodb");
const uri = `mongodb://localhost:27017`;
const client = new MongoClient(uri);

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
var db = null;
var users = [];
var cellules = [];
var nfts = [];
var list_user = [];
var list_cellule = [];
var list_nft = [];
var list_nft_libre = [];

const infos = {
  width: 2300,
  height: 1150,
  colonnes: 300,
  lignes: 150,
};

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
});
app.get('/app.js', (req, res) => {
  res.sendFile(__dirname + '/app.js');
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function users_trie(name, item){
  for (let i = 0; i < list_user.length; i++) {
    if (list_user[i][name] == item) {
      return name != "color" ? i : true;
    }
  }
  return false;
}

function addPlat(array, element){
  var tab = [ element ];
  tab = tab.concat( array.map( item => item ) );
  //console.log(tab);
  return tab;
}

//cellules
async function insertCellule(params) {
  var date = new Date().getTime();
  var index = 0;
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 200; j++) {
      var cellule = {
        index: index,
        y: i,
        x: j,
        etat: true,
        compteur: 0,
        value: 1,
        history: [{date: date, color:"rgb(0,0,0)"}],
      };
      await cellules.insertOne(cellule);
      index = index+1;
    }
  }
    
  // await cellules.insertOne(params).then(()=>{
  //   listCellule();
  // });
}
async function updateCellule(params) {
  var objet = {
    "index": params.index,
    "value": params.value,
    "history": list_cellule[params.index].history
  };
  var find = { "index": params.index };
  await cellules.updateOne(
    find,
    {$set: objet}
  ).then(()=>{
    listCellule();
  });
}
async function deleteCellule(params) {
  var find = { "ide": params.ide };
  fs.unlink(params.photo, (err) => {
    if (err) {
      console.error(err)
    }
  });
  await cellules.deleteOne(find).then(()=>{
    listCellule();
  });
}
async function listCellule() {
  var cursor = await cellules.find({});
  list_cellule = [];
  for await (const d of cursor) {
    list_cellule = list_cellule.concat(d)
  }
  console.log(list_cellule.length);
}

//users
async function insertUser(params) {
  await users.insertOne(params).then(()=>{
    listUser();
  });
}
async function listUser() {
  var cursor = users.find({});
  list_user = [];
  for await (const d of cursor) {
    list_user = list_user.concat(d)
  }
}

//nfts
async function insertNft() {
  var index = 0;
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 20; j++) {
      for (let k = 0; k < 10; k++) {
        var objet = {
          index: index,
          etat: false,
          value: 1,
          nft: "rgb("+i+","+j+","+k+")",
        };
        console.log(objet.nft);
        await nfts.insertOne(objet);
        index = index+1;
      }
    }
  }
}
async function updateNft(params) {
  var find = { "nft": params.nft };
  await nfts.updateOne(
    find,
    {$set: params}
  ).then(()=>{
    listNft();
    listNftLibre()
  });
}
async function listNft() {
  var cursor = nfts.find({});
  list_nft = [];
  for await (const d of cursor) {
    list_nft = list_nft.concat(d)
  }
  console.log(list_nft.length);
}
async function listNftLibre() {
  var cursor = nfts.find({});
  list_nft_libre = [];
  for await (const d of cursor) {
    if (d.etat == false) {
      list_nft_libre = list_nft_libre.concat(d)
    }
  }
  console.log(list_nft_libre.length);
}

async function run() {
  try {
    client.connect();
    console.log("Connected successfully to server");
    db = client.db('truf')
    nfts = db.collection('nfts');
    cellules = db.collection('cellules');
    users = db.collection('users');
    //insertCellule();
    //listNft();
    //insertNft()
  } catch {
    await client.close();
  }
}
run().then(()=>{
  io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('connecte', (connecte) => {
      console.log(connecte);
      listCellule();
      listNft();
      listNftLibre();
      socket.emit('connecte', list_cellule);
    });

    socket.on('Login', (user_send) => {
      console.log(user_send);
      var response = {message: ""};
      var find = users_trie("email", user_send.email);
      if (find) {
        if (list_user[find].password == user_send.password) {
          response.message = "log sucess";
          response.user = list_user[find];
        }else{
          response.message = "sucess error";
        }
      }else{
        response.message = "not find";
      }
      socket.emit('Login', response);
    });

    socket.on('Register', (data) => {
      console.log(data.user);
      var response = {message: ""};
      var find = users_trie("email", data.user.email);
      if (find) {
        response.message = "email déjà utilisé";
      }else{
        var objet = {
          ...data.nft,
          etat: !data.nft.etat,
        };
        var user = {
          ...data.user,
          nft: data.nft.nft
        };
        insertUser(user);
        updateNft(objet)
        response.message = "regist sucess";
      }
      socket.emit('Register', response);
    });
    
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
      list_cellule[click.index] = {
        index: click.index,
        value: click.value,
        history: list_cellule[click.index].history.concat(click.modif)
      };
      updateCellule(click);
      socket.broadcast.emit('Click', click);
    });
    

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    
  });
}).catch(console.dir);

http.listen(3000, () => {
  console.log('listening on *:3000');
});
