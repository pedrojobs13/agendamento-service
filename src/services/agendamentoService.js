const { v4: uuid } = require("uuid");
const model = require("../models/agendamentoModel");

const ALLOWED_STATUS = new Set(["PENDENTE", "CONFIRMADO", "CANCELADO"]);

const createError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const formatDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(400, "Data invalida. Use um datetime valido.");
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getHourRange = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(400, "Data invalida. Use um datetime valido.");
    }
    const start = new Date(date);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setMinutes(59, 59, 999);
    return {
        start: formatDateTime(start),
        end: formatDateTime(end),
    };
};

const ensureStatus = (status) => {
    if (!ALLOWED_STATUS.has(status)) {
        throw createError(400, "Status invalido.");
    }
};

exports.create = async (data) => {
    if (!data || !data.data) {
        throw createError(400, "Campo 'data' e obrigatorio.");
    }

    const normalizedDate = formatDateTime(data.data);
    const range = getHourRange(normalizedDate);
    const conflict = await model.findByHour(range.start, range.end);
    if (conflict) {
        throw createError(409, "Ja existe agendamento para esta mesma hora.");
    }

    const agendamento = {
        id: uuid(),
        ...data,
        data: normalizedDate,
        status: "PENDENTE",
    };

    await model.create(agendamento);
    return agendamento;
};

exports.update = async (id, data) => {
    if (!data || !data.data) {
        throw createError(400, "Campo 'data' e obrigatorio.");
    }

    ensureStatus(data.status);

    const normalizedDate = formatDateTime(data.data);
    const range = getHourRange(normalizedDate);
    const conflict = await model.findByHourExcludingId(range.start, range.end, id);
    if (conflict) {
        throw createError(409, "Ja existe agendamento para esta mesma hora.");
    }

    await model.update(id, {
        ...data,
        data: normalizedDate,
    });
};
