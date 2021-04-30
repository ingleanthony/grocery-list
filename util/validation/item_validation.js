const List = require("../../models/list");
const User = require("../../models/user");
const { get_item_index } = require("../../util/get_index");
const { get_user_index } = require("../../util/get_index");

module.exports = async ({
  name = null,
  listID = null,
  itemID = null,
  userID = null,
  method = null,
}) => {
  const errors = {};

  if (name && name.trim() == "") errors.name = "Name must not be empty";

  // make sure the list ID is valid and exists in the database
  if (listID) {
    if (listID === "") errors.listID = "List ID must not be empty";
    else {
      var list = await List.findById(listID);
      if (!list) errors.listID = "List with that ID not found";
    }
  }

  if (itemID) {
    if (itemID == "") errors.itemID = "Item ID must not be empty";
    else if (list) {
      var item_index = get_item_index(list, itemID);
      if (item_index == -1)
        errors.itemID = "Item with that ID does not exist in the list";
    }
  }

  // makes sure that the user ID is valid, exists in the database, and is part of the list
  if (userID) {
    if (userID === "") errors.userID = "User ID must not be empty";
    else {
      var user = await User.findById(userID);
      if (user && list) {
        var user_index = get_user_index(list, userID);
        if (user_index == -1) errors.userID = "User is not a part of this list";
      } else errors.userID = "User with that ID not found";
    }
  }

  if (method) {
    switch (method) {
      case "claim":
        break;
      case "unclaim":
        break;
      case "purchase":
        break;
      case "unpurchase":
        break;
      default:
        errors.method = "Invalid method";
    }
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors,
    list: list ? list : null,
    user: user ? user : null,
    item_index: item_index != -1 ? item_index : null,
    user_index: user_index != -1 ? user_index : null,
  };
};
