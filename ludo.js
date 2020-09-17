var dic = [
  document.getElementById("dice-0"),
  document.getElementById("dice-1"),
  document.getElementById("dice-2"),
  document.getElementById("dice-3"),
];

// var no_of_dice_rolls = 0;
var i = 0;
var total_players = 4;
var rank = 1;
var left=false;
var winner_src="./winner/";
var token_src="./tokens/";
var left_src="./left/";
var green_dot = 1;
var yellow_dot = 1;
var blue_dot = 1;
var red_dot = 1;
var game_over = false;
var automatic = false;
var again = false;
var randomDice = Math.floor(6 * Math.random()) + 1;
dic[i].src = "./dices/green/" + randomDice + ".png";
var vis = false;
var toc1 = [];
var toc2 = [];
var timeouts = [];
var allowed_to_move_token = true;
console.log("enable for starting");
enableDice();

function token_will_be_moved(randomDice, item) {
  var cid = item.parentNode.getAttribute("id");
  var n = parseInt(cid.substring(3)) + randomDice;
  if (n < 19) {
    return true;
  }
  return false;
}
function rollDice() {
  // console.log("no_of_dice_rolls="+no_of_dice_rolls)
  allowed_to_move_token = true;
  console.log("i=" + i);
  dic[i].removeEventListener("click", rollDice);
  randomDice = Math.floor(6 * Math.random()) + 1;
  // randomDice = 6;
  console.log("randmdices=" + randomDice);
  dic[i].src = "./dices/green/" + randomDice + ".png";
  // var allowed_to_move_token = true;




  toc1 = [];
  if (randomDice == 6) {
    console.log("six");
    toc1 = document.querySelectorAll(".circle .tokens_of_" + i);
    toc1.forEach(function (item) {
      item.addEventListener("click", six_token);
    });
    console.log(toc1);
    // if (toc1.length != 0) {
    //   setTimeout(function () {
    //     console.log("toccc1")
    //       allowed_to_move_token = false;
    //       console.log(toc1);
    //       toc1[0].click();
    //   }, 500);
    // }
  }
  console.log(toc1);
  toc2 = document.querySelectorAll("td .tokens_of_" + i + ".outside");
  console.log("random")
  toc2.forEach(function (item) {
    // console.log(item);
    item.addEventListener("click", move_token);
  });
  console.log(toc2);

  vis = false;
  toc2.forEach(function (item) {
    var cid = item.parentNode.getAttribute("id");
    var n = parseInt(cid.substring(3)) + randomDice;
    if (n < 19) {
      vis = true;
    } else {
      item.removeEventListener("click", move_token);
    }
  });
  console.log("vis=" + vis)
  // if (!(randomDice==6 && toc1.length!=0) && vis==true && toc2.length != 0) {

  //   console.log(toc2);
  //   setTimeout(function () {
  //     console.log(allowed_to_move_token);
  //     console.log("toccccccccccccccc2");
  //     if (allowed_to_move_token && toc2.length > 0 ) {
  //       allowed_to_move_token = !token_will_be_moved(randomDice, toc2[0]);
  //       toc2[0].click();
  //     }
  //     if (allowed_to_move_token && toc2.length > 1) {
  //       allowed_to_move_token = !token_will_be_moved(randomDice, toc2[1]);
  //       toc2[1].click();
  //     }
  //     if (allowed_to_move_token && toc2.length > 2 ) {
  //       allowed_to_move_token = !token_will_be_moved(randomDice, toc2[2]);
  //       toc2[2].click();
  //     }
  //     if (allowed_to_move_token && toc2.length > 3 ) {
  //       allowed_to_move_token = !token_will_be_moved(randomDice, toc2[3]);
  //       toc2[3].click();
  //     }
  //   }, 500);
  // }
  if (
    (randomDice == 6 && toc1.length == 0 && vis == false) ||
    (randomDice != 6 && vis == false)
  ) {
    console.log("i incresed");
    disable_progressbar();
    i++;
    i = i % 4;
    dic[i].src = "./dices/green/" + randomDice + ".png";
    console.log("enable for random");
    setTimeout(enableDice, 500);
  }
}

