const { UserInputError } = require("apollo-server-errors");

const List = require("../../models/list");
const User = require("../../models/user");
const { list_validation } = require("../../util/validation");
const { get_user_index } = require("../../util/get_index");

module.exports = {
  Query: {
    get_list: async (_, { listID }) => {
      try {
        const list = await List.findById(listID);
        return {
          id: list._id,
          ...list._doc,
        };
      } catch (err) {
        throw new Error("List Retrieval Error", err);
      }
    },
    get_user_lists: async (_, { userID }) => {
      try {
        const lists = await List.find({ owner: userID });
        return lists;
      } catch (err) {
        throw new Error("List Retrieval Error", err);
      }
    },
  },
  Mutation: {
    create_list: async (_, { list_name, userID }) => {
      // input validation
      const { errors, valid } = await list_validation.creation(
        list_name,
        userID
      );
      if (!valid) throw new UserInputError("List Creation Error", { errors });

      // generate a 5-digit join code
      do {
        var code = Math.floor(Math.random() * (100000 - 10000)) + 10000;
        var invalid = await List.findOne({ code: code.toString() });
      } while (invalid);

      // gets the user's screen name to add to the members array
      const user = await User.findById(userID);

      // creates a new list and saves it to the database
      const list = await new List({
        owner: userID,
        list_name,
        code: code.toString(),
        members: [
          {
            _id: user._id,
            member: user._id,
            screen_name: user.screen_name,
          },
        ],
        items: [],
        created: new Date().toISOString(),
      }).save();

      return {
        id: list._id,
        ...list._doc,
      };
    },
    join_list: async (_, { code, userID }, { pubsub }) => {
      // input validation
      const { errors, valid } = await list_validation.join(code, userID);
      if (!valid) throw new UserInputError("List Join Error", { errors });

      // adds the user to the members array in the list and updates the database
      const list = await List.findOne({ code });
      const user = await User.findById(userID);
      list.members.push({
        _id: userID,
        screen_name: user.screen_name,
      });
      list.save();

      pubsub.publish(code, {
        update: `${user.screen_name} has joined the list`,
      });

      return {
        id: list._id,
        ...list._doc,
      };
    },
    leave_list: async (_, { listID, userID }, { pubsub }) => {
      // try {
      const list = await List.findById(listID);
      const user = await User.findById(userID);
      // finds the index of the leaving member, removes them, and updates the database
      const index = get_user_index(list, userID);
      console.log(index);

      list.members.splice(index, 1);

      pubsub.publish(list.code, {
        update: `${user.screen_name} has left the list`,
      });

      if (list.members.length == 0) return delete_list(listID);
      else if (userID == list.owner) {
        list.owner = list.members[0]._id;
        pubsub.publish(list.code, {
          update: `${list.members[0].screen_name} is now the list owner`,
        });
      }

      list.save();

      return "Successfully left the list";
      // } catch (err) {
      //   throw new Error("Leave Error", err);
      // }
    },
    delete_list: async (_, { listID }) => {
      try {
        await List.findByIdAndDelete(listID);
        return "Successfully deleted the list";
      } catch (err) {
        throw new Error("List Deletion Error", err);
      }
    },
  },
};
