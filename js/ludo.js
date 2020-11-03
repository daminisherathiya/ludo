var dices = [
  document.getElementById("green_dice"),
  document.getElementById("yellow_dice"),
  document.getElementById("blue_dice"),
  document.getElementById("red_dice"),
];
var dice_images_directory_path = "./images/dices/";
var token_images_directory_path = "./images/tokens/";
var left_user_images_directory_path = "./images/left_users/";
var winner_images_directory_path = "./images/winners/";

var total_players = 4;
var turn_of_the_player = 0;  // 0 => green, 1=> blue, 2 => yellow, 3 => red.
var manual_player_id = 3;
var current_player_color;
var current_player_has_left = false;
var automatic_turns_used = [0, 0, 0, 0];  // 0 => green, 1=> blue, 2 => yellow, 3 => red.
var again_the_same_players_turn = false;  // When the player gets 6 upon the dice roll, or kills other player's tokens, etc.

var random_dice = Math.floor(6 * Math.random()) + 1;
dices[turn_of_the_player].src = dice_images_directory_path + random_dice + ".png";  // Show a random dice for the green player upon start.
var tokens_inside_home = [];
var tokens_outside_home = [];
var at_least_one_outside_token_can_be_moved = false;
var rank_to_be_given_next = 1;

var no_of_dice_rolls_till_now = 0;
var game_is_over = false;

var count_to_avoid_race_conditions = 0;
var token_is_running = false;  // Used to avoid race conditions.
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
      outside_token.removeEventListener("click", event_listner_for_outside_tokens);
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

function add_event_listener_for_tokens() {
  if (random_dice == 6) {
    tokens_inside_home = document.querySelectorAll(".circle .tokens_of_" + turn_of_the_player);
    tokens_inside_home.forEach(function (item) {
      item.addEventListener("click", event_listner_for_home_tokens);
    });
  }
  tokens_outside_home = document.querySelectorAll(
    "td .tokens_of_" + turn_of_the_player + ".outside"
  );
  tokens_outside_home.forEach(function (item) {
    item.addEventListener("click", event_listner_for_outside_tokens);
  });
}