function pre_address(current_id, tag, alt) {
  if (current_id == alt) {
    return 0;
  }
  var count = parseInt(current_id.substring(3)) - 1;
  var p_toc = parseInt(current_id.substring(2, 3));

  if (p_toc != tag && count < 0) {
    count = 12;
    if (p_toc == 0) {
      p_toc = 3;
    } else {
      p_toc = (p_toc - 1) % 4;
    }
  }
  if (count == -1) {
    return alt;
  }
  var num = "d_" + p_toc + count;
  return num;
}
function next_address(current_id) {
  var count = parseInt(current_id.substring(3)) + 1;
  var p_toc = parseInt(current_id.substring(2, 3));
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
  }
  var num = "d_" + p_toc + count;
  if (count == 18) {
    num = "svg_" + i;
  }
  return num;
}
function call_to_next_player(count) {
  disable_progressbar();
  if (total_players == 1 || left || (randomDice != 6 && count != 18 && again == false)) {
    i++;
  }
  i = i % 4;
  dic[i].src = "./dices/green/" + randomDice + ".png";
  enableDice();
}
function set_class(current_id, previously_total_token) {
  var after_run_total_tokens = document.querySelectorAll(
    "#" + current_id + " img"
  );

  document
    .getElementById(current_id)
    .classList.remove("token" + previously_total_token.length);
  if (after_run_total_tokens.length == 1) {
    after_run_total_tokens[0].classList.remove("tokens");
    after_run_total_tokens[0].classList.add("token");
  }
  if (after_run_total_tokens.length > 1) {
    document
      .getElementById(current_id)
      .classList.add("token" + after_run_total_tokens.length);
  }
}
function set_img_at_given_place_id(img_src,player_id,alt,place_id){
        var img = document.createElement("img");
        img.src = img_src + player_id + ".png";
        img.alt = alt;
        var src = document.getElementById(place_id);
        src.appendChild(img);
        return img;
}
function backword(current_id, alt, last_token) {
  var time = 0;
  var p_toc = parseInt(alt.substring(2, 3));
  var k = pre_address(current_id, p_toc, alt);
  // console.log(k);
  var vis = false;
  while (k != 0) {
    // console.log("k=" + k);
    setTimeout(
      function (k, current_id, p_toc, alt) {
        var tt = document.querySelector(
          "#" + current_id + " img[alt=" + alt + "]"
        );
        tt.remove(tt);
        var img=set_img_at_given_place_id(token_src,p_toc,alt,k);
        if (k == alt) {
          img.classList.add("token");
          img.classList.add("tokens_of_" + p_toc);
          if (last_token == alt) {
            // toc1 = [];
            call_to_next_player();
          }
        } else {
          img.classList.add("run_token");
        }
      },
      time,
      k,
      current_id,
      p_toc,
      alt
    );
    time = time + 35;
    current_id = k;
    k = pre_address(k, p_toc, alt);
  }
}
function set_positions(num, count, img, p_total_token, alt) {
  var safe = document.querySelector("#" + num + ".safe img");
  again = false;
  var total_killed = 0;
  console.log("safe=" + safe);
  if (safe == null && p_total_token.length > 0) {
    var last_token = p_total_token[p_total_token.length - 1].getAttribute(
      "alt"
    );
    p_total_token.forEach(function (item) {
      var alt_name = item.getAttribute("alt");
      console.error("not safe")
      if (
        alt.substring(2, 3) != alt_name.substring(2, 3) &&
        item.getAttribute("class") != "run_token"
      ) {
        console.error("not same")
        again = true;
        total_killed++;
        backword(num, alt_name, last_token);
      }
    });
  }
  var a_total_token = document.querySelectorAll("#" + num + " img");
  setTimeout(function () {
    console.error("set")
    // var a_total_token = document.querySelectorAll("#" + num + " img");
    a_total_token_length = a_total_token.length - total_killed;
    if (count != 18) {
      img.classList.add("tokens_of_" + i);
    } else if (
      count == 18 &&
      document.getElementsByClassName("tokens_of_" + i).length == 0
    ) {
      total_players--;
      var winner_img=set_img_at_given_place_id(winner_src,rank,"","winner_" + i)
     
      winner_img.classList.add("winner");

      rank++;
      if (rank == 4) {
        game_over = true;
      }
    }
    img.classList.add("outside");
    img.classList.remove("run_token");
    if (a_total_token_length == 1) {
      if (count == 18) {
        img.classList.add("token_svg_" + i);
      } else {
        // console.error("token")
        img.classList.add("token");
      }
    } else {
      a_total_token.forEach(function (item) {
        if (count != 18) {
          item.classList.add("tokens");
        } else {
          item.classList.add("svg_token" + a_total_token_length);
        }
      });
    }
    if (count == 18 && p_total_token.length == 1) {
      p_total_token[0].classList.remove("token_svg_" + i);
    }
    for (var k = p_total_token.length; k > 1; k--) {
      document.getElementById(num).classList.remove("token" + k);
    }
    for (var k = 0; a_total_token_length > 1 && k < a_total_token_length; k++) {
      a_total_token[k].classList.remove("token");
    }
    if (a_total_token_length > 1 && count != 18) {
      document
        .getElementById(num)
        .classList.add("token" + a_total_token_length);
    }
    if (!again) {
      // toc1 = [];
      call_to_next_player(count);
    }
  }, 1);
}
function run_token(current_id, num, count, alt, previously_total_token) {
  var p_total_token = document.querySelectorAll("#" + num + " img");
  var k = next_address(current_id);
  var time = 0;
  if (current_id == num) {
    var img=set_img_at_given_place_id(token_src,i,alt,num);
    var a_total_token = document.querySelectorAll("#" + num + " img");
    img.classList.add("tokens_of_" + i);
    a_total_token_length = a_total_token.length;
    img.classList.add("outside");
    if (a_total_token_length == 1) {
      img.classList.add("token");
    } else {
      a_total_token.forEach(function (item) {
        item.classList.add("tokens");
      });
    }
    for (var k = p_total_token.length; k > 1; k--) {
      document.getElementById(num).classList.remove("token" + k);
    }
    for (var k = 0; a_total_token_length > 1 && k < a_total_token_length; k++) {
      a_total_token[k].classList.remove("token");
    }
    if (a_total_token_length > 1 && count != 18) {
      document
        .getElementById(num)
        .classList.add("token" + a_total_token_length);
    }
    // toc1 = [];
    call_to_next_player();
    return;
  }
  var span = document.createElement("span");
  span.classList.add("animation_" + i);
  document.getElementById(current_id).appendChild(span);
  var temp_c_id = current_id;
  while (current_id !== num) {
    // console.log("k=" + k);
    setTimeout(
      function (k, current_id, i, alt) {
        var tt = document.querySelector(
          "#" + current_id + " img[alt=" + alt + "]"
        );
        tt.remove(tt);
        setTimeout(
          function (current_id, i) {
            tt = document.querySelector(
              "#" + current_id + " span.animation_" + i
            );
            tt.remove(tt);
          },
          500,
          current_id,
          i
        );
        if (temp_c_id === current_id) {
          set_class(temp_c_id, previously_total_token);
        }
        var img = set_img_at_given_place_id(token_src,i,alt,k);
        var span = document.createElement("span");
        var src = document.getElementById(k);
        src.appendChild(span);
        span.classList.add("animation_" + i);
        img.classList.add("run_token");
        if (k == num) {
          // setTimeout(
          //   function (k, i, img, num) {
          // img.classList.remove("run_token");
          tt = document.querySelector("#" + num + " span.animation_" + i);
          tt.remove(tt);
          //   },
          //   0,
          //   k,
          //   i,
          //   img,
          //   num
          // );
          set_positions(num, count, img, p_total_token, alt);
        }
      },
      time + 200,
      k,
      current_id,
      i,
      alt
    );
    time = time + 200;
    current_id = k;
    k = next_address(k);
  }
}

