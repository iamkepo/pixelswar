const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb://localhost:27017`;
const clusterUrl = process.env.MONGODB_URL || uri;
const client = new MongoClient(clusterUrl, { useNewUrlParser: true, useUnifiedTopology: true });

//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const config = {
  width: 1400,
  height: 600,
  colonnes: 100,
  lignes: 50,
};
async function run() {

  try{

    await client.connect();

    console.log("Connected successfully to server");

  } catch (error) {

    console.log(error);

    await client.close();

  }
}
//cellules
async function insertCellules() {
  var index = 0;
  for (let i = 0; i < config.lignes; i++) {
    for (let j = 0; j < config.colonnes; j++) {
      var cellule = { 
        index : index,
        color:"rgb(0,0,0)",
      };
      await client.db('truf').collection('cellules').insertOne(cellule);
      cellule.date = new Date().getTime();
      await client.db('truf').collection('history').insertOne(cellule)
      console.log(index);
      index = index+1;
    }
  }
}
async function updateCellule(param) {
  await client.db('truf').collection('cellules').updateOne(
    {_id: ObjectId(param._id)},
    { $set: { color: param.color } }
  ).then(()=>{
    for (const key in param) {
      if (key == "_id") {
        param["date"] = new Date().getTime();
      }
    }
    insertHistory(param)
  });
}


//nfts
async function insertColors() {
  var index = 0;
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 20; j++) {
      for (let k = 0; k < 10; k++) {
        var objet = {
          index: index,
          etat: false,
          value: 1,
          nft: "rgb("+i+","+j+","+k+")",
        };
        console.log(objet.nft);
        await client.db('truf').collection('colors').insertOne(objet);
        index = index+1;
      }
    }
  }
}
//history
async function insertHistory(param) {
  await client.db('truf').collection('history').insertOne(param).then((response)=>{
    console.log(response);
  });
}
module.exports = {
  start : run,
  insertCellules: insertCellules,
  insertColors: insertColors,
  updateCellule: updateCellule,
  config: config,
  collection: {
    users: client.db('truf').collection('users'),
    cellules : client.db('truf').collection('cellules'),
    colors : client.db('truf').collection('colors'),
    history : client.db('truf').collection('history')
  }
};