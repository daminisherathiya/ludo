var dices = [
  document.getElementById("green_dice"),
  document.getElementById("yellow_dice"),
  document.getElementById("blue_dice"),
  document.getElementById("red_dice"),
];

var no_of_dice_rolls_till_now = 0;
var turn_of_the_player = 0; // 0 => green, 1=> blue, 2 => yellow, 3 => red 
var total_players = 4;
var rank = 1;
var player_has_left = false;
var count_to_avoid_race_conditions = 0;
var winner_images_directory_path = "./images/winners/";
var token_images_directory_path = "./images/tokens/";
var left_user_images_directory_path = "./images/left_users/";
var dice_images_directory_path = "./images/dices/";
var green_player_automatic_turns_used = 0;  // If user do not complete their turn in the allowed time, then we will run tokens automatically for 5 times, but 6th time we will kick them out.
var yellow_player_automatic_turns_used = 0;
var blue_player_automatic_turns_used = 0;
var red_player_automatic_turns_used = 0;
var game_over = false;
var token_is_running = false;  // Used to avoid race conditions.
var again_the_same_players_turn = false;  // When the player gets 6 upon the dice roll, or kills other player's tokens, etc.
var random_dice = Math.floor(6 * Math.random()) + 1;
dices[turn_of_the_player].src = dice_images_directory_path + random_dice + ".png";  // Show a random dice for the green player upon start.
var at_least_one_outside_token_can_be_moved = false;
var tokens_inside_home = [];
var tokens_outside_home = [];
var timer_settimeouts = [];  // Used to remove timer when the user finishes their turn.
function set_pointer_event_depending_on_automatic_or_not() {
  if (document.getElementById("run_automatically_switch_input").checked) {
    disable_pointer_event();
  } else {
    enable_pointer_event();
  }
}
set_pointer_event_depending_on_automatic_or_not();
enable_dice();  // Entry point. All magic starts from here.

function token_will_be_moved(random_dice, item) {
  var cid = item.parentNode.getAttribute("id");
  var n = parseInt(cid.substring(3)) + random_dice;
  if (n < 19) {
    return true;
  }
  return false;
}
function any_chance_to_move_token() {
  at_least_one_outside_token_can_be_moved = false;
  tokens_outside_home.forEach(function (item) {
    if (token_will_be_moved(random_dice, item)) {
      at_least_one_outside_token_can_be_moved = true;
    } else {
      item.parentNode.classList.remove("outside_token_animation");
      item.removeEventListener("click", move_token);
    }
  });
}
function automatic_clicked_token(for_turn) {
  if (for_turn < count_to_avoid_race_conditions) {
    return;
  }
  count_to_avoid_race_conditions++;
  var allowed_to_move_token = true;
  var already_come = false;
  if (tokens_inside_home.length != 0) {
    already_come = true;
    setTimeout(function () {
      allowed_to_move_token = false;
      if (for_turn + 1 == count_to_avoid_race_conditions && token_is_running==false) {
        tokens_inside_home[0].click();
      }
    }, 1000);
  }
  if (!already_come && at_least_one_outside_token_can_be_moved == true && tokens_outside_home.length != 0) {
    setTimeout(function () {
      for (var z = 0; z < 4; z++) {
        if (allowed_to_move_token && tokens_outside_home.length > z && token_is_running==false) {
          allowed_to_move_token = !token_will_be_moved(
            random_dice,
            tokens_outside_home[z]
          );
          if (for_turn + 1 == count_to_avoid_race_conditions) {
            tokens_outside_home[z].click();
          }
        }
      }
    }, 1000);
  }
}

