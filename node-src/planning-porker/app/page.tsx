import WebSocketScript from "./websocket";

export default function Home() {
  return (
    <>
      <WebSocketScript></WebSocketScript>
      <h1>WebSocket Chat</h1>
      <h2>Your ID: <span id="ws-id"></span></h2>
      <form action="" className="send-message">
        <input type="text" id="messageText" autocomplete="off" />
        <button>Send</button>
      </form>
      <ul id='messages'>
      </ul>
    </>
  );
}
