const { v4: uuid } = require("uuid");
const model = require("../models/agendamentoModel");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const ALLOWED_STATUS = new Set(["PENDENTE", "CONFIRMADO", "CANCELADO"]);
const DEFAULT_NOTIFICATION_URL = "http://localhost:8080/notifications/send";

const createError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const postJson = (targetUrl, payload) => new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const body = JSON.stringify(payload);
    const client = url.protocol === "https:" ? https : http;

    const req = client.request(
        {
            hostname: url.hostname,
            port: url.port || (url.protocol === "https:" ? 443 : 80),
            path: `${url.pathname}${url.search}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
            },
        },
        (res) => {
            res.resume();
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve();
                return;
            }
            reject(new Error(`Notificacao falhou com status ${res.statusCode}`));
        }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
});

const sendNotification = async (agendamento) => {
    const targetUrl = process.env.NOTIFICATION_URL || DEFAULT_NOTIFICATION_URL;
    const payload = {
        title: "Agendamento criado",
        message: `Agendamento para ${agendamento.cliente || "cliente"} em ${agendamento.data}.`,
    };

    await postJson(targetUrl, payload);
};

const isNotificationRequired = () => {
    const value = String(process.env.NOTIFICATION_REQUIRED || "").toLowerCase();
    return value === "1" || value === "true";
};

const formatDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(400, "Data invalida. Use um datetime valido.");
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
    const conflict = await model.findByHour(normalizedDate);
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

    try {
        await sendNotification(agendamento);
    } catch (err) {
        if (isNotificationRequired()) {
            throw createError(502, "Falha ao enviar notificacao.");
        }
        console.warn("Falha ao enviar notificacao:", err.message);
    }

    return agendamento;
};

exports.update = async (id, data) => {
    if (!data || !data.data) {
        throw createError(400, "Campo 'data' e obrigatorio.");
    }

    ensureStatus(data.status);

    const normalizedDate = formatDateTime(data.data);
    const conflict = await model.findByHourExcludingId(normalizedDate, id);
    if (conflict) {
        throw createError(409, "Ja existe agendamento para esta mesma hora.");
    }

    await model.update(id, {
        ...data,
        data: normalizedDate,
    });
};
