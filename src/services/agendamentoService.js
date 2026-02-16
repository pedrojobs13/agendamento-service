const { v4: uuid } = require("uuid");
const model = require("../models/agendamentoModel");

exports.create = async (data) => {
    const agendamento = {
        id: uuid(),
        status: "PENDENTE",
        ...data,
    };

    await model.create(agendamento);
    return agendamento;
};
