import { useRef, useEffect, useMemo } from "react";
import styles from "./Chat.module.css";
import Markdown from "react-markdown";

const WELCOME_MESSAGE_GROUP = [
  {
    role: "assistant",
    content: "Hello! How can I assist you right now?",
  },
];

export function Chat({ messages }) {
  const messagesEndRef = useRef(null);
  const messagesGroups = useMemo(
    () =>
      messages.reduce((groups, message) => {
        if (message.role === "user") groups.push([]);
        groups[groups.length - 1].push(message);
        return groups;
      }, []),
    [messages]
  );

  // Create a string that changes whenever any message content changes
  const messagesContentKey = messages.map(m => m.content).join("||");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messagesContentKey]);

  return (
    <div className={styles.Chat}>
      {[WELCOME_MESSAGE_GROUP, ...messagesGroups].map(
        (messages, groupIndex) => (
          //Group
          <div key={groupIndex} className={styles.Group}>
            {messages.map(({ role, content }, index) => (
              //Message
              <div key={index} className={styles.Message} data-role={role}>
                <Markdown>{content}</Markdown>
              </div>
            ))}
          </div>
        )
      )}
      {/* This must be inside the scrollable container */}
      <div ref={messagesEndRef} />
    </div>
  );
}
