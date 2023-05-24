const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `select * from cricket_team where player_id = ${playerId}`;
  const player = await db.get(getPlayersQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API 2
app.use(express.json());

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `insert into cricket_team (player_name,jersey_number,role) 
  values(
      '${playerName}',${jerseyNumber},'${role}'
  )`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const getUpdateQuery = `update cricket_team set
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}' where player_id = ${playerId}`;
  await db.run(getUpdateQuery);
  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete from cricket_team where player_id = ${playerId}`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