function roll_dice() {
  dices[turn_of_the_player].removeEventListener("click", roll_dice);
  random_dice = Math.floor(6 * Math.random()) + 1;
  // random_dice = 6;
  // tokens_inside_home = [];
  if (random_dice == 6) {
    tokens_inside_home = document.querySelectorAll(".circle .tokens_of_" + turn_of_the_player);
    tokens_inside_home.forEach(function (item) {
      item.addEventListener("click", six_token);
    });
  }
  tokens_outside_home = document.querySelectorAll(
    "td .tokens_of_" + turn_of_the_player + ".outside"
  );
  tokens_outside_home.forEach(function (item) {
    item.addEventListener("click", move_token);
  });
  any_chance_to_move_token();
  var time = 0;
  var color = get_color_from_idx(turn_of_the_player);
  for (var z = 0; z < 6 + random_dice; z++) {
    setTimeout(
      function (z, for_turn) {
        dices[turn_of_the_player].src = "./images/dices/" + ((z % 6) + 1) + ".png";
        if (z >= 6 && (z % 6) + 1 == random_dice) {
          document
            .querySelector("#"+ color + "_dice_container" + " img")
            .classList.remove("dice_margin");
          document
            .querySelector("#"+ color + "_dice_container")
            .classList.remove("dice_border_animation");
          for (var z = 0; z < tokens_inside_home.length; z++) {
            tokens_inside_home[z].parentNode.classList.add(
              "home_token_animation"
            );
          }
          for (var z = 0; z < tokens_outside_home.length; z++) {
            tokens_outside_home[z].parentNode.classList.add(
              "outside_token_animation"
            );
          }
          any_chance_to_move_token();
          if (document.getElementById("run_automatically_switch_input").checked == true) {
            automatic_clicked_token(for_turn);
          }
          if (
            (random_dice == 6 &&
              tokens_inside_home.length == 0 &&
              at_least_one_outside_token_can_be_moved == false) ||
            (random_dice != 6 && at_least_one_outside_token_can_be_moved == false)
          ) {
            disable_progressbar();
            turn_of_the_player++;
            turn_of_the_player = turn_of_the_player % 4;
            dices[turn_of_the_player].src = "./images/dices/" + random_dice + ".png";
            setTimeout(enable_dice, 500);
          }
        }
      },
      time,
      z,
      count_to_avoid_race_conditions
    );
    time = time + 50;
  }
}

