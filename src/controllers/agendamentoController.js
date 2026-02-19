const service = require("../services/agendamentoService");
const model = require("../models/agendamentoModel");

exports.create = async (req, res) => {
    try {
        const agendamento = await service.create(req.body);
        res.status(201).json(agendamento);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
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
    try {
        await service.update(req.params.id, req.body);
        res.sendStatus(204);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    await model.delete(req.params.id);
    res.sendStatus(204);
};