function move_token(event_inn) {
  remove_EventListener(i);
  automatic = true;
  console.log("move_token");
  var current_id = event_inn.target.parentNode.getAttribute("id");
  var count = parseInt(current_id.substring(3)) + randomDice;
  var p_toc = parseInt(current_id.substring(2, 3));
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
  }
  var previously_total_token = document.querySelectorAll(
    "#" + current_id + " img"
  );
  var alt = event_inn.target.getAttribute("alt");
  var num = "d_" + p_toc + count;
  if (count == 18) {
    num = "svg_" + i;
  }
  // console.log("cc");
  run_token(current_id, num, count, alt, previously_total_token);
}

function remove_EventListener() {
  console.log("remove_eventlisner_for=" + randomDice);
  toc1.forEach(function (items) {
    items.removeEventListener("click", six_token);
  });
  toc2.forEach(function (items) {
    items.removeEventListener("click", move_token);
  });
}
function six_token(event_inn) {
  remove_EventListener();
  automatic = true;
  var alt = event_inn.target.getAttribute("alt");
  event_inn.target.remove(event_inn.target);
  var num = "d_" + i.toString() + "0";
  // console.error(timeouts);
  run_token(num, num, 0, alt);
}
function set_remainin_token(current_id, p_total_token) {
  var a_total_token = document.querySelectorAll("#" + current_id + " img");
  if (a_total_token.length == 1) {
    a_total_token[0].classList.remove("tokens");
    a_total_token[0].classList.add("token");
  } else {
    a_total_token.forEach(function (item) {
      item.classList.add("tokens");
    });
  }
  for (var k = p_total_token.length; k > 1; k--) {
    document.getElementById(current_id).classList.remove("token" + k);
  }
  for (var k = 0; a_total_token.length > 1 && k < a_total_token.length; k++) {
    a_total_token[k].classList.remove("token");
  }
  if (a_total_token.length > 1) {
    document
      .getElementById(current_id)
      .classList.add("token" + a_total_token.length);
  }
}
function timing() {
  var new_div = document.createElement("div");
  var id = document.getElementById("u-" + i);
  id.appendChild(new_div);
  id = document.querySelector("#u-" + i + " div");
  id.classList.add("bordertop");

  var new_div = document.createElement("div");
  var id = document.getElementById("u-" + i);
  id.appendChild(new_div);
  id = document.querySelector("#u-" + i + " div:nth-of-type(2)");
  id.classList.add("borderleft");

  var new_div = document.createElement("div");
  var id = document.getElementById("u-" + i);
  id.appendChild(new_div);
  id = document.querySelector("#u-" + i + " div:nth-of-type(3)");
  id.classList.add("borderbottom");

  var new_div = document.createElement("div");
  var id = document.getElementById("u-" + i);
  id.appendChild(new_div);
  id = document.querySelector("#u-" + i + " div:nth-of-type(4)");
  id.classList.add("borderright");
  timeouts = [];
  var left = document.querySelector("#u-" + i + " div.borderleft");
  var h = 99;
  var time = 50;
  var highlight = document.querySelectorAll(".highlight_" + i);
  while (h >= 0) {
    le = setTimeout(
      function (h) {
        // console.error("le="+h);
        left.style.height = h + "%";
        for (var z = 0; z < highlight.length && (h % 15 == 0); z++) {
          highlight[z].classList.toggle("highlight" + i);

        }
        // a[4].style.transform="rotate("+h*25+"deg)";
      },
      time,
      h
    );
    h--;
    time = time + 15;
    timeouts.push(le);
  }

  var bottom = document.querySelector("#u-" + i + " div.borderbottom");
  var w = 99;
  while (w >= 0) {
    bo = setTimeout(
      function (w) {
        // console.error("bo="+w);
        bottom.style.width = w + "%";
        for (var z = 0; z < highlight.length && (w % 15 == 0); z++) {
          highlight[z].classList.toggle("highlight" + i);

        }
        // a[0].style.transform="rotate("+w+"deg)";
      },
      time,
      w
    );

    w--;
    time = time + 15;
    timeouts.push(bo);
  }

  var right = document.querySelector("#u-" + i + " div.borderright");
  var top = document.querySelector("#u-" + i + " div.bordertop");
  var h = 99;
  while (h >= 0) {
    ri = setTimeout(
      function (h) {
        // console.error("ri="+h);
        right.style.height = h + "%";
        for (var z = 0; z < highlight.length && (h % 15 == 0); z++) {
          highlight[z].classList.toggle("highlight" + i);

        }
        // a[0].style.transform="rotate("+h+"deg)";
        // if (h == 55) {
        //   right.style.borderColor = "#f51c40";
        //   top.style.borderColor = "#ff8c00";
        // }
      },
      time,
      h
    );

    h--;
    time = time + 15;
    timeouts.push(ri);
  }

  var w = 99;
  while (w >= 0) {
    to = setTimeout(
      function (w) {
        // console.error("to="+w);
        top.style.width = w + "%";
        for (var z = 0; z < highlight.length && (w % 15 == 0); z++) {
          highlight[z].classList.toggle("highlight" + i);
        }
        // a[0].style.transform="rotate("+w+"deg)";
        if (w == 0) {
          console.log("automatic");
          disable_progressbar();
          console.log("hii");
          console.log("toc1");

          var toc = document.querySelectorAll(".circle .tokens_of_" + i);
          toc2 = document.querySelectorAll("td .tokens_of_" + i + ".outside");
          vis = false;
          if (automatic == false) {
            var count_dot;
            if (i == 0) {
              if (green_dot == 6) {
                for (var z = 0; z < toc.length; z++) {
                  toc[z].remove(toc[z]);
                }
                for (var z = 0; z < toc2.length; z++) {
                  var current_id = toc2[z].parentNode.getAttribute("id");
                  var p_total_token = document.querySelectorAll("#" + current_id + " img");
                  toc2[z].remove(toc2[z]);
                  set_remainin_token(current_id, p_total_token);
                }
                var left_img=set_img_at_given_place_id(left_src,i,"","winner_" + i);
                left_img.classList.add("winner");
                total_players--;
                left = true;
                call_to_next_player();
                return;

              }
              count_dot = green_dot;
              green_dot++;
            } else if (i == 1) {
              if (yellow_dot == 6) {
                for (var z = 0; z < toc.length; z++) {
                  toc[z].remove(toc[z]);
                }
                for (var z = 0; z < toc2.length; z++) {
                  var current_id = toc2[z].parentNode.getAttribute("id");
                  var p_total_token = document.querySelectorAll("#" + current_id + " img");
                  toc2[z].remove(toc2[z]);
                  set_remainin_token(current_id, p_total_token);
                }
                var left_img=set_img_at_given_place_id(left_src,i,"","winner_" + i);
                left_img.classList.add("winner");
                total_players--;
                left = true;
                call_to_next_player();
                return;
              }
              count_dot = yellow_dot;
              yellow_dot++;
            } else if (i == 2) {
              if (blue_dot == 6) {
                for (var z = 0; z < toc.length; z++) {
                  toc[z].remove(toc[z]);
                }
                for (var z = 0; z < toc2.length; z++) {
                  var current_id = toc2[z].parentNode.getAttribute("id");
                  var p_total_token = document.querySelectorAll("#" + current_id + " img");
                  toc2[z].remove(toc2[z]);
                  set_remainin_token(current_id, p_total_token);
                }
                var left_img=set_img_at_given_place_id(left_src,i,"","winner_" + i);
                left_img.classList.add("winner");
                total_players--;
                left = true;
                call_to_next_player();
                return;
              }
              count_dot = blue_dot;
              blue_dot++;
            } else if (i == 3) {
              if (red_dot == 6) {

                for (var z = 0; z < toc.length; z++) {
                  toc[z].remove(toc[z]);
                }
                for (var z = 0; z < toc2.length; z++) {
                  var current_id = toc2[z].parentNode.getAttribute("id");
                  var p_total_token = document.querySelectorAll("#" + current_id + " img");
                  toc2[z].remove(toc2[z]);
                  set_remainin_token(current_id, p_total_token);
                }
                var left_img=set_img_at_given_place_id(left_src,i,"","winner_" + i);
                left_img.classList.add("winner");
                total_players--;
                left = true;
                call_to_next_player();
                return;
              }
              count_dot = red_dot;
              red_dot++;
            }
            var dot = document.querySelector("#dot" + i + "_" + count_dot);
            dic[i].click();
            console.log(dot);
            dot.style.background = "#f51c40";
            toc2.forEach(function (item) {
              var cid = item.parentNode.getAttribute("id");
              var n = parseInt(cid.substring(3)) + randomDice;
              console.log(n);
              if (n < 19) {
                vis = true;
              } else {
                item.removeEventListener("click", move_token);
              }
            });
          }
          var allready_come = false;
          // allowed_to_move_token = true;
          if (toc1.length != 0) {
            console.log("allowed_to_move_token=" + allowed_to_move_token)
            allowed_to_move_token = false;
            allready_come = true;
            toc1[0].click();
          }
          console.log(vis);

          if (!allready_come && vis == true && toc2.length != 0) {
            // console.log(toc2);
            console.log("inside");
            console.log(allowed_to_move_token);
            if (allowed_to_move_token && toc2.length > 0) {
              allowed_to_move_token = !token_will_be_moved(
                randomDice,
                toc2[0]
              );
              toc2[0].click();
            }
            if (allowed_to_move_token && toc2.length > 1) {
              allowed_to_move_token = !token_will_be_moved(
                randomDice,
                toc2[1]
              );
              toc2[1].click();
            }
            if (allowed_to_move_token && toc2.length > 2) {
              allowed_to_move_token = !token_will_be_moved(
                randomDice,
                toc2[2]
              );
              toc2[2].click();
            }
            if (allowed_to_move_token && toc2.length > 3) {
              allowed_to_move_token = !token_will_be_moved(
                randomDice,
                toc2[3]
              );
              toc2[3].click();
            }
          }
        }
      },
      time,
      w
    );
    w--;
    time = time + 15;
    timeouts.push(to);
  }
  // console.error(timeouts);
}
function disable_progressbar() {
  // console.error(timeouts);
  var l = document.querySelector("#u-" + i + " .borderleft");
  // console.error(l);
  if (l != null) {
    // console.error("yes")
    l.remove(l);
    var b = document.querySelector("#u-" + i + " .borderbottom");
    b.remove(b);
    var r = document.querySelector("#u-" + i + " .borderright");
    r.remove(r);
    var t = document.querySelector("#u-" + i + " .bordertop");
    t.remove(t);
  }
  for (var z = 0; z < timeouts.length; z++) {
    // console.error(timeouts[z]);
    clearTimeout(timeouts[z]);
  }
  var highlight = document.querySelectorAll(".highlight_" + i);
  for (var z = 0; z < highlight.length; z++) {
    highlight[z].classList.remove("highlight" + i);
  }
}