function pre_address(current_token_id, tag, alt) {
  if (current_token_id == alt) {
    return 0;
  }
  var count = parseInt(current_token_id.substring(3)) - 1;
  var place_tag = parseInt(current_token_id.substring(2, 3));

  if (place_tag != tag && count < 0) {
    count = 12;
    if (place_tag == 0) {
      place_tag = 3;
    } else {
      place_tag = (place_tag - 1) % 4;
    }
  }
  if (count == -1) {
    return alt;
  }
  var token_place_id = "d_" + place_tag + count;
  return token_place_id;
}
function next_address(current_token_id, steps) {
  var count = parseInt(current_token_id.substring(3)) + steps;
  var place_tag = parseInt(current_token_id.substring(2, 3));
  if (count == 12) {
    var temp_place_tag = (place_tag + 1) % 4;
    if (temp_place_tag == turn_of_the_player) {
      count = count + 1;
      place_tag = temp_place_tag;
    }
  } else if (count > 12) {
    var temp_count = count;
    count = count - 13;
    if (current_token_id.substring(3) < 13) {
      place_tag = (place_tag + 1) % 4;
    } else {
      temp_count--;
    }
    if (place_tag == turn_of_the_player) {
      count = temp_count + 1;
    }
  }
  var token_place_id = "d_" + place_tag + count;
  if (count == 18) {
    var color = get_color_from_idx(turn_of_the_player);
    token_place_id = "destination_for_" + color + "_tokens";
  }
  return [token_place_id, count];
}
function call_to_next_player(count) {
  disable_progressbar();
  if (
    total_players == 1 ||
    player_has_left ||
    (random_dice != 6 && count != 18 && again_the_same_players_turn == false)
  ) {
    turn_of_the_player++;
  }
  turn_of_the_player = turn_of_the_player % 4;
  dices[turn_of_the_player].src = "./images/dices/" + random_dice + ".png";
  enable_dice();
}
function get_color_from_idx(idx) {
  if (idx === 0) {
    return "green";
  }
  else if (idx === 1) {
    return "yellow";
  }
  else if (idx === 2) {
    return "blue";
  }
  else if (idx === 3) {
    return "red";
  }
}
function set_img_at_given_place_id(img_src, color, alt, place_id) {
  var img = document.createElement("img");
  img.src = img_src + color + ".png";
  img.alt = alt;
  var src = document.getElementById(place_id);
  src.appendChild(img);
  return img;
}
function backword(current_token_id, alt, last_token) {
  var time = 0;
  var player_id = parseInt(alt.substring(2, 3));
  var k = pre_address(current_token_id, player_id, alt);
  while (k != 0) {
    setTimeout(
      function (k, current_token_id, player_id, alt) {
        var tt = document.querySelector(
          "#" + current_token_id + " img[alt=" + alt + "]"
        );
        tt.remove(tt);
        var color = get_color_from_idx(player_id);
        var img = set_img_at_given_place_id(token_images_directory_path, color, alt, k);
        if (k == alt) {
          img.classList.add("single_token");
          img.classList.add("tokens_of_" + player_id);
          if (last_token == alt) {
            call_to_next_player();
          }
        } else {
          img.classList.add("running_token");
        }
      },
      time,
      k,
      current_token_id,
      player_id,
      alt
    );
    time = time + 35;
    current_token_id = k;
    k = pre_address(k, player_id, alt);
  }
}
function set_positions(token_place_id, count, img, p_total_token, alt) {
  var safe = document.querySelector("#" + token_place_id + ".safe img");
  again_the_same_players_turn = false;
  if (safe == null && p_total_token.length > 0) {
    var last_token = p_total_token[p_total_token.length - 1].getAttribute(
      "alt"
    );
    p_total_token.forEach(function (item) {
      var alt_name = item.getAttribute("alt");
      if (
        alt.substring(2, 3) != alt_name.substring(2, 3) &&
        item.getAttribute("class") != "running_token"
      ) {
        again_the_same_players_turn = true;
        backword(token_place_id, alt_name, last_token);
      }
    });
  }
  setTimeout(function () {
    if (count != 18) {
      img.classList.add("tokens_of_" + turn_of_the_player);
    } else if (
      count == 18 &&
      document.getElementsByClassName("tokens_of_" + turn_of_the_player).length == 0
    ) {
      player_has_left = true;
      total_players--;
      var winner_img = set_img_at_given_place_id(
        winner_images_directory_path,
        rank,
        "",
        "winner_" + turn_of_the_player
      );
      winner_img.classList.add("winner");
      rank++;
      if (rank == 4) {
        game_over = true;
      }
    }
    img.classList.add("outside");
    img.classList.remove("running_token");
    set_pointer_event_depending_on_automatic_or_not();
    set_remainin_token(token_place_id, p_total_token, count);
    if (!again_the_same_players_turn) {
      call_to_next_player(count);
    }
  }, 1);
}
function run_token(
  current_token_id,
  token_place_id,
  count,
  alt,
  previously_total_token
) {
  var p_total_token = document.querySelectorAll("#" + token_place_id + " img");
  var step = 1;
  var id_n_count = next_address(current_token_id, step);
  var next_id = id_n_count[0];
  var time = 200;
  var color = get_color_from_idx(turn_of_the_player);
  if (current_token_id == token_place_id) {
    var img = set_img_at_given_place_id(token_images_directory_path, color, alt, token_place_id);
    img.classList.add("tokens_of_" + turn_of_the_player);
    img.classList.add("outside");
    set_pointer_event_depending_on_automatic_or_not();
    set_remainin_token(token_place_id, p_total_token, 0);
    call_to_next_player();
    return;
  }
  var span = document.createElement("span");
  span.classList.add("running_" + color + "_token_animation");
  document.getElementById(current_token_id).appendChild(span);
  var temp_current_id = current_token_id;
  while (current_token_id !== token_place_id) {
    setTimeout(
      function (next_id, current_token_id, turn_of_the_player, alt) {
        var remove_token = document.querySelector(
          "#" + current_token_id + " img[alt=" + alt + "]"
        );
        remove_token.remove(remove_token);
        var remove_animation;
        setTimeout(
          function (current_token_id, turn_of_the_player) {
            var color = get_color_from_idx(turn_of_the_player);
            remove_animation = document.querySelector(
              "#" + current_token_id + " span.running_" + color + "_token_animation"
            );
            remove_animation.remove(remove_animation);
          },
          500,
          current_token_id,
          turn_of_the_player
        );
        if (temp_current_id === current_token_id) {
          set_remainin_token(temp_current_id, previously_total_token, 0);
        }
        var img = set_img_at_given_place_id(token_images_directory_path, color, alt, next_id);
        var span = document.createElement("span");
        var src = document.getElementById(next_id);
        src.appendChild(span);
        span.classList.add("running_" + color + "_token_animation");
        img.classList.add("running_token");
        if (next_id == token_place_id) {
          remove_animation = document.querySelector(
            "#" + token_place_id + " span.running_" + color + "_token_animation"
          );
          remove_animation.remove(remove_animation);
          set_positions(token_place_id, count, img, p_total_token, alt);
        }
      },
      time,
      next_id,
      current_token_id,
      turn_of_the_player,
      alt
    );
    time = time + 200;
    current_token_id = next_id;
    id_n_count = next_address(next_id, step);
    next_id = id_n_count[0];
  }
}

