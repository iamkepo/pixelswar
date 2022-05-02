var express = require('express');
var router = express.Router();
const fs = require('fs');
const { ObjectId } = require('mongodb');
var connect = require('../db/connect');

router.post('/', async (req, res) => {
  //console.log(req.body);
  var objet = { 
    ...req.body,
    solde: 0.00001067001,
    date: new Date().getTime()
  };

  connect.collection.users
  .insertOne(objet).then((response)=>{
    res.json(response);
  });
});

module.exports = router;