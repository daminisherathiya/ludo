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

function token_will_be_moved(randomDice, item) {
  var cid = item.parentNode.getAttribute("id");
  var n = parseInt(cid.substring(3)) + randomDice;
  // console.log("n="+n);
  if (n < 19) {
    return true;
  }
  return false;
}

function rollDice(event) {
  randomDice = Math.floor(6 * Math.random()) + 1;
  // randomDice = 1;
  dic[i].src = "./dices/green/" + randomDice + ".png";
  dic[i].removeEventListener("click", rollDice);
  var allowed_to_move_token = true;

  if (randomDice == 6) {
    toc1 = document.querySelectorAll(".circle .tokens_of_" + i);
    toc1.forEach(function (item) {
      item.addEventListener("click", six_token);
    });
    if (toc1.length != 0) {
      // console.log(toc1);
      setTimeout(function () {
        if (toc1.length > 0) {
          allowed_to_move_token = false;
          toc1[0].click();
        }
      },0);
    }
  }
  // console.log(toc1);
  toc2 = document.querySelectorAll("td .tokens_of_" + i + ".outside");
  toc2.forEach(function (item) {
    item.addEventListener("click", move_token);
  });
  if (toc2.length != 0) {
    // console.log(toc2);
    setTimeout(function () {
      if (allowed_to_move_token && toc2.length > 0) {
        allowed_to_move_token = !token_will_be_moved(randomDice, toc2[0]);
        toc2[0].click();
      }
      if (allowed_to_move_token && toc2.length > 1) {
        allowed_to_move_token = !token_will_be_moved(randomDice, toc2[1]);
        toc2[1].click();
      }
      if (allowed_to_move_token && toc2.length > 2) {
        allowed_to_move_token = !token_will_be_moved(randomDice, toc2[2]);
        toc2[2].click();
      }
      if (allowed_to_move_token && toc2.length > 3) {
        allowed_to_move_token = !token_will_be_moved(randomDice, toc2[3]);
        toc2[3].click();
      }
    }, 0);
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
    setTimeout(enableDice, 0, i);
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
var again=false;
function run_token(num, count, alt) {
  console.log(num);
  var p_total_token = document.querySelectorAll("#" + num + " img");
  var p_total_token_length = p_total_token.length;
  var safe = document.querySelector("#" + num + ".safe img");
  again=false;
  console.log("safe=" + safe);
  if (safe == null && p_total_token_length > 0) {
    p_total_token.forEach(function (item) {
      var alt_name = item.getAttribute("alt");
      if (alt.substring(2, 3) != alt_name.substring(2, 3)) {
        again=true;
        // console.log("alt_name=" + alt_name);
        // console.log(alt.substring(2, 3));
        // console.log(alt_name.substring(2, 3));
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

  var a_total_token = document.querySelectorAll("#" + num + " img");
  a_total_token_length = a_total_token.length;
  // console.log("ddd "+i+" "+p_toc+" "+count);

  if (count != 18) {
    img.classList.add("tokens_of_" + i);
  } else if (
    count == 18 &&
    document.getElementsByClassName("tokens_of_" + i).length == 0
  ) {
    var winner_img = document.createElement("img");
    winner_img.src = "./winner/" + rank + ".png";
    var winner_src = document.getElementById("winner_"+i);
    winner_src.appendChild(winner_img);
    winner_img.classList.add("winner");

    rank++;
    if (rank == 4) {
      game_over = true;
    }
  }
  img.classList.add("outside");
  if (a_total_token_length == 1) {
    if(count==18){
      img.classList.add("token_svg_"+i)
    }else{
      img.classList.add("token");
    }
  }else {
    a_total_token.forEach(function (item) {
      item.classList.add("tokens");
    });
  }
  if(count==18 && p_total_token_length==1){
    p_total_token[0].classList.remove("token_svg_"+i);
  }
  for(var k=p_total_token_length;k>1;k--){
    document.getElementById(num).classList.remove("token"+k);
  }
  for(var k=0;a_total_token_length>1 && k<a_total_token_length;k++){
    a_total_token[k].classList.remove("token");
  }
  if(a_total_token_length>1 && count!=18){
  document.getElementById(num).classList.add("token" + a_total_token_length);
  }
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
  var previously_total_token=document.querySelectorAll("#"+current_id+ " img");
  var alt = event_inn.target.getAttribute("alt");
  event_inn.target.remove(event_inn.target);
  // console.log(i + " " + p_toc + " " + count);
  var num = "d_" + p_toc + count;
  // console.log(current_id.substring(2,3));
  // console.log("num="+num);
  if (count == 18) {
    num = "svg_"+i;
  }
  run_token(num, count, alt);
  remove_EventListener();
  var after_run_total_tokens = document.querySelectorAll(
    "#" + current_id + " img"
  );
  // console.log(after_run_total_tokens.length)

    document.getElementById(current_id).classList.remove("token"+previously_total_token.length);
  if (after_run_total_tokens.length == 1) {
    after_run_total_tokens[0].classList.remove("tokens");
    after_run_total_tokens[0].classList.add("token");
  }
  if(after_run_total_tokens.length>1){
    document
    .getElementById(current_id)
    .classList.add("token" + after_run_total_tokens.length);
  }

  // if (p_toc == i && count == 18) {
  //   document.getElementById("ddd").classList.remove("tokens_of_" + i);
  // }
  toc1 = [];
  // var ss=num.substring(0,3);
  if(randomDice!=6 && count!=18 && again==false){
    i++;
  }
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
  if(randomDice!=6)
  {
    i++;
  }
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
  if (game_over) {
    return;
  }
  var available = document.getElementsByClassName("tokens_of_" + i);
  if (available.length == 0) {
    i = (i + 1) % 4;
    enableDice(i);
  } else {
    dic[i].addEventListener("click", rollDice);
    dic[i].click();
  }
}