function move_token(event_inn) {
  token_is_running = true;
  remove_event_listener();
  count_to_avoid_race_conditions++;
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].parentNode.classList.remove("home_token_animation");
  }
  for (var z = 0; z < tokens_outside_home.length; z++) {
    tokens_outside_home[z].parentNode.classList.remove(
      "outside_token_animation"
    );
  }
  var current_token_id = event_inn.target.parentNode.getAttribute("id");
  var id_n_count = next_address(current_token_id, random_dice);
  var token_place_id = id_n_count[0];
  var count = id_n_count[1];
  var previously_total_token = document.querySelectorAll(
    "#" + current_token_id + " img"
  );
  var alt = event_inn.target.getAttribute("alt");
  run_token(
    current_token_id,
    token_place_id,
    count,
    alt,
    previously_total_token
  );
}

function remove_event_listener() {
  tokens_inside_home.forEach(function (items) {
    items.removeEventListener("click", six_token);
  });
  tokens_outside_home.forEach(function (items) {
    items.removeEventListener("click", move_token);
  });
}
function six_token(event_inn) {
  token_is_running = true;
  remove_event_listener();
  count_to_avoid_race_conditions++;
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].parentNode.classList.remove("home_token_animation");
  }
  for (var z = 0; z < tokens_outside_home.length; z++) {
    tokens_outside_home[z].parentNode.classList.remove(
      "outside_token_animation"
    );
  }
  var alt = event_inn.target.getAttribute("alt");
  event_inn.target.remove(event_inn.target);
  var token_place_id = "d_" + turn_of_the_player.toString() + "0";
  run_token(token_place_id, token_place_id, 0, alt);
}

