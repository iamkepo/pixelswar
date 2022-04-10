var socket = io();
var game = document.querySelector('.game');
var connecte = new Date();
var user = undefined
socket.emit('connecte', connecte);
socket.on('connecte', (data) => {

  for (let i = 0; i <data.lignes; i++) {
    const tr = document.createElement('tr');
    tr.className = "line"
    game.appendChild(tr);
  }
  var line = document.querySelectorAll('.line');
  for (let j = 0; j < line.length; j++) {
    for (let k = 0; k < data.colonnes; k++) {
      const td = document.createElement('td');
      td.className = "cellule";
      line[j].appendChild(td);
    }
  }
  
  var cellule = document.querySelectorAll('.cellule');
  for (let i = 0; i < cellule.length; i++) {
    if (data.cellules[i] != undefined) {
      cellule[i].textContent = data.cellules[i].value;
      cellule[i].style.backgroundColor = data.cellules[i].history[data.cellules[i].history.length-1].color
    }
    cellule[i].onclick = (event) => {
      if (user) {
        if (data.cellules[i].histoy[data.cellules[i].history.length-1].color != user.nft) {
          var click = {
            index: i, 
            value: parseInt(cellule[i].textContent)+1,
            modif: {nft: user.nft, date: new Date()}
          };
          cellule[i].textContent = click.value;
          cellule[i].style.backgroundColor = user.nft;
          socket.emit('Click', click);
        }
        
      } else {
        page("Login");
        //window.location.assign("http://192.168.100.12:3000/Register_Login")
      }
    }
  }
})
socket.on('Click', (click) => {
  console.log(click);
  var cellule = document.querySelectorAll('.cellule');
  for (let j = 0; j < cellule.length; j++) {
    if (click.index == j) {
      cellule[j].textContent = click.value;
      cellule[j].style.backgroundColor = click.modif.nft
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

var Register = document.querySelector('.register');
var Login = document.querySelector('.login');


window.addEventListener('load',(event)=>{
  page();
  //mode()
})

function page(param) {
  switch (param) {
    case "Register":
      Register.style.display = "flex";
      Login.style.display = "none";
      game.style.display = "none";
      randomColor();
    break;

    case "Login":
      Register.style.display = "none";
      Login.style.display = "flex";
      game.style.display = "none";
    break;
  
    default:
      Login.style.display = "none";
      Register.style.display = "none";
      game.style.display = "table";
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