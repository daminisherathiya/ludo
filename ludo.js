var dic = [
  document.getElementById("dice-0"),
  document.getElementById("dice-1"),
  document.getElementById("dice-2"),
  document.getElementById("dice-3"),
];
var i = 0;
var rank = 1;
var game_over = false;
var randomDice = Math.floor(6 * Math.random()) + 1;
dic[i].src = "./dices/green/" + randomDice + ".png";
var toc1 = [];
var toc2 = [];
enableDice(0);

function rollDice(event) {
  randomDice = Math.floor(6 * Math.random()) + 1;
  // randomDice = 1;
  dic[i].src = "./dices/green/" + randomDice + ".png";
  dic[i].removeEventListener("click", rollDice);

  if (randomDice == 6) {
    toc1 = document.querySelectorAll(".circle .tokens_of_" + i);
    toc1.forEach(function (item) {
      item.addEventListener("click", six_token);
    });
    if (toc1.length != 0) {
      console.log(toc1);
      setTimeout(function () {
        if (toc1.length > 0) {
          toc1[0].click();
        }
        if (toc1.length > 1) {
          toc1[1].click();
        }
        if (toc1.length > 2) {
          toc1[2].click();
        }
        if (toc1.length > 3) {
          toc1[3].click();
        }
      }, 1000);
    }
  }
  // console.log(toc1);
  toc2 = document.querySelectorAll("td .tokens_of_" + i + ".outside");
  toc2.forEach(function (item) {
    item.addEventListener("click", move_token);
  });
  if (toc2.length != 0) {
    console.log(toc2);
    setTimeout(function () {
      if (toc2.length > 0) {
        toc2[0].click();
      }
      if (toc2.length > 1) {
        toc2[1].click();
      }
      if (toc2.length > 2) {
        toc2[2].click();
      }
      if (toc2.length > 3) {
        toc2[3].click();
      }
    }, 1000);
    // toc2[0].click();
  }

  var vis = false;
  toc2.forEach(function (item) {
    var cid = item.parentNode.getAttribute("id");
    var n = parseInt(cid.substring(3)) + randomDice;
    // console.log("n="+n);
    if (n < 19) {
      vis = true;
    } else {
      item.removeEventListener("click", move_token);
    }
  });
  if (
    (randomDice == 6 && toc1.length == 0 && vis == false) ||
    (randomDice != 6 && vis == false)
  ) {
    i++;
    if (i >= 4) i = 0;
    dic[i].src = "./dices/green/" + randomDice + ".png";
    setTimeout(enableDice, 500, i);
    // enableDice(i);
  }
  // console.log(toc2.length);

  // if (
  //   randomDice == 6 && toc2.length == 1 &&
  //   parseInt(toc2[0].parentNode.getAttribute("id").substring(3)) + randomDice >
  //     18 &&
  //   toc1.length == 0
  // ) {
  //   i++;
  //   if (i >= 4) i = 0;
  //   dic[i].src = "./dices/green/" + randomDice + ".png";
  //   setTimeout(enableDice, 100, i);
  // }

  // console.log(toc1.length + " " + toc2.length);
  // if (!toc1.length && !toc2.length) {
  //   i++;
  //   if (i >= 4) i = 0;
  //   dic[i].src = "./dices/green/" + randomDice + ".png";
  //   setTimeout(enableDice, 100, i);
  //   // enableDice(i);
  // }
}

function run_token(num, count, alt) {
  var total_token = document.querySelectorAll("#" + num + " img");
  var total_token_length = total_token.length;
  var safe = document.querySelector("#" + num + ".safe img");
  console.log("safe=" + safe);
  if (safe == null && total_token_length > 0) {
    total_token.forEach(function (item) {
      var alt_name = item.getAttribute("alt");
      if (alt.substring(2, 3) != alt_name.substring(2, 3)) {
        console.log("alt_name=" + alt_name);
        console.log(alt.substring(2, 3));
        console.log(alt_name.substring(2, 3));
        var s = item.getAttribute("src");
        var n = s.substring(9, 10);
        var img = document.createElement("img");
        img.src = s;
        img.alt = alt_name;
        item.remove(item);
        var src = document.getElementById(alt_name);
        src.appendChild(img);
        img.classList.add("token");
        img.classList.add("tokens_of_" + n);
      }
    });
  }

  var img = document.createElement("img");
  img.src = "./tokens/" + i + ".png";
  // console.log("alt="+alt);
  img.alt = alt;
  var src = document.getElementById(num);
  // console.log(num);
  src.appendChild(img);

  total_token = document.querySelectorAll("#" + num + " img");
  total_token_length = total_token.length;
  // console.log("ddd "+i+" "+p_toc+" "+count);

  if (count != 18) {
    img.classList.add("tokens_of_" + i);
  } else if (
    count == 18 &&
    document.getElementsByClassName("tokens_of_" + i).length == 0
  ) {
    alert("your rank is " + rank + "st");
    rank++;
    if (rank == 4) {
      alert("Game Is Over Now");
      game_over = true;
    }
  }
  img.classList.add("outside");
  if (total_token_length == 1) {
    img.classList.add("token");
  } else {
    total_token.forEach(function (item) {
      item.classList.add("tokens");
    });
  }
  document.getElementById(num).classList.add("token" + total_token_length);
}