function set_remainin_token(current_token_id, p_total_token, count) {
  var a_total_token = document.querySelectorAll(
    "#" + current_token_id + " img"
  );
  a_total_token_length = a_total_token.length;
  var color = get_color_from_idx(turn_of_the_player);
  if (a_total_token_length == 1) {
    if (count == 18) {
      a_total_token[0].classList.add("single_"+ color + "_token_inside_destination");
    } else {
      a_total_token[0].classList.remove("multiple_tokens");
      a_total_token[0].classList.add("single_token");
    }
  } else {
    a_total_token.forEach(function (item) {
      if (count != 18) {
        item.classList.add("multiple_tokens");
      } else {
        item.classList.add("destination_containing_" + a_total_token_length + "_tokens");
      }
    });
  }
  if (count == 18 && p_total_token.length == 1) {
    p_total_token[0].classList.remove("single_" + color + "_token_inside_destination");
  }
  for (var k = p_total_token.length; k > 1; k--) {
    document.getElementById(current_token_id).classList.remove("cell_containing_" + k + "_tokens");
  }
  for (var k = 0; a_total_token_length > 1 && k < a_total_token_length; k++) {
    a_total_token[k].classList.remove("single_token");
  }
  if (a_total_token_length > 1 && count != 18) {
    document
      .getElementById(current_token_id)
      .classList.add("cell_containing_" + a_total_token_length + "_tokens");
  }
}
function remove_all_tokens_of_this_player() {
  var color = get_color_from_idx(turn_of_the_player);
  document.querySelector("#"+ color + "_dice_container" + " img").classList.remove("dice_margin");
  document.querySelector("#"+ color + "_dice_container").classList.remove("dice_border_animation");
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].parentNode.classList.remove("home_token_animation");
  }
  for (var z = 0; z < tokens_outside_home.length; z++) {
    tokens_outside_home[z].parentNode.classList.remove(
      "outside_token_animation"
    );
  }
  var toc1 = document.querySelectorAll(".circle .tokens_of_" + turn_of_the_player);
  var toc2 = document.querySelectorAll("td .tokens_of_" + turn_of_the_player + ".outside");
  var svg = document.querySelectorAll("#destination_for_" + color + "_tokens" + " img");
  for (var z = 0; z < toc1.length; z++) {
    toc1[z].remove(toc1[z]);
  }
  for (var z = 0; z < toc2.length; z++) {
    var current_token_id = toc2[z].parentNode.getAttribute("id");
    var p_total_token = document.querySelectorAll(
      "#" + current_token_id + " img"
    );
    toc2[z].remove(toc2[z]);
    set_remainin_token(current_token_id, p_total_token, 0);
  }
  for (var z = 0; z < svg.length; z++) {
    svg[z].remove(svg[z]);
  }
}
function player_went() {
  remove_all_tokens_of_this_player();
  var color = get_color_from_idx(turn_of_the_player);
  var left_img = set_img_at_given_place_id(left_user_images_directory_path, color, "", "winner_" + turn_of_the_player);
  left_img.classList.add("winner");
  total_players--;
  player_has_left = true;
  call_to_next_player();
}
function leave_stage(increase_dot = true) {
  if (token_is_running == false) {
    if (increase_dot) {
      var count_dot;
      if (turn_of_the_player == 0) {
        if (green_player_automatic_turns_used == 5) {
          player_went();
          return;
        }
        count_dot = green_player_automatic_turns_used;
        green_player_automatic_turns_used++;
      } else if (turn_of_the_player == 1) {
        if (yellow_player_automatic_turns_used == 5) {
          player_went();
          return;
        }
        count_dot = yellow_player_automatic_turns_used;
        yellow_player_automatic_turns_used++;
      } else if (turn_of_the_player == 2) {
        if (blue_player_automatic_turns_used == 5) {
          player_went();
          return;
        }
        count_dot = blue_player_automatic_turns_used;
        blue_player_automatic_turns_used++;
      } else if (turn_of_the_player == 3) {
        if (red_player_automatic_turns_used == 5) {
          player_went();
          return;
        }
        count_dot = red_player_automatic_turns_used;
        red_player_automatic_turns_used++;
      }
      var color = get_color_from_idx(turn_of_the_player);
      var dot = document.querySelector("#dot_of_" + color + "_" + count_dot);
      dot.style.background = "#f51c40";
    }
    dices[turn_of_the_player].click();
    
    setTimeout(
      function (for_turn) {
        automatic_clicked_token(for_turn);
      },
      (7 + random_dice) * 50,
      count_to_avoid_race_conditions
    );
  }
}
function highlight_stage(string, highlight, time) {
  var color=get_color_from_idx(turn_of_the_player);
  var border = document.querySelector("#" + color + "_user" + " div.timer_border_" + string);
  var length = 99;
  while (length >= 0) {
    var time_out = setTimeout(
      function (length) {
        if (string == "left" || string == "right") {
          border.style.height = length + "%";
        } else {
          border.style.width = length + "%";
        }
        for (var z = 0; z < highlight.length && length % 15 == 0; z++) {
          var color = get_color_from_idx(turn_of_the_player);
          highlight[z].classList.toggle("light_" + color);
        }
        if (length == 0 && string == "top") {
          leave_stage();
        }
      },
      time,
      length
    );
    length--;
    time = time + 15;
    timer_settimeouts.push(time_out);
  }
  return time;
}
function add_progressbar(string, border) {
  var new_div = document.createElement("div");
  var color = get_color_from_idx(turn_of_the_player);
  var id = document.getElementById(color + "_user");
  id.appendChild(new_div);
  id = document.querySelector("#" + color + "_user" + " div:nth-of-type(" + string + ")");
  id.classList.add(border);
}
function timing() {
  add_progressbar("1", "timer_border_top");
  add_progressbar("2", "timer_border_left");
  add_progressbar("3", "timer_border_bottom");
  add_progressbar("4", "timer_border_right");
  timer_settimeouts = [];
  var highlight = document.querySelectorAll(".highlight_" + turn_of_the_player);
  var time = 50;
  time = highlight_stage("left", highlight, time);
  time = highlight_stage("bottom", highlight, time);
  time = highlight_stage("right", highlight, time);
  highlight_stage("top", highlight, time);
}
function disable_progressbar() {
  var color = get_color_from_idx(turn_of_the_player);
  var left_border = document.querySelector("#" + color + "_user" + " .timer_border_left");
  if (left_border != null) {
    left_border.remove(left_border);
    var bottom_border = document.querySelector("#" + color + "_user" + " .timer_border_bottom");
    bottom_border.remove(bottom_border);
    var right_border = document.querySelector("#" + color + "_user" + " .timer_border_right");
    right_border.remove(right_border);
    var top_border = document.querySelector("#" + color + "_user" + " .timer_border_top");
    top_border.remove(top_border);
  }
  for (var z = 0; z < timer_settimeouts.length; z++) {
    clearTimeout(timer_settimeouts[z]);
  }
  var highlight = document.querySelectorAll(".highlight_" + turn_of_the_player);
  for (var z = 0; z < highlight.length; z++) {
    var color = get_color_from_idx(turn_of_the_player);
    highlight[z].classList.remove("light_" + color);
  }
}

