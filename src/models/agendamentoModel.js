const db = require("../config/db");

exports.create = async (agendamento) => {
    const sql = "INSERT INTO agendamentos (id, cliente, data, descricao, status) VALUES (?, ?, ?, ?, ?)";
    await db.execute(sql, [
        agendamento.id,
        agendamento.cliente,
        agendamento.data,
        agendamento.descricao,
        agendamento.status,
    ]);
};

exports.findAll = async () => {
    const [rows] = await db.execute("SELECT * FROM agendamentos");
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await db.execute(
        "SELECT * FROM agendamentos WHERE id = ?", [id]
    );
    return rows[0];
};

exports.findByDate = async (data) => {
    const [rows] = await db.execute(
        "SELECT * FROM agendamentos WHERE data = ?",
        [data]
    );
    return rows[0];
};

exports.findByDateExcludingId = async (data, id) => {
    const [rows] = await db.execute(
        "SELECT * FROM agendamentos WHERE data = ? AND id <> ?",
        [data, id]
    );
    return rows[0];
};

exports.findByHour = async (startDateTime, endDateTime) => {
    const [rows] = await db.execute(
        "SELECT * FROM agendamentos WHERE data >= ? AND data <= ?",
        [startDateTime, endDateTime]
    );
    return rows[0];
};

exports.findByHourExcludingId = async (startDateTime, endDateTime, id) => {
    const [rows] = await db.execute(
        "SELECT * FROM agendamentos WHERE data >= ? AND data <= ? AND id <> ?",
        [startDateTime, endDateTime, id]
    );
    return rows[0];
};

exports.update = async (id, data) => {
    await db.execute(
        "UPDATE agendamentos SET cliente=?, data=?, descricao=?, status=? WHERE id=?",
        [data.cliente, data.data, data.descricao, data.status, id]
    );
};

exports.delete = async (id) => {
    await db.execute("DELETE FROM agendamentos WHERE id=?", [id]);
};
