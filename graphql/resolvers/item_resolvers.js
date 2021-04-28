const { UserInputError } = require("apollo-server-errors");

const List = require("../../models/list");
const User = require("../../models/user");
const { item_validation } = require("../../util/validation");
const get_index = require("../../util/get_index");

module.exports = {
  Mutation: {
    add_item: async (_, { name, listID }) => {
      // input validation
      const { errors, valid } = await item_validation.add(name, listID);
      if (!valid) throw new UserInputError("Add Item Error", { errors });

      // adds the item to the list and updates the database
      const list = await List.findById(listID);
      list.items.push({
        name,
        member: null,
        purchased: false,
      });
      list.save();

      return {
        id: list._id,
        ...list._doc,
      };
    },
    remove_item: async (_, { listID, itemID }) => {
      // input validation
      const { errors, valid } = await item_validation.remove(listID, itemID);
      if (!valid) throw new UserInputError("Remove Item Error", { errors });

      // finds the index of the item, removes it, and updates the database
      const list = await List.findById(listID);
      const index = get_index(list, itemID);
      list.items.splice(index, 1);
      list.save();

      return {
        id: list._id,
        ...list._doc,
      };
    },
    claim_item: async (
      _,
      { listID, itemID, options: { method = "unclaim", userID = null } }
    ) => {
      // input validation
      const { errors, valid } = await item_validation.claim(
        listID,
        itemID,
        method,
        userID
      );
      if (!valid) throw new UserInputError("Item Claim Error", { errors });

      const list = await List.findById(listID);

      // sets the user to null if there was no specified userID
      const user = !userID ? null : await User.findById(userID);

      const index = get_index(list, itemID);

      // if the method is claim, sets the memeber to the user claiming it.
      // the only other option is unclaim, so it sets the member to null
      list.items[index].member = method == "claim" ? user.screen_name : null;

      list.save();

      return {
        id: list._id,
        ...list._doc,
      };
    },
    purchase_item: async (_, { listID, itemID, method = "purchase" }) => {
      // input validation
      const { errors, valid } = await item_validation.purchase(
        listID,
        itemID,
        method
      );
      if (!valid) throw new UserInputError("Purchase Error", { errors });

      const list = await List.findById(listID);
      const index = get_index(list, itemID);

      // if the method is purchase, then purchased is true. Unpurchase method sets it to false
      list.items[index].purchased = method == "purchase" ? true : false;
      list.save();

      return {
        id: list._id,
        ...list._doc,
      };
    },
  },
};