function enable_dice() {
  // no_of_dice_rolls_till_now ++;
  // if (no_of_dice_rolls_till_now > 5) {
  //   return;
  // }
  count_to_avoid_race_conditions++;
  tokens_inside_home = [];
  tokens_outside_home = [];
  player_has_left = false;
  if (
    total_players == 1 &&
    document.querySelectorAll("#winner_" + turn_of_the_player + " img").length == 0 &&
    rank != 4
  ) {
    remove_all_tokens_of_this_player();
    var winner_img = set_img_at_given_place_id(
      winner_images_directory_path,
      rank,
      "",
      "winner_" + turn_of_the_player
    );
    winner_img.classList.add("winner");
    return;
  }
  token_is_running = false;
  dices[turn_of_the_player].style.display = "block";
  dices[(turn_of_the_player + 1) % 4].style.display = "none";
  dices[(turn_of_the_player + 2) % 4].style.display = "none";
  dices[(turn_of_the_player + 3) % 4].style.display = "none";

  if (game_over) {
    return;
  }
  var color = get_color_from_idx(turn_of_the_player);
  var available = document.getElementsByClassName("tokens_of_" + turn_of_the_player);
  if (available.length == 0) {
    player_has_left = true;
    call_to_next_player();
  } else {
    document.querySelector("#"+ color + "_dice_container" + " img").classList.add("dice_margin");
    document.querySelector("#"+ color + "_dice_container").classList.add("dice_border_animation");
    dices[turn_of_the_player].addEventListener("click", roll_dice);
    timing();
    if (document.getElementById("run_automatically_switch_input").checked == true) {
      setTimeout(function () {
        dices[turn_of_the_player].click();
      }, 1000);
    }
  }
}
function enable_pointer_event() {
  var all_tokens = document.querySelectorAll(
    ".tokens_of_0,.tokens_of_1,.tokens_of_2,.tokens_of_3"
  );
  var all_dices = document.querySelectorAll(".dice");
  for (var z = 0; z < all_tokens.length; z++) {
    all_tokens[z].classList.remove("disable_pointer_event");
  }
  for (var z = 0; z < all_dices.length; z++) {
    all_dices[z].classList.remove("disable_pointer_event");
  }
}
function disable_pointer_event() {
  var all_tokens = document.querySelectorAll(
    ".tokens_of_0,.tokens_of_1,.tokens_of_2,.tokens_of_3"
  );
  var all_dices = document.querySelectorAll(".dice");
  for (var z = 0; z < all_tokens.length; z++) {
    all_tokens[z].classList.add("disable_pointer_event");
  }
  for (var z = 0; z < all_dices.length; z++) {
    all_dices[z].classList.add("disable_pointer_event");
  }
}

document.getElementById("run_automatically_switch_input").addEventListener("change", function () {
  if (this.checked) {
    disable_pointer_event();
    leave_stage(false);
  } else {
    enable_pointer_event();
  }
});
