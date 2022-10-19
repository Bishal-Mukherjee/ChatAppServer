const {
  addMessage,
  startConvsersation,
  getRoomCount,
  getRoomChat,
} = require("./controllers/rooms");

const socket_connection = ({ io }) => {
  io.on("connection", (socket) => {
    console.log("connected..", socket.id);

    socket.on("joinroom", (params) => {
      console.log("joinroom triggered", params);
      if (params.roomId) {
        console.log("joining..", params.roomId);
        socket.join(params.roomId);
      } else {
        startConvsersation({ ...params }).then((res) => {
          if (res) {
            // res: roomId, primaryEmail, secondaryEmail
            const { roomId, primaryEmail, secondaryEmail } = res;
            socket.join(res.roomId);
            io.to(res.roomId).emit("roomid_found", {
              roomId,
              primaryEmail,
              secondaryEmail,
              name: params.name, // name refers to the user to whom the message is to be sent
              email: params.email, // email refers to the user to whom the message is to be sent
            });
          }
        });
      }
    });

    socket.on("numberofclients", async (params) => {
      // this provides the number of clients in that room
      const clients = await io.in(params.roomId).allSockets();
      console.log(clients);
    });

    socket.on("online", async (params) => {
      // params: roomId userEmail
      const clients = await io.in(params.roomId).allSockets();
      console.log("numberOfClients", clients.size);
      io.to(params.roomId).emit("online", {
        ...params,
        numberOfClients: clients.size,
      });
    });

    socket.on("message", (params) => {
      addMessage({ ...params }).then((res) => {
        if (res) {
          console.log("addMessage response", res);
          //   console.log("room creation triggered");
          console.log(params.email, "sent", params.text, "in", params.roomId);
          console.log("message sent!");
          //   if (res.message === "trigger_room_creation") {
          //     io.to(params.roomId).emit("roomcreation", {
          //       secondaryEmail: "bishal@gmail.com",
          //     });
          //   }
          io.to(params.roomId).emit("message", {
            ...params,
            name: res.name,
            time: res.time,
          });
        }
      });
    });

    socket.on("typing", (params) => {
      io.to(params.roomId).emit("typing", params);
    });

    socket.on("nottyping", (params) => {
      io.to(params.roomId).emit("nottyping", {
        ...params,
        message: "not_typing",
      });
    });

    socket.on("roomcount", (params) => {
      console.log("params...", params);
      getRoomCount({ ...params }).then((res) => {
        console.log(res);
        socket.emit("roomcount", {
          email: params.userEmail,
          roomCount: res.roomCount,
        });
      });
    });

    socket.on("getchat", (params) => {
      try {
        console.log("getchat triggered", params);
        getRoomChat({ ...params }).then((res) => {
          socket.emit("getchat", {
            messages: res.messages,
            flag: "messages_fetched",
          });
        });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("roomcreation", (params) => {
      console.log("roomcreation triggered", params);
    });

    // socket.on("notify", (params) => {
    //   params.notifications = params.notifications.map((p: any) => {
    //     p.timeOfReceiving = new Date();
    //     return p;
    //   });
    //   ADD_NOTIFICATION(params).then((res: any) => {
    //     io.emit("notify", params);
    //   });
    // });
    // // socket.on("disconnect", (params) => {
    // //   console.log("disconnect");
    // //   io.emit("dis", { message: "HI" });
    // // });
  });
};

module.exports = socket_connection;
