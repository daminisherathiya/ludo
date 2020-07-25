var dic = [
  document.getElementById("dice-0"),
  document.getElementById("dice-1"),
  document.getElementById("dice-2"),
  document.getElementById("dice-3"),
];
var i = 0;
var randomDice = Math.floor(6 * Math.random()) + 1;
dic[i].src = "./dices/green/" + randomDice + ".png";
enableDice(0);
var toc;

function rollDice(event) {
  // var randomDice = Math.floor(6*Math.random())+1;
  randomDice = 6;
  dic[i].src = "./dices/green/" + randomDice + ".png";

  if (randomDice == 6) {
    toc = document.querySelectorAll(".circle .tokens_of_" + i);
    toc.forEach(function (item) {
      item.addEventListener("click", six_token);
    });
  }
  // toc=document.querySelectorAll("td .tokens_of_"+i);
  // console.log(toc.length);
}

function six_token(event_inn) {
  event_inn.target.remove(event_inn.target);
  var num = "d_" + i.toString() + "0";
  // console.log(document.getElementById(num).src);
  var img = document.createElement("img");
  img.src = "./tokens/" + i + ".png";
  var src = document.getElementById(num);
  src.appendChild(img);

  var total_token = document.querySelectorAll("#" + num + " img");
  var total_token_length = total_token.length;
  img.classList.add("tokens_of_"+i);
  if (total_token_length == 1) {
    img.classList.add("token");
  } else {
    total_token.forEach(function (item) {
      item.classList.add("tokens");
    });
  }
  document.getElementById(num).classList.add("token" + total_token_length);
  // document.getElementById(num).src = "./tokens/"+i+".png";
  toc.forEach(function (items) {
    items.removeEventListener("click", six_token);
  });
  i++;
  if (i >= 4) i = 0;
  dic[i].src = "./dices/green/" + randomDice + ".png";
  //   setTimeout(enableDice, 1000, i);
  enableDice(i);
}

function enableDice(i) {
  dic[i].style.display = "block";
  dic[(i + 1) % 4].style.display = "none";
  dic[(i + 2) % 4].style.display = "none";
  dic[(i + 3) % 4].style.display = "none";
  dic[i].addEventListener("click", rollDice);
}
