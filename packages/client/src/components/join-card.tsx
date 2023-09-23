import React from "react";
import { ProfileSlider } from "./profile-slider";
import { images } from "@/assets";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { connectToSocket, socket } from "@/lib/socket";

const JoinCard: React.FC = () => {
  const [displayName, setDisplayName] = React.useState("");
  const [joinDisplayName, setJoinDisplayName] = React.useState("");
  const [roomID, setRoomID] = React.useState("");
  const [image, setImage] = React.useState<Partial<typeof images[number]>>();

  const handleRoomCreation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName) {
      toast.error("Please provide a username.");
      return;
    }

    if (!image) {
      toast.error("Please provide a display image.");
      return;
    }

    connectToSocket({
      userID: socket.id,
      displayImage: image.src as string,
      displayName: displayName
    });

    socket.emit("CreateRoom");

    setDisplayName("");
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinDisplayName) {
      toast.error("Please provide a username.");
      return;
    }

    if (!image) {
      toast.error("Please provide a display image.");
      return;
    }

    connectToSocket({
      userID: socket.id,
      displayImage: image.src as string,
      displayName: joinDisplayName
    });

    socket.emit("JoinRoom", roomID);

    setJoinDisplayName("");
    setRoomID("");
  };

  return (
    <div
      className="w-full sm:w-[75%] lg:w-[50%] p-4 flex flex-col items-center gap-8 max-w-[700px] m-auto rounded-lg shadow-md shadow-black/20 min-h-[10rem] dark:border"
    >
      <ProfileSlider
        setImage={setImage}
      />

      <form
        className="w-full flex flex-col gap-4"
        onSubmit={handleRoomCreation}
        action=""
      >

        <div className="flex flex-col gap-2">
          <label id="name-input-label" aria-label="name-input" htmlFor="name-input" className="text-lg">Username</label>
          <Input
            type="text"
            placeholder="Enter a name to display"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            aria-labelledby="name-input-label"
            required
          />
        </div>

        <div>
          <Button
            className="w-full"
            type="submit"
          >
            Create Room
          </Button>
        </div>
      </form>

      <hr className="w-full" />

      <form
        className="w-full flex flex-col gap-4"
        action=""
        onSubmit={handleJoinRoom}
      >

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label id="join-name-input-label" aria-label="join-name-input" htmlFor="join-name-input" className="text-lg">Username</label>
            <Input
              type="text"
              placeholder="Enter a name to display in a room"
              value={joinDisplayName}
              onChange={(e) => setJoinDisplayName(e.target.value)}
              aria-labelledby="join-name-input-label"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label id="room-id-input-label" aria-label="room-id-input" htmlFor="room-id-input" className="text-lg">Room ID</label>
            <Input
              type="text"
              placeholder="Enter a room ID to join"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              aria-labelledby="room-id-input-label"
              required
            />
          </div>
        </div>

        <div>
          <Button
            className="w-full"
            variant="secondary"
            type="submit"
          >
            Join Room
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JoinCard;