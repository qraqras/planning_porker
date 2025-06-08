'use client'
import { useState, useRef, JSX } from "react"

class Message {
    command: string;
    clients: Client[];
    // constructor(command: string, param: Client[]) {
    //     this.command = command;
    //     this.clients = param;
    // }
}

class Client {
    port: number;
    name: string;
    state: string;
    // constructor(port: number, name: string, state: string) {
    //     this.port = port;
    //     this.name = name;
    //     this.state = state;
    // }
}

export function WebSocketConnect(): JSX.Element {

    const [ws, setWs] = useState<WebSocket | null>(null)
    const [clients, setClients] = useState<Client[] | null>(null)
    const [state, setState] = useState<boolean>(false)

    const clientsRef = useRef<Client[] | null>(null);
    clientsRef.current = clients;
    const websocketRef = useRef<WebSocket | null>(null);
    websocketRef.current = ws;

    function onEntry(): void {
        if (!ws) {
            const _ws = new WebSocket(`ws://localhost:8000/ws`)
            _ws.onopen = onOpen
            _ws.onmessage = onMessage
            setWs(_ws)
        }
    }
    function connect(): void {
        if (ws) {
            setName(ws)
        }
    };
    function setName(websocket: WebSocket): void {
        const name: HTMLInputElement | null = document.querySelector("#client-name")
        if (name) {
            websocket.send(JSON.stringify({
                "command": "name",
                "param": name.value
            }))
        }
    }
    function onOpen(event: Event): void {
        //setName(event.target)
    }
    function onMessage(event: MessageEvent): void {
        const msg: Message = Object.assign(new Message(), JSON.parse(event.data));
        const msgClients: Client[] = msg.clients;
        switch (msg.command) {
            case "init":
                setClients(msgClients)
                break;
            case "join":
                {
                    if (clientsRef.current) {
                        const newArray: Client[] = clientsRef.current.slice()
                        msgClients.forEach(msgClient => {
                            newArray.push(msgClient)
                        });
                        setClients(newArray)
                    }
                }
                break;
            case "name":
                {
                    if (clientsRef.current) {
                        const newArray: Client[] = clientsRef.current.slice()
                        newArray.forEach(element => {
                            msgClients.forEach(msgClient => {
                                if (element.port == msgClient.port) {
                                    element.name = msgClient.name;
                                }
                            });
                        });
                        setClients(newArray)
                    }
                }
                break;
            case "state":
                {
                    if (clientsRef.current) {
                        const newArray: Client[] = clientsRef.current.slice()
                        newArray.forEach(element => {
                            msgClients.forEach(msgClient => {
                                if (element.port == msgClient.port) {
                                    element.state = msgClient.state;
                                }
                            });
                        });
                        setClients(newArray)
                    }
                }
                break;
        }
    }
    return (
        <>
            <button onClick={onEntry}>Entry</button>
            <div>
                <input id="client-name" type="text" autoComplete="off" />
                <button disabled={state} onClick={connect}>Connect</button>
            </div>
            <WebSocketSend ws={ws}></WebSocketSend>


            <table id="clients">
                <tbody>
                    {clients && clients.map((c, idx) => (
                        <tr key={idx}>
                            {/* <td key={"td1" + idx}>{typeof c === 'object' ? c.port : String(c)}</td> */}
                            <td key={"td2" + idx}>{typeof c === 'object' ? c.name : String(c)}</td>
                            <td key={"td3" + idx}>{typeof c === 'object' ? c.state : String(c)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

function ClientTabel(prop: { clients: Client[] }): JSX.Element {
    return (
        <table></table>
    )
}

function WebSocketSend(prop: { ws: WebSocket | null }): JSX.Element {
    const ws = prop.ws;
    function send() {
        if (ws) {
            const msg = document.querySelector("#ws-send") as HTMLInputElement | null;
            if (msg) {
                ws.send(JSON.stringify({
                    "command": "state",
                    "param": msg.value
                }))
            }
        }
    }
    return (
        <div>
            <input id="ws-send" type="text" autoComplete="off" />
            <button onClick={send}>Send</button>
        </div>
    )
}