function enableDice() {
  // no_of_dice_rolls ++;
  // if (no_of_dice_rolls > 2) {
  //   return;
  // }
  left=false;
  if (total_players == 1 && document.querySelectorAll("#winner_" + i + " img").length == 0 && rank != 4) {
    var t1 = document.querySelectorAll(".circle .tokens_of_" + i);
    var t2 = document.querySelectorAll("td .tokens_of_" + i + ".outside");
    for (var z = 0; z < t1.length; z++) {
      t1[z].remove(t1[z]);
    }
    for (var z = 0; z < t2.length; z++) {
      t2[z].remove(t2[z]);
    }
    var winner_img=set_img_at_given_place_id(winner_src,rank,"","winner_" + i);
    winner_img.classList.add("winner");
    return;
  }
  automatic = false;
  dic[i].style.display = "block";
  dic[(i + 1) % 4].style.display = "none";
  dic[(i + 2) % 4].style.display = "none";
  dic[(i + 3) % 4].style.display = "none";

  if (game_over) {
    return;
  }
  var available = document.getElementsByClassName("tokens_of_" + i);
  if (available.length == 0) {
    left = true;
    call_to_next_player();
  } else {
    dic[i].addEventListener("click", rollDice);
    timing();
    dic[i].click();
  }
}
