from typing import List, Dict, TypeVar
from dataclasses import dataclass, asdict
from enum import Enum

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


@dataclass
class Client:
    port: int
    name: str
    state: str


@dataclass
class Message:
    command: str
    clients: list[Client]


class Command(Enum):
    init = "init"
    leave = "leave"
    name = "name"
    state = "state"


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, Client] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        port = 0
        if websocket.client:
            port = websocket.client.port
        client = Client(port, "-", "-")
        await self.broadcast_json(asdict(Message("join", [client])))
        self.active_connections.setdefault(websocket, client)

    def disconnect(self, websocket: WebSocket):
        del self.active_connections[websocket]

    async def set_name(self, websocket: WebSocket, name: str):
        self.active_connections[websocket].name = name
        await self.broadcast_json(
            asdict(Message("name", [self.active_connections[websocket]]))
        )

    async def set_state(self, websocket: WebSocket, state: str):
        self.active_connections[websocket].state = state
        await self.broadcast_json(
            asdict(Message("state", [self.active_connections[websocket]]))
        )

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_json(self, obj: Dict):
        for connection in self.active_connections:
            await connection.send_json(obj)

    async def send_init(self, websocket: WebSocket):
        await websocket.send_json(
            asdict(Message("init", list(self.active_connections.values())))
        )


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await manager.send_init(websocket)
    try:
        while True:
            data = await websocket.receive_json()

            match Command(data.get("command")):
                case Command.name:
                    print("name")
                    await manager.set_name(websocket, data.get("param"))
                case Command.state:
                    print("state")
                    await manager.set_state(websocket, data.get("param"))
                case _:
                    print("other")

    except WebSocketDisconnect:
        manager.disconnect(websocket)

        await manager.send_init(websocket)
