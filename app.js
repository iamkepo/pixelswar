var socket = io();
const baseURL = "https://pixel-war.herokuapp.com";
var game = document.querySelector('.game');
var table = document.querySelector('table');
var user = {};
var _color = undefined;
var tampon = undefined;

axios({
  method: 'get',
  url: baseURL+"/getconfig",
}).then((response)=>{
  //console.log(response);
  table.style.width = response.data.width+"px";
  table.style.height = response.data.height+"px";
  for (let i = 0; i <response.data.lignes; i++) {
    const tr = document.createElement('tr');
    tr.className = "line"
    table.appendChild(tr);
  }
  var line = document.querySelectorAll('.line');
  for (let j = 0; j < line.length; j++) {
    for (let k = 0; k < response.data.colonnes; k++) {
      const td = document.createElement('td');
      td.className = "cellule";
      line[j].appendChild(td);
    }
  }
  game.style.display = "flex";
  var cellule = document.querySelectorAll('.cellule');
  for (let i = 0; i < cellule.length; i++) {
    cellule[i].style.backgroundColor = response.data.cellules[i].color;

    cellule[i].onclick = (event) => {
      if (_color != undefined) {
        var click = {
          _id: response.data.cellules[i]._id,
          index: i, 
          color: _color
        };
        backgroundColor(click)
      } else {
        page("Login");
      }
    }
  }
})

socket.on('Click', (click) => {
  //console.log(click);
  var cellule = document.querySelectorAll('.cellule');
  for (let j = 0; j < cellule.length; j++) {
    if (click.index == j) {
      cellule[j].style.backgroundColor = click.color
    }
  }
})

window.addEventListener('load',(event)=>{
  page();
  //mode()
})


var color = document.querySelector('.color');
var choix = document.querySelector('.choix');

var colorname = document.querySelector('.color-name');
var psoeudo = document.querySelector('.psoeudo');
var email = document.querySelector('.email');
var password = document.querySelector('.password');
var mail = document.querySelector('.mail');
var pass = document.querySelector('.pass');
var passwordconfirm = document.querySelector('.passwordconfirm');

var reg = document.querySelector('.register');
var log = document.querySelector('.login');

function page(param) {
  switch (param) {
    case "Register":
      reg.style.display = "flex";
      log.style.display = "none";
      game.style.display = "none";
      randomColor();
    break;

    case "Login":
      reg.style.display = "none";
      log.style.display = "flex";
      game.style.display = "none";
    break;
  
    default:
      log.style.display = "none";
      reg.style.display = "none";
      game.style.display = "flex";
      var _id = localStorage.getItem("pixelwaruserid");
      console.log(_id);
      if (_id != null) {
        axios({
          method: 'get',
          url: baseURL+"/getuser/"+_id,
        }).then((response)=>{
          user = response.data;
          getcolor(response.data.palette[0]);
        })
        
      }
    break;
  }
}

function register() {
  if (psoeudo.value  && email.value  && password.value ) {
    if (password.value == passwordconfirm.value ) {
      var data = {
        psoeudo: psoeudo.value,
        email: email.value,
        password: password.value,
        color: tampon
      };
      axios({
        method: 'post',
        url: baseURL+"/setuser",
        data: data
      }).then((response)=>{
        //console.log(response);
        if (response.data.message) {
          alert(response.data.message)
        } else {
          localStorage.setItem("pixelwaruserid", response.data.insertedId);
          window.location.assign(baseURL);
        }
      })
    } else {
      alert("mot de passe non confimer")
    }
  } else {
    alert("il faut remplir tous les champs")
  }
}

function login() {
  if (mail.value != "" && pass.value != "") {
    var data = {
      email: mail.value,
      password: pass.value,
    };
    axios({
      method: 'post',
      url: baseURL+"/login",
      data: data
    }).then((response)=>{
      //console.log(response);
      if (response.data.message) {
        alert(response.data.message)
      } else {
        localStorage.setItem("pixelwaruserid", response.data._id);
        window.location.assign(baseURL);
      }
    })
  } else {
    alert("il faut remplir tous les champs")
  }
}

function randomColor() {
  axios({
    method: 'get',
    url: baseURL+"/getrandomcolor",
  }).then((response)=>{
    //console.log(response);
    tampon = response.data._id;
    color.style.backgroundColor= response.data.color;
    choix.style.backgroundColor= response.data.color;
    colorname.textContent = response.data.color;
  })
}

function mode() {
  var mode = document.querySelector(".mode-btn");
  var body = document.querySelector("body");
  var table = document.querySelector('table');
  var td = document.querySelectorAll('td');

  if (mode.textContent == "Light") {
    body.style.backgroundColor= "rgb(255,255,255)";
    table.style.border= "2px solid #000000";
    td.style.border= "2px solid #000000";
    mode.textContent = "Dark";
    mode.style.backgroundColor= "rgb(0,0,0)";
    mode.style.color= "rgb(255,255,255)";
  } else {
    body.style.backgroundColor= "rgb(0,0,0)";
    table.style.border= "0.01px solid #FFFFFF22";
    td.style.border= "0.01px solid #FFFFFF22";
    mode.textContent = "Light";
    mode.style.backgroundColor= "rgb(255,255,255)";
    mode.style.color= "rgb(0,0,0)";
  }
  
}

function getcolor(param) {
  axios({
    method: 'get',
    url: baseURL+"/getcolor/"+param,
  }).then((response)=>{
    _color = response.data
  })
}

function backgroundColor(click) {
  var cellule = document.querySelectorAll('.cellule');
  for (let i = 0; i < cellule.length; i++) {
    if (click.index == i) {
      console.log(cellule[i].style.backgroundColor.replaceAll(" ", "") != _color);
      if (cellule[i].style.backgroundColor.replaceAll(" ", "") != _color) {
        //console.log(click);
        socket.emit('Click', click);
      }
    }
  }
}