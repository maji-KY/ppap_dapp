import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";

interface Client {
  rpc?: JsonRpc
  api?: Api
}

export default function Top() {

  const [host, setHost] = React.useState("");
  const [privateKey, setPrivateKey] = React.useState("");
  const [client, setClient] = React.useState<Client>({});
  const [master, setMaster] = React.useState("");
  const [player, setPlayer] = React.useState("");
  const [playerName, setPlayerName] = React.useState("");
  const [card, setCard] = React.useState("");
  const displayRef = React.useRef(null);

  return (
    <div>
      設定：<br />
      <TextField size="small" margin="dense" variant="outlined" label="host" onChange={e => setHost(e.currentTarget.value)} /><br />
      <TextField size="small" margin="dense" variant="outlined" label="privateKey" type="password" onChange={e => setPrivateKey(e.currentTarget.value)} /><br />
      {client.api ? "privateKeyセット完了" : <Button color="primary" variant="contained" onClick={() => {
        const rpc = new JsonRpc(host);
        const privateKeys = [privateKey];
        const signatureProvider = new JsSignatureProvider(privateKeys);
        const api = new Api({ rpc, signatureProvider});
        setClient({api, rpc});
      }}>Set Client</Button>}
      <hr />
      <Typography variant="h4">
        賭け無しでプランニングポーカーしようぜ。
      </Typography>
      <br />
      <TextField size="small" margin="dense" variant="outlined" label="master" onChange={e => setMaster(e.currentTarget.value)} /><br />
      <TextField size="small" margin="dense" variant="outlined" label="player" onChange={e => setPlayer(e.currentTarget.value)} /><br />
      <TextField size="small" margin="dense" variant="outlined" label="playerName" onChange={e => setPlayerName(e.currentTarget.value)} /><br />
      <TextField size="small" margin="dense" variant="outlined" type="number" label="card" onChange={e => setCard(e.currentTarget.value)} /><br />
      <Button color="primary" variant="contained" onClick={async () => {
        const result = await client.api!.transact({
          "actions": [{
            "account": "ppap",
            "name": "join",
            "authorization": [{
              "actor": player,
              "permission": "active",
            }],
            "data": {
              player,
              master,
              "player_name": playerName,
            },
          }],
        }, {
          "blocksBehind": 3,
          "expireSeconds": 30,
        });
        console.log(result);
      }}>Join</Button>&nbsp;
      <Button color="primary" variant="contained" onClick={async () => {
        const display: any = displayRef.current!;
        const resp = await client.rpc!.get_table_rows({
          "json": true,
          "code": "ppap",
          "scope": master,
          "table": "playercard",
          "limit": 10,
        });
        const rows = resp.rows;
        rows.forEach(x => console.log(x));
        display.innerHTML = rows.map(x => `${x.player_name}(${x.player}): ${x.card}`).join("&#13;&#10;");
      }}>Fetch Board</Button>&nbsp;
      <Button color="primary" variant="contained" onClick={async () => {
        const result = await client.api!.transact({
          "actions": [{
            "account": "ppap",
            "name": "bet",
            "authorization": [{
              "actor": player,
              "permission": "active",
            }],
            "data": {
              player,
              master,
              "card": +card,
            },
          }],
        }, {
          "blocksBehind": 3,
          "expireSeconds": 30,
        });
        console.log(result);
      }}>Bet</Button>&nbsp;
      <Button color="primary" variant="contained" onClick={async () => {
        const result = await client.api!.transact({
          "actions": [{
            "account": "ppap",
            "name": "leave",
            "authorization": [{
              "actor": player,
              "permission": "active",
            }],
            "data": {
              player,
              master,
            },
          }],
        }, {
          "blocksBehind": 3,
          "expireSeconds": 30,
        });
        console.log(result);
      }}>Leave</Button><br /><br />
      <textarea ref={displayRef}>
      </textarea>
    </div>
  );
}
