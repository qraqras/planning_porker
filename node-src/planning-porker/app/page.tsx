import { WebSocketConnect } from "./websocket";

export default function Home() {
  return (
    <>
      <WebSocketConnect />

      <ul id='messages'>
      </ul>
    </>
  );
}
