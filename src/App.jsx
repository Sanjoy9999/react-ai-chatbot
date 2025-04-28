import { useState } from "react";
import { Assistant } from "./assistants/googleai.js";
// import { Assistant } from "./assistants/openai.js";
// import { Assistant } from "./assistants/deepseekai.js";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Control.jsx";
import styles from "./App.module.css";
import { Loader } from "./components/Loader/Loader.jsx";

function App() {
  const assistant = new Assistant();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: `${message.content}${content}` }
          : message
      )
    );
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);
    try {
      const result = await assistant.chatStream(content); // for google ai
      // const result = await assistant.chatStream(content,messages); // for openai
      let isFirstChunk = false;
  
      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true); // Enable streaming (disable input)
        }
        updateLastMessageContent(chunk);
      }
      setIsStreaming(false); // <-- Move this here, after streaming is done
    } catch (error) {
      addMessage({
        content: "Sorry, I couldn't process your request. Please try again!",
        role: "system",
      });
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  // Dark mode toggle logic
  const [isDarkMode, setIsDarkMode] = useState(false);

  function toggleDarkMode() {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      return next;
    });
  }


  
  return (
    <>
      {isLoading && <Loader />}
      <div className={styles.App}>
        <header className={styles.Header}>
          {/* Sun icon: show in light mode, click to enable dark mode */}
          {!isDarkMode && (
            <img
              className={styles.SunMoon}
              src="/moon.svg"
              alt="Enable dark mode"
              onClick={toggleDarkMode}
              style={{ cursor: "pointer" }}
            />
          )}
          {/* Moon icon: show in dark mode, click to enable light mode */}
          {isDarkMode && (
            <img
              className={styles.SunMoon}
              src="/sun.svg"
              alt="Enable light mode"
              onClick={toggleDarkMode}
              style={{ cursor: "pointer" }}
            />
          )}
          <img className={styles.Logo} src="/chat-bot.png" />
          <h2 className={styles.Title}>AI Chatbot</h2>
        </header>
        <div className={styles.ChatContainer}>
          <Chat messages={messages} />
        </div>
        <Controls
          isDisabled={isLoading || isStreaming}
          onSend={handleContentSend}
        />
      </div>
    </>
  );
}

export default App;
