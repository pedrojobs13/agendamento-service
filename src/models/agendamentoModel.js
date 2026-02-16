const db = require("../config/db");

exports.create = async (agendamento) => {
    const sql = "INSERT INTO agendamentos VALUES (?, ?, ?, ?, ?)";
    await db.execute(sql, Object.values(agendamento));
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

exports.update = async (id, data) => {
    await db.execute(
        "UPDATE agendamentos SET cliente=?, data=?, descricao=?, status=? WHERE id=?",
        [data.cliente, data.data, data.descricao, data.status, id]
    );
};

exports.delete = async (id) => {
    await db.execute("DELETE FROM agendamentos WHERE id=?", [id]);
};
