require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());

app.use("/agendamentos", require("./routes/agendamentoRoutes"));

app.listen(3001, () => {
    console.log("Agendamento service rodando");
});