function add_animation_for_tokens() {
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
  set_at_least_one_outside_token_can_be_moved_and_remove_animation_for_outside_tokens_that_can_not_be_moved();  // This is needed here so that "automatically_run_token" can work correctly if called in case of timeout.
  var time = 0;
  for (var z = 0; z < 6 + random_dice; z++) {  // Used for animation: suppose random_dice = 3. Then first show dice_1.png and wait for some time, then show dice_2.png and wait for some time, ..., then show dice_6.png and wait for some time, then show dice_1.png and wait for some time, ..., then show dice_3.png and stop.
    setTimeout(
      function (z, passed_count_to_avoid_race_conditions) {
        dices[turn_of_the_player].src = "./images/dices/" + ((z % 6) + 1) + ".png";
        if (z >= 6 && (z % 6) + 1 == random_dice) {  // The animation stops here.
          document
            .querySelector("#" + current_player_color + "_dice_container" + " img")
            .classList.remove("dice_margin");
          document
            .querySelector("#" + current_player_color + "_dice_container")
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
          if (document.getElementById("run_automatically_switch_input").checked || (!document.getElementById("run_automatically_switch_input").checked && turn_of_the_player != manual_player_id)) {
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

function get_previous_cell_id(current_cell_id, player_id_of_token, related_circle_id_of_token) {
  if (current_cell_id == related_circle_id_of_token) {
    return 0;
  }
  // Check "images/cell_ids_explanation.png" for better understanding.
  var previous_cell_id_last_two_digits = parseInt(current_cell_id.substring(6)) - 1;
  var current_cell_id_region = parseInt(current_cell_id.substring(5, 6));

  if (player_id_of_token == current_cell_id_region && previous_cell_id_last_two_digits == -1) {
    return related_circle_id_of_token;
  }
  if (player_id_of_token != current_cell_id_region && previous_cell_id_last_two_digits == -1) {
    previous_cell_id_last_two_digits = 12;
    previous_cell_id_region  = (current_cell_id_region - 1 + 4) % 4;
    return "cell_" + previous_cell_id_region  + make_two_digits_number(previous_cell_id_last_two_digits);
  }
  return "cell_" + current_cell_id_region + make_two_digits_number(previous_cell_id_last_two_digits);
}

function get_next_cell_id(current_cell_id) {
  // Check "images/cell_ids_explanation.png" for better understanding.
  var next_cell_id_last_two_digits = parseInt(current_cell_id.substring(6)) + 1;
  var current_cell_id_region = parseInt(current_cell_id.substring(5, 6));
  var next_cell_id_region = (current_cell_id_region + 1) % 4;

  if (next_cell_id_last_two_digits == 18) {
    return "destination_for_" + current_player_color + "_tokens";
  } else if (next_cell_id_last_two_digits == 12) {
    if (next_cell_id_region == turn_of_the_player) {
      next_cell_id_last_two_digits++;
      return "cell_" + next_cell_id_region + make_two_digits_number(next_cell_id_last_two_digits); 
    } else {
      return "cell_" + current_cell_id_region + make_two_digits_number(next_cell_id_last_two_digits);
    }
  } else if (next_cell_id_last_two_digits == 13) {
    next_cell_id_last_two_digits = 0;
    return "cell_" + next_cell_id_region + make_two_digits_number(next_cell_id_last_two_digits);
  } else {
    return "cell_" + current_cell_id_region + make_two_digits_number(next_cell_id_last_two_digits);
  }
}

function disable_progressbar_and_call_to_next_player(is_destination_cell=false) {
  disable_progressbar();
  if (
    total_players == 1 ||
    current_player_has_left ||
    (random_dice != 6 && !is_destination_cell && !again_the_same_players_turn)
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

function add_image_as_child_for_given_place_id(img_src, current_player_color, related_circle_id_of_token, place_id) {
  var img = document.createElement("img");
  img.src = img_src + current_player_color + ".png";
  img.alt = related_circle_id_of_token;
  var src = document.getElementById(place_id);
  src.appendChild(img);
  return img;
}

function get_idx_from_color(current_player_color) {
  if (current_player_color == "green") {
    return 0;
  }
  else if (current_player_color == "yellow") {
    return 1;
  }
  else if (current_player_color == "blue") {
    return 2;
  }
  else if (current_player_color == "red") {
    return 3;
  }
}

function send_token_to_home(current_cell_id, related_circle_id_of_token, is_last_token) {
  var time = 0;
  var color_name = related_circle_id_of_token.split("_")[0];
  var player_id = get_idx_from_color(color_name);
  var previous_cell_id = get_previous_cell_id(current_cell_id, player_id, related_circle_id_of_token);
  while (previous_cell_id != 0) {
    setTimeout(
      function (previous_cell_id, current_cell_id) {
        var related_token_in_current_cell = document.querySelector(
          "#" + current_cell_id + " img[alt=" + related_circle_id_of_token + "]"
        );
        related_token_in_current_cell.remove();
        var token = add_image_as_child_for_given_place_id(token_images_directory_path, color_name, related_circle_id_of_token, previous_cell_id);
        if (previous_cell_id == related_circle_id_of_token) {
          token.classList.add("single_token");
          token.classList.add("tokens_of_" + player_id);
          if (is_last_token) {  // If two tokens are killed, then execute this only for the last token.
            disable_progressbar_and_call_to_next_player();
          }
        } else {
          token.classList.add("running_token");
        }
      },
      time,
      previous_cell_id,
      current_cell_id,
    );
    time = time + 35;
    current_cell_id = previous_cell_id;
    previous_cell_id = get_previous_cell_id(previous_cell_id, player_id, related_circle_id_of_token);
  }
}

function set_token_at_target_cell(target_cell_id, token_to_set, tokens_already_present_in_target_cell) {
  var is_safe_cell = document.querySelector("#" + target_cell_id + ".safe img");
  var is_destination_cell = target_cell_id.indexOf("destination") != -1;
  again_the_same_players_turn = false;
  if (is_safe_cell == null && tokens_already_present_in_target_cell.length > 0) {
    tokens_already_present_in_target_cell.forEach(function (item, idx, arr) {
      var already_present_token_alt = item.getAttribute("alt");
      var already_present_token_color = item.getAttribute("alt").split("_")[0];
      if (
        already_present_token_color != current_player_color &&
        item.getAttribute("class") != "running_token"
      ) {
        again_the_same_players_turn = true;
        send_token_to_home(target_cell_id, already_present_token_alt, idx === arr.length - 1);
      }
    });
  }
  setTimeout(function () {
    if (!is_destination_cell) {
      token_to_set.classList.add("tokens_of_" + turn_of_the_player);
    } else if (
      is_destination_cell &&
      document.getElementsByClassName("tokens_of_" + turn_of_the_player).length == 0
    ) {
      make_winner();
      rank_to_be_given_next++;
      if (rank_to_be_given_next == 4) {
        game_is_over = true;
      }
    }
    token_to_set.classList.add("outside");
    token_to_set.classList.remove("running_token");
    set_pointer_event_depending_on_automatic_or_not();
    update_cell_and_cell_tokens(target_cell_id);
    if (!again_the_same_players_turn) {
      disable_progressbar_and_call_to_next_player(is_destination_cell);
    }
  }, 1);
}

function run_token(current_cell_id, target_cell_id, related_circle_id_of_token) {
  if (current_cell_id == target_cell_id) {
    var token = add_image_as_child_for_given_place_id(token_images_directory_path, current_player_color, related_circle_id_of_token, target_cell_id);
    token.classList.add("tokens_of_" + turn_of_the_player);
    token.classList.add("outside");
    set_pointer_event_depending_on_automatic_or_not();
    update_cell_and_cell_tokens(target_cell_id);
    disable_progressbar_and_call_to_next_player();
    return;
  }
  var span_containing_animation_for_running_token = document.createElement("span");
  span_containing_animation_for_running_token.classList.add("running_" + current_player_color + "_token_animation");
  document.getElementById(current_cell_id).appendChild(span_containing_animation_for_running_token);
  var next_cell_id = get_next_cell_id(current_cell_id);
  var time = 200;
  var is_first_iteration = true;
  var tokens_already_present_in_target_cell = document.querySelectorAll("#" + target_cell_id + " img");
  while (current_cell_id !== target_cell_id) {
    setTimeout(
      function (next_cell_id, current_cell_id, current_player_color, related_circle_id_of_token) {
        var token_in_current_cell = document.querySelector(
          "#" + current_cell_id + " img[alt=" + related_circle_id_of_token + "]"
        );
        token_in_current_cell.remove();
        setTimeout(
          function (current_cell_id, current_player_color) {
            span_containing_animation_for_running_token_in_current_cell = document.querySelector(
              "#" + current_cell_id + " span.running_" + current_player_color + "_token_animation"
            );
            span_containing_animation_for_running_token_in_current_cell.remove();
          },
          500,
          current_cell_id,
          current_player_color
        );
        if (is_first_iteration) {
          is_first_iteration = false;
          update_cell_and_cell_tokens(current_cell_id);
        }
        var token_in_next_cell = add_image_as_child_for_given_place_id(token_images_directory_path, current_player_color, related_circle_id_of_token, next_cell_id);
        var span_containing_animation_for_running_token_in_next_cell = document.createElement("span");
        var src = document.getElementById(next_cell_id);
        src.appendChild(span_containing_animation_for_running_token_in_next_cell);
        span_containing_animation_for_running_token_in_next_cell.classList.add("running_" + current_player_color + "_token_animation");
        token_in_next_cell.classList.add("running_token");
        if (next_cell_id == target_cell_id) {
          var span_containing_animation_for_running_token_in_target_cell = document.querySelector(
            "#" + target_cell_id + " span.running_" + current_player_color + "_token_animation"
          );
          span_containing_animation_for_running_token_in_target_cell.remove();
          set_token_at_target_cell(target_cell_id, token_in_next_cell, tokens_already_present_in_target_cell);
        }
      },
      time,
      next_cell_id,
      current_cell_id,
      current_player_color,
      related_circle_id_of_token
    );
    time = time + 200;
    current_cell_id = next_cell_id;
    next_cell_id = get_next_cell_id(next_cell_id);
  }
}

function event_listner_for_outside_tokens(event) {
  token_is_running = true;
  remove_event_listener_for_tokens();
  count_to_avoid_race_conditions++;
  remove_animation_from_tokens();
  var current_cell_id = event.target.parentNode.getAttribute("id");
  var target_cell_id = current_cell_id;
  for (var z = 0; z < random_dice; z++) {
    target_cell_id = get_next_cell_id(target_cell_id);
  }
  var related_circle_id_of_token = event.target.getAttribute("alt");
  run_token(current_cell_id, target_cell_id, related_circle_id_of_token);
}

function remove_event_listener_for_tokens() {
  tokens_inside_home.forEach(function (items) {
    items.removeEventListener("click", event_listner_for_home_tokens);
  });
  tokens_outside_home.forEach(function (items) {
    items.removeEventListener("click", event_listner_for_outside_tokens);
  });
}

function event_listner_for_home_tokens(event) {
  token_is_running = true;
  remove_event_listener_for_tokens();
  count_to_avoid_race_conditions++;
  remove_animation_from_tokens();
  var related_circle_id_of_token = event.target.getAttribute("alt");
  event.target.remove();
  var target_cell_id = "cell_" + turn_of_the_player.toString() + "00";
  run_token(target_cell_id, target_cell_id, related_circle_id_of_token);
}

function update_cell_and_cell_tokens(current_cell_id) {
  var tokens_in_current_cell = document.querySelectorAll(
    "#" + current_cell_id + " img"
  );
  number_of_tokens_in_current_cell = tokens_in_current_cell.length;
  var is_destination_cell = current_cell_id.indexOf("destination") != -1;
  if (number_of_tokens_in_current_cell == 1) {
    if (is_destination_cell) {
      tokens_in_current_cell[0].classList.add("single_" + current_player_color + "_token_inside_destination");
    } else {
      tokens_in_current_cell[0].classList.remove("multiple_tokens");
      tokens_in_current_cell[0].classList.add("single_token");
    }
  } else {
    tokens_in_current_cell.forEach(function (item) {
      if (!is_destination_cell) {
        item.classList.add("multiple_tokens");
      } else {
        item.classList.add("destination_containing_" + number_of_tokens_in_current_cell + "_tokens");
      }
    });
  }
  if (is_destination_cell &&  tokens_in_current_cell.length > 1) {
    for(var z = 0 ; z < tokens_in_current_cell.length; z++) {
      tokens_in_current_cell[z].classList.remove("single_" + current_player_color + "_token_inside_destination");
    }
  }
  for (var z = 2; z < 5; z++) {
    document.getElementById(current_cell_id).classList.remove("cell_containing_" + z + "_tokens");
  }
  if (number_of_tokens_in_current_cell > 1) {
    for (var z = 0; z < number_of_tokens_in_current_cell; z++) {
      tokens_in_current_cell[z].classList.remove("single_token");
    }
  }
  if (number_of_tokens_in_current_cell > 1 && !is_destination_cell) {
    document
      .getElementById(current_cell_id)
      .classList.add("cell_containing_" + number_of_tokens_in_current_cell + "_tokens");
  }
}
function remove_animation_from_tokens(){
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].parentNode.classList.remove("home_token_animation");
  }
  for (var z = 0; z < tokens_outside_home.length; z++) {
    tokens_outside_home[z].parentNode.classList.remove(
      "outside_token_animation"
    );
  }
}
function remove_all_animation_and_tokens_of_current_player() {
  document.querySelector("#" + current_player_color + "_dice_container" + " img").classList.remove("dice_margin");
  document.querySelector("#" + current_player_color + "_dice_container").classList.remove("dice_border_animation");
  remove_animation_from_tokens();
  tokens_inside_home = document.querySelectorAll(".circle .tokens_of_" + turn_of_the_player);
  for (var z = 0; z < tokens_inside_home.length; z++) {
    tokens_inside_home[z].remove();
  }

  tokens_outside_home = document.querySelectorAll("td .tokens_of_" + turn_of_the_player + ".outside");
  for (var z = 0; z < tokens_outside_home.length; z++) {
    var current_cell_id = tokens_outside_home[z].parentNode.getAttribute("id");
    tokens_outside_home[z].remove();
    update_cell_and_cell_tokens(current_cell_id);
  }

  var tokens_inside_destination = document.querySelectorAll("#destination_for_" + current_player_color + "_tokens" + " img");
  for (var z = 0; z < tokens_inside_destination.length; z++) {
    tokens_inside_destination[z].remove();
  }
}

function kickout_player() {
  remove_all_animation_and_tokens_of_current_player();
  var left_img = add_image_as_child_for_given_place_id(left_user_images_directory_path, current_player_color, "", "left_user_" + turn_of_the_player);
  left_img.classList.add("left_user");
  total_players--;
  current_player_has_left = true;
  disable_progressbar_and_call_to_next_player();
}

function automatically_roll_dice_and_run_token(increase_dot = true) {
  if (!token_is_running) {  // If we enable "Run Automatically" and at the same time the timer finishes, then this function can be called two times. So, to avoid such race conditions, this condition is used.
    if (increase_dot) {
      if (automatic_turns_used[turn_of_the_player] == 5) {
        kickout_player();
        return;
      }
      var dot = document.querySelector("#dot_of_" + current_player_color + "_" + automatic_turns_used[turn_of_the_player]);
      dot.style.background = "#f51c40";
      automatic_turns_used[turn_of_the_player]++;
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

function setup_timer_border_and_home_boarders_animation(timer_border_side, home_borders, time) {
  var border = document.querySelector("#" + current_player_color + "_user" + " div.timer_border_" + timer_border_side);
  var border_length = 99;
  while (border_length >= 0) {
    var time_out = setTimeout(
      function (border_length) {
        if (timer_border_side == "left" || timer_border_side == "right") {
          border.style.height = border_length + "%";
        } else {
          border.style.width = border_length + "%";
        }
        for (var z = 0; z < home_borders.border_length && border_length % 15 == 0; z++) {
          home_borders[z].classList.toggle("light_" + current_player_color);
        }
        if (border_length == 0 && timer_border_side == "top") {
          automatically_roll_dice_and_run_token();
        }
      },
      time,
      border_length
    );
    border_length--;
    time = time + 15;
    timer_settimeouts.push(time_out);  // Used to remove animation once the user has taken their turn.
  }
  return time;
}

function add_progressbar(border_class) {
  var new_div = document.createElement("div");
  var user = document.getElementById(current_player_color + "_user");
  user.appendChild(new_div);
  new_div.classList.add(border_class);
}

function start_timer() {
  // The timer border is made using 4 different divs. One div will have the left border, one will have the bottom border, one will have the right border, and one will have the top border.
  add_progressbar("timer_border_left");
  add_progressbar("timer_border_bottom");
  add_progressbar("timer_border_right");
  add_progressbar("timer_border_top");
  timer_settimeouts = [];
  var home_borders = document.querySelectorAll(".highlight_" + current_player_color);
  var time = 50;
  time = setup_timer_border_and_home_boarders_animation("left", home_borders, time);
  time = setup_timer_border_and_home_boarders_animation("bottom", home_borders, time);
  time = setup_timer_border_and_home_boarders_animation("right", home_borders, time);
  setup_timer_border_and_home_boarders_animation("top", home_borders, time);
}

function disable_progressbar() {
  var left_border = document.querySelector("#" + current_player_color + "_user" + " .timer_border_left");
  if (left_border != null) {
    left_border.remove();
    var bottom_border = document.querySelector("#" + current_player_color + "_user" + " .timer_border_bottom");
    bottom_border.remove();
    var right_border = document.querySelector("#" + current_player_color + "_user" + " .timer_border_right");
    right_border.remove();
    var top_border = document.querySelector("#" + current_player_color + "_user" + " .timer_border_top");
    top_border.remove();
  }
  for (var z = 0; z < timer_settimeouts.length; z++) {
    clearTimeout(timer_settimeouts[z]);
  }
  var home_borders = document.querySelectorAll(".highlight_" + current_player_color);
  for (var z = 0; z < home_borders.length; z++) {
    home_borders[z].classList.remove("light_" + current_player_color);
  }
}

function make_winner() {
  current_player_has_left = true;
  total_players--;
  var winner_img = add_image_as_child_for_given_place_id(
    winner_images_directory_path,
    rank_to_be_given_next,
    "",
    "winner_" + turn_of_the_player
  );
  winner_img.classList.add("winner");
}

function set_dices_display_style() {
  dices[turn_of_the_player].style.display = "block";
  dices[(turn_of_the_player + 1) % 4].style.display = "none";
  dices[(turn_of_the_player + 2) % 4].style.display = "none";
  dices[(turn_of_the_player + 3) % 4].style.display = "none";
}

function enable_dice() {
  // no_of_dice_rolls_till_now ++;
  // if (no_of_dice_rolls_till_now > 5) {
  //   return;
  // }
  count_to_avoid_race_conditions++;
  tokens_inside_home = [];  // Reset global variables
  tokens_outside_home = [];  // Reset global variables
  current_player_has_left = false;  // Reset global variables
  token_is_running = false;  // Reset global variables
  current_player_color = get_color_from_idx(turn_of_the_player);
  if (
    total_players == 1 &&
    (
      document.querySelectorAll("#winner_" + turn_of_the_player + " img").length == 0 &&
      document.querySelectorAll("#left_user_" + turn_of_the_player + " img").length == 0
    ) &&
    rank_to_be_given_next != 4
  ) {
    remove_all_animation_and_tokens_of_current_player();
    make_winner();
    return;
  }
  set_dices_display_style();
  if (game_is_over) {
    return;
  }
  var tokens_of_the_player = document.getElementsByClassName("tokens_of_" + turn_of_the_player);
  if (tokens_of_the_player.length == 0) {
    current_player_has_left = true;
    disable_progressbar_and_call_to_next_player();
  } else {
    document.querySelector("#" + current_player_color + "_dice_container" + " img").classList.add("dice_margin");
    document.querySelector("#" + current_player_color + "_dice_container").classList.add("dice_border_animation");
    dices[turn_of_the_player].addEventListener("click", roll_dice);
    start_timer();
    if (document.getElementById("run_automatically_switch_input").checked || (!document.getElementById("run_automatically_switch_input").checked && turn_of_the_player != manual_player_id)) {
      setTimeout(function () {
        dices[turn_of_the_player].click();
      }, 1000);
    }
  }
}

function enable_pointer_event_for_dices_and_tokens() {
  var all_tokens = document.querySelectorAll(
    ".tokens_of_" + manual_player_id
  );
  var all_dices = document.querySelectorAll("#" + get_color_from_idx(manual_player_id) + "_dice_container .dice");
  for (var z = 0; z < all_tokens.length; z++) {
    all_tokens[z].classList.remove("disable_pointer_event");
  }
  for (var z = 0; z < all_dices.length; z++) {
    all_dices[z].classList.remove("disable_pointer_event");
  }
}

function disable_pointer_event_for_dices_and_tokens() {
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
    disable_pointer_event_for_dices_and_tokens();
    automatically_roll_dice_and_run_token(false);
    document.getElementsByClassName("manual_player")[0].style.display="none";
  } else {
    enable_pointer_event_for_dices_and_tokens();
    document.getElementsByClassName("manual_player")[0].style.display="block";
  }
});