function move_token(event_inn) {
  var current_id = event_inn.target.parentNode.getAttribute("id");
  // console.log("c_id " + current_id);
  // event_inn.target.remove(event_inn.target);
  // var temp=parseInt(current_id.substring(2))+randomDice;
  var count = parseInt(current_id.substring(3)) + randomDice;
  var p_toc = parseInt(current_id.substring(2, 3));
  // console.log(count);
  if (count == 12) {
    var temp_p_toc = (p_toc + 1) % 4;
    if (temp_p_toc == i) {
      count = count + 1;
      p_toc = temp_p_toc;
    }
  } else if (count > 12) {
    var temp_count = count;
    count = count - 13;
    if (current_id.substring(3) < 13) {
      p_toc = (p_toc + 1) % 4;
    } else {
      temp_count--;
    }
    if (p_toc == i) {
      count = temp_count + 1;
    }
    // if (p_toc == i && count > 18) {

    //   event_inn.target.removeEventListener("click", move_token);
    // toc2.forEach(function (item) {
    //   var cid = item.parentNode.getAttribute("id");
    //   var n = cid.substring(3) + randomDice;
    //   if (n < 19) {
    //     vis = true;
    //   }
    // });
    // if (vis == false) {
    //   i++;
    //   if (i >= 4) i = 0;
    //   dic[i].src = "./dices/green/" + randomDice + ".png";
    //   //   setTimeout(enableDice, 1000, i);
    //   enableDice(i);
    //   return;
    // }
  }
  var alt = event_inn.target.getAttribute("alt");
  event_inn.target.remove(event_inn.target);
  // console.log(i + " " + p_toc + " " + count);
  var num = "d_" + p_toc + count;
  // console.log(current_id.substring(2,3));
  // console.log("num="+num);
  if (count == 18) {
    num = "ddd";
  }
  run_token(num, count, alt);
  remove_EventListener();
  var after_run_total_tokens = document.querySelectorAll(
    "#" + current_id + " img"
  );

  if (after_run_total_tokens.length == 1) {
    after_run_total_tokens[0].classList.remove("tokens");
    after_run_total_tokens[0].classList.add("token");
  }
  document
    .getElementById(current_id)
    .classList.add("token" + after_run_total_tokens.length);

  // if (p_toc == i && count == 18) {
  //   document.getElementById("ddd").classList.remove("tokens_of_" + i);
  // }
  toc1 = [];
  i++;
  if (i >= 4) i = 0;
  dic[i].src = "./dices/green/" + randomDice + ".png";
  //   setTimeout(enableDice, 1000, i);
  enableDice(i);
}

function remove_EventListener() {
  toc1.forEach(function (items) {
    // console.log("remove "+items);
    items.removeEventListener("click", six_token);
  });
  toc2.forEach(function (items) {
    items.removeEventListener("click", move_token);
  });
}

function six_token(event_inn) {
  var alt = event_inn.target.getAttribute("alt");
  event_inn.target.remove(event_inn.target);
  var num = "d_" + i.toString() + "0";
  run_token(num, 0, alt);
  // console.log(document.getElementById(num).src);

  // document.getElementById(num).src = "./tokens/"+i+".png";
  // console.log("hell"+toc1.length);
  remove_EventListener();
  toc1 = [];
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
  var available = document.getElementsByClassName("tokens_of_" + i);
  if (game_over) {
    return;
  }
  if (available.length == 0) {
    i = (i + 1) % 4;
    enableDice(i);
  } else {
    dic[i].addEventListener("click", rollDice);
    dic[i].click();
  }
}
