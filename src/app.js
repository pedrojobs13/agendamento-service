require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());

app.use("/agendamentos", require("./routes/agendamentoRoutes"));

// Health check simples para testes e monitoramento.
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

if (require.main === module) {
    app.listen(3001, () => {
        console.log("Agendamento service rodando");
    });
}

module.exports = app;
