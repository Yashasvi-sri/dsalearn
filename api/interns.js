const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(request, response) {
  setHeaders(response);
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (!process.env.DATABASE_URL) {
    sendJson(response, 500, { error: "Database is not configured." });
    return;
  }

  try {
    await ensureSchema();
    if (request.method === "GET") {
      await listInterns(response);
      return;
    }
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    const body = await readJson(request);
    if (body.action === "signup") return signup(response, body);
    if (body.action === "login") return login(response, body);
    if (body.action === "signout") return signout(response, body);
    if (body.action === "reset-password") return resetPassword(response, body);
    sendJson(response, 400, { error: "Unknown action." });
  } catch (error) {
    sendJson(response, 500, { error: "Intern account service failed." });
  }
};

function setHeaders(response) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function ensureSchema() {
  await pool.query("create extension if not exists pgcrypto;");
  await pool.query(`
    create table if not exists interns (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text not null unique,
      password text not null,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      signed_out_at timestamptz,
      password_reset_at timestamptz
    );
  `);
}

async function listInterns(response) {
  const result = await pool.query(`
    select id, name, email, password, active, created_at, signed_out_at, password_reset_at
    from interns
    order by created_at asc
  `);
  sendJson(response, 200, { interns: result.rows.map(formatIntern) });
}

async function signup(response, body) {
  const name = cleanText(body.name);
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  if (!name || !email || !password) {
    sendJson(response, 400, { error: "Please enter name, email, and password." });
    return;
  }

  const existing = await pool.query("select * from interns where email = $1", [email]);
  if (existing.rows[0]) {
    if (existing.rows[0].active) {
      sendJson(response, 409, { error: "An account already exists for this email." });
      return;
    }
    sendJson(response, 403, { error: "Admin has signed out this intern. The same email cannot be used to create another account." });
    return;
  }

  const result = await pool.query(`
    insert into interns (name, email, password)
    values ($1, $2, $3)
    returning id, name, email, password, active, created_at, signed_out_at, password_reset_at
  `, [name, email, password]);
  sendJson(response, 201, { intern: formatIntern(result.rows[0]) });
}

async function login(response, body) {
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  const result = await pool.query("select * from interns where email = $1 and password = $2", [email, password]);
  const intern = result.rows[0];
  if (!intern) {
    sendJson(response, 404, { error: "No matching account found. Create an intern account or use admin credentials." });
    return;
  }
  if (!intern.active) {
    sendJson(response, 403, { error: "This intern account has been signed out by admin and cannot access the portal." });
    return;
  }
  sendJson(response, 200, { intern: formatIntern(intern) });
}

async function signout(response, body) {
  const email = cleanEmail(body.email);
  const result = await pool.query(`
    update interns
    set active = false, signed_out_at = now()
    where email = $1
    returning id, name, email, password, active, created_at, signed_out_at, password_reset_at
  `, [email]);
  if (!result.rows[0]) {
    sendJson(response, 404, { error: "Intern account not found." });
    return;
  }
  sendJson(response, 200, { intern: formatIntern(result.rows[0]) });
}

async function resetPassword(response, body) {
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  if (!email || !password) {
    sendJson(response, 400, { error: "Please enter your email ID and new password." });
    return;
  }

  const existing = await pool.query("select * from interns where email = $1", [email]);
  if (!existing.rows[0]) {
    sendJson(response, 404, { error: "No intern account exists for this email ID." });
    return;
  }
  if (!existing.rows[0].active) {
    sendJson(response, 403, { error: "This intern account was signed out by admin and cannot be reset." });
    return;
  }

  const result = await pool.query(`
    update interns
    set password = $2, password_reset_at = now()
    where email = $1
    returning id, name, email, password, active, created_at, signed_out_at, password_reset_at
  `, [email, password]);
  sendJson(response, 200, { intern: formatIntern(result.rows[0]) });
}

function formatIntern(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    active: row.active,
    createdAt: formatDate(row.created_at),
    signedOutAt: formatDate(row.signed_out_at),
    passwordResetAt: formatDate(row.password_reset_at)
  };
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "";
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}
