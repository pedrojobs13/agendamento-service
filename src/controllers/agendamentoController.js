const service = require("../services/agendamentoService");
const model = require("../models/agendamentoModel");

exports.create = async (req, res) => {
    const agendamento = await service.create(req.body);
    res.status(201).json(agendamento);
};

exports.getAll = async (req, res) => {
    const data = await model.findAll();
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await model.findById(req.params.id);
    res.json(data);
};

exports.update = async (req, res) => {
    await model.update(req.params.id, req.body);
    res.sendStatus(204);
};

exports.delete = async (req, res) => {
    await model.delete(req.params.id);
    res.sendStatus(204);
};
