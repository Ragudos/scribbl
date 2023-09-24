import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Message } from "@scribbl/shared-types";
import React from "react";

type Props = {
  messages: Pick<Message, "content" | "user" | "messageID">[]
}

const Chat: React.FC<Props> = React.memo(
  ({ messages }) => {
    const lastMsgRef = React.useRef<HTMLLIElement>(null);

    React.useEffect(() => {
      if (!lastMsgRef.current) {
        return;
      }

      const el = lastMsgRef.current;

      el.scrollIntoView({
        block: "end",
        inline: "end",
        behavior: "smooth"

      });
    }, [messages]);

    return (
      <ul className="max-w-[90vw] w-full flex flex-col gap-8 px-4 pt-8 pb-2 overflow-y-auto">
        {messages.map((m) => (
          <li
            ref={lastMsgRef}
            key={m.messageID}
            className={cn(
              "flex gap-2 relative",
              { "justify-end": socket.id === m.user.userID }
            )}
          >

            {m.user.userID === socket.id && (
              <p className="text-sm shadow-lg shadow-black/20 dark:border rounded-sm p-1 max-w-[70%] md:max-w-[50%] overflow-auto break-words whitespace-pre-wrap">
                {m.content}
              </p>
            )}

            <div className="w-7 h-7 rounded-full">
              <img
                src={m.user.displayImage}
                alt={m.user.displayName + "'s avatar"}
                width={28}
                height={28}
                className="w-full h-full rounded-full"
              />
            </div>

            {m.user.userID !== socket.id && (
              <div className="text-sm max-w-[70%] md:max-w-[50%] relative">
                {m.user.userID !== socket.id && (
                  <span
                    className="text-sm bottom-[110%] right-1 absolute opacity-60 font-bold"
                  >
                    {m.user.displayName}
                  </span>
                )}
                <p className="shadow-lg shadow-black/20 dark:border rounded-sm p-1 overflow-auto break-words whitespace-pre-wrap">
                  {m.content}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }
);

Chat.displayName = "Chat";
export default Chat;