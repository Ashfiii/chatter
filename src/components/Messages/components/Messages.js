import React, { useState, useEffect, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMsg from '../../../common/constants/initialBottyMessage';

const client = 'me';
const botty = 'botty';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

const initial_msg = {
  message: initialBottyMsg,
  user: botty
};

function scrollToBottom(){
  const msgs = document.querySelector("#message-list");
  msgs.scrollTop = msgs.scrollHeight;
}

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([initial_msg]);
  const [botTyping, setBotTyping] = useState(false);

  useEffect(() => {
    socket.on('bot-message', (message) => {
      setMessages([
        ...messages,
        {message, user: botty}
      ]);

      setBotTyping(false);

      playReceive();

      scrollToBottom();
    });
  }, [messages]);

  useEffect(()=>{
    socket.on('bot-typing', () => {
      setBotTyping(true);
    });
  }, []);

  const onChangeMessage = (event) => {
    setMessage(event.target.value)
  };

  const sendMessage = useCallback(() => {
    if (!message) {
       return false; 
      }

    setMessages([...messages, {message, user: client}]);

    socket.emit('user-message', message);

    scrollToBottom();    

    setMessage('');

    playSend();

    document.querySelector("#user-message-input").value = '';
  }, [messages, message]);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messages.map((msg, index)=>(
            <Message nextMessage={messages[index + 1]} message={msg} botTyping={botTyping} />
          ))}
        {botTyping ? <TypingMessage /> : null}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
