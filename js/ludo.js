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
    disable_pointer_event_for_dices_and_tokens();
  } else {
    enable_pointer_event_for_dices_and_tokens();
  }
}
set_pointer_event_depending_on_automatic_or_not();
enable_dice();  // Entry point. All magic starts from here.

function check_if_token_can_be_moved(outside_token) {
  var current_cell_id = outside_token.parentNode.getAttribute("id");  // e.g., "cell_312".
  var n = parseInt(current_cell_id.substring(6)) + random_dice;
  if (n < 19) {  // Check "images/cell_ids_explanation.png" for better understanding.
    return true;
  }
  return false;
}
function set_at_least_one_outside_token_can_be_moved_and_remove_animation_for_outside_tokens_that_can_not_be_moved() {
  at_least_one_outside_token_can_be_moved = false;
  tokens_outside_home.forEach(function (outside_token) {
    if (check_if_token_can_be_moved(outside_token)) {
      at_least_one_outside_token_can_be_moved = true;
    } else {
      outside_token.parentNode.classList.remove("outside_token_animation");
      outside_token.removeEventListener("click", move_token);
    }
  });
}
function automatically_run_token(passed_count_to_avoid_race_conditions) {
  if (passed_count_to_avoid_race_conditions < count_to_avoid_race_conditions) {  // If count_to_avoid_race_conditions is increased, then it means another action has already run the token. So, don't run in this function.
    return;
  }
  count_to_avoid_race_conditions++;  // To avoid race conditions.
  if (tokens_inside_home.length != 0) {
    setTimeout(function () {
      if (passed_count_to_avoid_race_conditions + 1 == count_to_avoid_race_conditions && !token_is_running) {
        tokens_inside_home[0].click();
      }
    }, 1000);
  } else if (at_least_one_outside_token_can_be_moved && tokens_outside_home.length != 0) {
    setTimeout(function () {
      for (var z = 0; z < tokens_outside_home.length && !token_is_running; z++) {
        if (check_if_token_can_be_moved(tokens_outside_home[z]) && passed_count_to_avoid_race_conditions + 1 == count_to_avoid_race_conditions) {
          tokens_outside_home[z].click();
          break;
        }
      }
    }, 1000);
  }
}
function add_event_listener_for_tokens(){
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
}
function add_animation_for_tokens(){
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
}
function roll_dice() {
  dices[turn_of_the_player].removeEventListener("click", roll_dice);
  random_dice = Math.floor(6 * Math.random()) + 1;
  // random_dice = 6;
  add_event_listener_for_tokens();  // This is needed here so that "automatically_run_token" can work correctly if called in case of timeout.
  set_at_least_one_outside_token_can_be_moved_and_remove_animation_for_outside_tokens_that_can_not_be_moved(); // This is needed here so that "automatically_run_token" can work correctly if called in case of timeout.
  var time = 0;
  for (var z = 0; z < 6 + random_dice; z++) {  // Used for animation: suppose random_dice = 3. Then first show dice_1.png and wait for some time, then show dice_2.png and wait for some time, ..., then show dice_6.png and wait for some time, then show dice_1.png and wait for some time, ..., then show dice_3.png and stop.
    setTimeout(
      function (z, passed_count_to_avoid_race_conditions) {
        dices[turn_of_the_player].src = "./images/dices/" + ((z % 6) + 1) + ".png";
        if (z >= 6 && (z % 6) + 1 == random_dice) {  // The animation stops here.
          var color = get_color_from_idx(turn_of_the_player);
          document
            .querySelector("#" + color + "_dice_container" + " img")
            .classList.remove("dice_margin");
          document
            .querySelector("#" + color + "_dice_container")
            .classList.remove("dice_border_animation");
          
          if (
            (random_dice == 6 &&
              tokens_inside_home.length == 0 &&
              !at_least_one_outside_token_can_be_moved) ||
            (random_dice != 6 && !at_least_one_outside_token_can_be_moved)
          ) {
            disable_progressbar();
            turn_of_the_player++;
            turn_of_the_player = turn_of_the_player % 4;
            dices[turn_of_the_player].src = "./images/dices/" + random_dice + ".png";
            setTimeout(enable_dice, 500);
            return;
          }

          add_animation_for_tokens();
          set_at_least_one_outside_token_can_be_moved_and_remove_animation_for_outside_tokens_that_can_not_be_moved();
          if (document.getElementById("run_automatically_switch_input").checked) {
            automatically_run_token(passed_count_to_avoid_race_conditions);
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

function make_two_digits_number(number) {
  number = number.toString();
  if (number.length == 1) {
    return "0" + number;
  }
  return number;
}

function previous_address(current_cell_id, related_circle_id) {
  if (current_cell_id == related_circle_id) {
    return 0;
  }
  var count = parseInt(current_cell_id.substring(6)) - 1;
  var place_tag = parseInt(current_cell_id.substring(5, 6));

  if (place_tag != turn_of_the_player && count < 0) {
    count = 12;
    if (place_tag == 0) {
      place_tag = 3;
    } else {
      place_tag = (place_tag - 1) % 4;
    }
  }
  if (count == -1) {
    return related_circle_id;
  }
  var number = make_two_digits_number(count);
  var token_place_id = "cell_" + place_tag + number;
  return token_place_id;
}
function next_address(current_cell_id, steps) {
  var count = parseInt(current_cell_id.substring(6)) + steps;
  var place_tag = parseInt(current_cell_id.substring(5, 6));
  if (count == 12) {
    var temp_place_tag = (place_tag + 1) % 4;
    if (temp_place_tag == turn_of_the_player) {
      count = count + 1;
      place_tag = temp_place_tag;
    }
  } else if (count > 12) {
    var temp_count = count;
    count = count - 13;
    if (current_cell_id.substring(6) < 13) {
      place_tag = (place_tag + 1) % 4;
    } else {
      temp_count--;
    }
    if (place_tag == turn_of_the_player) {
      count = temp_count + 1;
    }
  }

  var number = make_two_digits_number(count);
  var token_place_id = "cell_" + place_tag + number;
  if (number == 18) {
    var color = get_color_from_idx(turn_of_the_player);
    token_place_id = "destination_for_" + color + "_tokens";
  }
  return [token_place_id, number];
}
function call_to_next_player(count) {
  disable_progressbar();
  if (
    total_players == 1 ||
    player_has_left ||
    (random_dice != 6 && count != 18 && !again_the_same_players_turn)
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
function set_img_at_given_place_id(img_src, color, related_circle_id, place_id) {
  var img = document.createElement("img");
  img.src = img_src + color + ".png";
  img.alt = related_circle_id;
  var src = document.getElementById(place_id);
  src.appendChild(img);
  return img;
}
function get_idx_from_color(color) {
  if (color == "green") {
    return 0;
  }
  else if (color == "yellow") {
    return 1;
  }
  else if (color == "blue") {
    return 2;
  }
  else if (color == "red") {
    return 3;
  }
}
function backword(current_cell_id, related_circle_id, last_token) {
  var time = 0;
  var color_name = related_circle_id.split("_");
  var player_id = get_idx_from_color(color_name[0]);
  var k = previous_address(current_cell_id, related_circle_id);
  while (k != 0) {
    setTimeout(
      function (k, current_cell_id, player_id, related_circle_id) {
        var tt = document.querySelector(
          "#" + current_cell_id + " img[alt=" + related_circle_id + "]"
        );
        tt.remove(tt);
        var color = get_color_from_idx(player_id);
        var img = set_img_at_given_place_id(token_images_directory_path, color, related_circle_id, k);
        if (k == related_circle_id) {
          img.classList.add("single_token");
          img.classList.add("tokens_of_" + player_id);
          if (last_token == related_circle_id) {
            call_to_next_player();
          }
        } else {
          img.classList.add("running_token");
        }
      },
      time,
      k,
      current_cell_id,
      player_id,
      related_circle_id
    );
    time = time + 35;
    current_cell_id = k;
    k = previous_address(k, related_circle_id);
  }
}
function set_positions(token_place_id, count, img, p_total_token, related_circle_id) {
  var safe = document.querySelector("#" + token_place_id + ".safe img");
  again_the_same_players_turn = false;
  if (safe == null && p_total_token.length > 0) {
    var last_token = p_total_token[p_total_token.length - 1].getAttribute(
      "alt"
    );
    var color_name = related_circle_id.split("_");
    var idx_of_alt = get_idx_from_color(color_name[0]);
    p_total_token.forEach(function (item) {
      var alt_name = item.getAttribute("alt");
      var color_name = alt_name.split("_");
      var idx_of_alt_name = get_idx_from_color(color_name[0]);
      if (
        idx_of_alt != idx_of_alt_name &&
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
  current_cell_id,
  token_place_id,
  count,
  related_circle_id,
  previously_total_token
) {
  var p_total_token = document.querySelectorAll("#" + token_place_id + " img");
  var step = 1;
  var id_n_count = next_address(current_cell_id, step);
  var next_id = id_n_count[0];
  var time = 200;
  var color = get_color_from_idx(turn_of_the_player);
  if (current_cell_id == token_place_id) {
    var img = set_img_at_given_place_id(token_images_directory_path, color, related_circle_id, token_place_id);
    img.classList.add("tokens_of_" + turn_of_the_player);
    img.classList.add("outside");
    set_pointer_event_depending_on_automatic_or_not();
    set_remainin_token(token_place_id, p_total_token, 0);
    call_to_next_player();
    return;
  }
  var span = document.createElement("span");
  span.classList.add("running_" + color + "_token_animation");
  document.getElementById(current_cell_id).appendChild(span);
  var temp_current_id = current_cell_id;
  while (current_cell_id !== token_place_id) {
    setTimeout(
      function (next_id, current_cell_id, turn_of_the_player, related_circle_id) {
        var remove_token = document.querySelector(
          "#" + current_cell_id + " img[alt=" + related_circle_id + "]"
        );
        remove_token.remove(remove_token);
        var remove_animation;
        setTimeout(
          function (current_cell_id, turn_of_the_player) {
            var color = get_color_from_idx(turn_of_the_player);
            remove_animation = document.querySelector(
              "#" + current_cell_id + " span.running_" + color + "_token_animation"
            );
            remove_animation.remove(remove_animation);
          },
          500,
          current_cell_id,
          turn_of_the_player
        );
        if (temp_current_id === current_cell_id) {
          set_remainin_token(temp_current_id, previously_total_token, 0);
        }
        var img = set_img_at_given_place_id(token_images_directory_path, color, related_circle_id, next_id);
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
          set_positions(token_place_id, count, img, p_total_token, related_circle_id);
        }
      },
      time,
      next_id,
      current_cell_id,
      turn_of_the_player,
      related_circle_id
    );
    time = time + 200;
    current_cell_id = next_id;
    id_n_count = next_address(next_id, step);
    next_id = id_n_count[0];
  }
}

function move_token(event_inn) {
  token_is_running = true;
  remove_event_listener_for_tokens();
  count_to_avoid_race_conditions++;
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].parentNode.classList.remove("home_token_animation");
  }
  for (var z = 0; z < tokens_outside_home.length; z++) {
    tokens_outside_home[z].parentNode.classList.remove(
      "outside_token_animation"
    );
  }
  var current_cell_id = event_inn.target.parentNode.getAttribute("id");
  var id_n_count = next_address(current_cell_id, random_dice);
  var token_place_id = id_n_count[0];
  var count = id_n_count[1];
  var previously_total_token = document.querySelectorAll(
    "#" + current_cell_id + " img"
  );
  var related_circle_id = event_inn.target.getAttribute("alt");
  run_token(
    current_cell_id,
    token_place_id,
    count,
    related_circle_id,
    previously_total_token
  );
}

function remove_event_listener_for_tokens() {
  tokens_inside_home.forEach(function (items) {
    items.removeEventListener("click", six_token);
  });
  tokens_outside_home.forEach(function (items) {
    items.removeEventListener("click", move_token);
  });
}
function six_token(event_inn) {
  token_is_running = true;
  remove_event_listener_for_tokens();
  count_to_avoid_race_conditions++;
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].parentNode.classList.remove("home_token_animation");
  }
  for (var z = 0; z < tokens_outside_home.length; z++) {
    tokens_outside_home[z].parentNode.classList.remove(
      "outside_token_animation"
    );
  }
  var related_circle_id = event_inn.target.getAttribute("alt");
  event_inn.target.remove(event_inn.target);
  var token_place_id = "cell_" + turn_of_the_player.toString() + "00";
  run_token(token_place_id, token_place_id, 0, related_circle_id);
}

function set_remainin_token(current_cell_id, p_total_token, count) {
  var a_total_token = document.querySelectorAll(
    "#" + current_cell_id + " img"
  );
  a_total_token_length = a_total_token.length;
  var color = get_color_from_idx(turn_of_the_player);
  if (a_total_token_length == 1) {
    if (count == 18) {
      a_total_token[0].classList.add("single_" + color + "_token_inside_destination");
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
    document.getElementById(current_cell_id).classList.remove("cell_containing_" + k + "_tokens");
  }
  for (var k = 0; a_total_token_length > 1 && k < a_total_token_length; k++) {
    a_total_token[k].classList.remove("single_token");
  }
  if (a_total_token_length > 1 && count != 18) {
    document
      .getElementById(current_cell_id)
      .classList.add("cell_containing_" + a_total_token_length + "_tokens");
  }
}
function remove_all_tokens_of_this_player() {
  var color = get_color_from_idx(turn_of_the_player);
  document.querySelector("#" + color + "_dice_container" + " img").classList.remove("dice_margin");
  document.querySelector("#" + color + "_dice_container").classList.remove("dice_border_animation");
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
    var current_cell_id = toc2[z].parentNode.getAttribute("id");
    var p_total_token = document.querySelectorAll(
      "#" + current_cell_id + " img"
    );
    toc2[z].remove(toc2[z]);
    set_remainin_token(current_cell_id, p_total_token, 0);
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
  if (!token_is_running) {
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
      function (passed_count_to_avoid_race_conditions) {
        automatically_run_token(passed_count_to_avoid_race_conditions);
      },
      (7 + random_dice) * 50,
      count_to_avoid_race_conditions
    );
  }
}
function highlight_stage(string, highlight, time) {
  var color = get_color_from_idx(turn_of_the_player);
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
    document.querySelector("#" + color + "_dice_container" + " img").classList.add("dice_margin");
    document.querySelector("#" + color + "_dice_container").classList.add("dice_border_animation");
    dices[turn_of_the_player].addEventListener("click", roll_dice);
    timing();
    if (document.getElementById("run_automatically_switch_input").checked) {
      setTimeout(function () {
        dices[turn_of_the_player].click();
      }, 1000);
    }
  }
}
function enable_pointer_event_for_dices_and_tokens() {
  var all_tokens = document.querySelectorAll(
    ".tokens_of_0,.tokens_of_1,.tokens_of_2,.tokens_of_3"
  );
  var all_dices = document.querySelectorAll(".dice");
  for (var z = 0; z < all_tokens.length; z++) {
    all_tokens[z].classList.remove("disable_pointer_event_for_dices_and_tokens");
  }
  for (var z = 0; z < all_dices.length; z++) {
    all_dices[z].classList.remove("disable_pointer_event_for_dices_and_tokens");
  }
}
function disable_pointer_event_for_dices_and_tokens() {
  var all_tokens = document.querySelectorAll(
    ".tokens_of_0,.tokens_of_1,.tokens_of_2,.tokens_of_3"
  );
  var all_dices = document.querySelectorAll(".dice");
  for (var z = 0; z < all_tokens.length; z++) {
    all_tokens[z].classList.add("disable_pointer_event_for_dices_and_tokens");
  }
  for (var z = 0; z < all_dices.length; z++) {
    all_dices[z].classList.add("disable_pointer_event_for_dices_and_tokens");
  }
}

document.getElementById("run_automatically_switch_input").addEventListener("change", function () {
  if (this.checked) {
    disable_pointer_event_for_dices_and_tokens();
    leave_stage(false);
  } else {
    enable_pointer_event_for_dices_and_tokens();
  }
});
