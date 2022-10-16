const Rooms = require("../models/Rooms");
const { v4: uuidv4 } = require("uuid");
const { union } = require("lodash");
const Users = require("../models/Users");

exports.addMessage = async ({ email, text, roomId }) => {
  try {
    let date = new Date();
    console.log({ email, text, roomId });

    const user = await Users.findOne({ email }).select("-password");
    const room = await Rooms.findOne({ roomId });

    if (room.messages.length === 0) {
      room.lastMessage = { text, email, time: date };
      room.messages.push({
        email,
        text,
        time: date,
      });
      console.log("case1", user);
      await room.save();
      return { message: "trigger_room_creation", time: date, name: user.name };
    } else {
      room.lastMessage = { text, email, time: date };
      room.messages.push({
        email,
        text,
        time: date,
      });
      console.log("case2", user);
      await room.save();
      return { message: "message added", time: date, name: user.name };
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.startConvsersation = async ({
  primaryEmail,
  secondaryEmail,
  roomId,
}) => {
  try {
    if (roomId) {
      const room = await Rooms.findOne({ roomId });
      console.log("roomid_found", room);
      return room;
    }
    if (primaryEmail?.length > 0 && secondaryEmail?.length > 0) {
      const room = await Rooms.findOne({ primaryEmail, secondaryEmail });

      /* if the second user opens, the emails are switched */
      const tempRoom = await Rooms.findOne({
        primaryEmail: secondaryEmail,
        secondaryEmail: primaryEmail,
      });

      const primaryUser = await Users.findOne({ email: primaryEmail });
      const secondaryUser = await Users.findOne({ email: secondaryEmail });

      const isRoomExist = room || tempRoom;

      if (isRoomExist) {
        console.log("room_already_exist", isRoomExist);
        return {
          roomId: isRoomExist.roomId,
          primaryEmail: isRoomExist.primaryEmail,
          secondaryEmail: isRoomExist.secondaryEmail,
        };
      } else {
        let newRoom = Rooms({
          primaryEmail,
          secondaryEmail,
          roomId: uuidv4(),
          participants: [primaryUser.name, secondaryUser.name],
        });
        await newRoom.save();
        console.log("new_room_created_successfully", newRoom);
        return newRoom;
      }
    } else {
      console.log("Key emails are not valid");
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.getRoomCount = async ({ userEmail }) => {
  try {
    const primaryRoom = await Rooms.find({ primaryEmail: userEmail }).select(
      "-messages"
    );

    const secondaryRoom = await Rooms.find({
      secondaryEmail: userEmail,
    }).select("-messages");

    const unionRoom = union(primaryRoom, secondaryRoom);
    const noMessageFilter = unionRoom.filter(
      (ur) => ur["lastMessage"].text !== undefined
    );
    return { roomCount: noMessageFilter.length };
  } catch (err) {
    console.log(err);
  }
};

exports.getRoomChat = async ({ roomId }) => {
  try {
    const room = await Rooms.findOne({ roomId });
    return { message: "chats_fetched", messages: room.messages || [] };
  } catch (err) {
    console.log(err);
  }
};

exports.getAllActiveRooms = async (req, res, next) => {
  try {
    const { userEmail } = req.body;
    const primaryRoom = await Rooms.find({ primaryEmail: userEmail }).select(
      "-messages"
    );
    const secondaryRoom = await Rooms.find({
      secondaryEmail: userEmail,
    }).select("-messages");
    const unionRoom = union(primaryRoom, secondaryRoom);
    // const noMessageFilter = unionRoom.filter(
    //   (ur) => ur["lastMessage"].text !== undefined
    // );

    res.status(200).json({
      message: "conversations_fetched_successfully",
      rooms: unionRoom,
    });
  } catch (err) {
    console.log(err);
  }
};
