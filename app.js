var socket = io();
const baseURL = "http://192.168.9.122:3000";
var game = document.querySelector('.game');
var table = document.querySelector('table');
var user = {
  _id: "user",
  color: "rgb(255,0,0)"
};
var cellules = [];
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
  cellules = response.data.cellules;
  var cellule = document.querySelectorAll('.cellule');
  for (let i = 0; i < cellule.length; i++) {
    cellule[i].style.backgroundColor = cellules[i].color

    cellule[i].onclick = (event) => {
      if (user._id) {
        if (cellules[i].color != user.color) {
          var click = {
            _id: cellules[i]._id,
            index: i, 
            color: user.color
          };
          console.log(click);
          socket.emit('Click', click);
        }
        
      } else {
        page("Login");
      }
    }
  }
})

window.addEventListener('load',(event)=>{
  page();
  //mode()
})

socket.on('Click', (click) => {
  console.log(click);
  var cellule = document.querySelectorAll('.cellule');
  for (let j = 0; j < cellule.length; j++) {
    if (click.index == j) {
      cellule[j].style.backgroundColor = click.color
    }
  }
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
    break;
  }
}

function register() {
  if (psoeudo.value  && email.value  && password.value ) {
    if (password.value == passwordconfirm.value ) {
      var data = {
        ...user,
        psoeudo: psoeudo.value,
        email: email.value,
        password: password.value,
      };

      socket.emit('Register', data);
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

    socket.emit('Login', data);
  } else {
    alert("il faut remplir tous les champs")
  }
}

function randomColor() {
  socket.emit('Color');
}

socket.on('Color', (objet) => {
  console.log(objet);
  user = {
    ...user,
    nft: objet.index
  }
  color.style.backgroundColor= objet.nft;
  choix.style.backgroundColor= objet.nft
  colorname.textContent = objet.nft;
})

socket.on('Register', (response) => {
  console.log(response);
  alert(response.message);
  if (response.message == "regist sucess") {
    page("Login");
    mail.value= email.value;
    pass.value= password.value;
  }
})

socket.on('Login', (response) => {
  console.log(response);
  alert(response.message);
  if (response.message == "log sucess") {
    page("");
    user = response.user
  }
})
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