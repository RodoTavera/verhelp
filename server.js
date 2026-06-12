import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { getDefaultAvatarConfig, sanitizeAvatarConfig } from "./src/shared/petAvatar.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5500;
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const sessions = new Map();
let db = loadDatabase();

app.use(express.json({ limit: "2mb" }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, data: { status: "up" } });
});

app.get("/api/clinics", (req, res) => {
  const query = clean(req.query.query).toLowerCase();
  const clinics = !query
    ? db.clinics
    : db.clinics.filter((clinic) => {
        const line = `${clinic.name} ${clinic.district} ${clinic.speciality}`.toLowerCase();
        return line.includes(query);
      });

  res.json({ ok: true, data: clinics });
});

app.post("/api/register/owner", (req, res) => {
  const fullName = clean(req.body.fullName);
  const dni = clean(req.body.dni);
  const email = clean(req.body.email).toLowerCase();
  const password = clean(req.body.password);

  if (!fullName) return fail(res, 400, "Nombre completo requerido.");
  if (!validateDni(dni)) return fail(res, 400, "DNI invalido. Debe tener 8 digitos.");
  if (!validateEmail(email)) return fail(res, 400, "Correo invalido.");
  if (!validatePassword(password)) return fail(res, 400, "Contrasena minima: 6 caracteres.");

  if (db.users.some((user) => user.email === email || user.dni === dni)) {
    return fail(res, 409, "Ya existe un usuario con ese correo o DNI.");
  }

  const pwd = hashPassword(password);
  const user = {
    id: uid("USR"),
    role: "owner",
    fullName,
    dni,
    email,
    passwordSalt: pwd.salt,
    passwordHash: pwd.hash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDatabase();

  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  res.status(201).json({
    ok: true,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

app.post("/api/register/family", (req, res) => {
  const fullName = clean(req.body.fullName);
  const dni = clean(req.body.dni);
  const ownerDni = clean(req.body.ownerDni);
  const email = clean(req.body.email).toLowerCase();
  const password = clean(req.body.password);

  if (!fullName) return fail(res, 400, "Nombre completo requerido.");
  if (!validateDni(dni) || !validateDni(ownerDni)) {
    return fail(res, 400, "DNI invalido. Deben tener 8 digitos.");
  }
  if (!validateEmail(email)) return fail(res, 400, "Correo invalido.");
  if (!validatePassword(password)) return fail(res, 400, "Contrasena minima: 6 caracteres.");

  const owner = db.users.find((user) => user.role === "owner" && user.dni === ownerDni);
  if (!owner) return fail(res, 404, "No existe un dueno registrado con ese DNI.");

  if (db.users.some((user) => user.email === email || user.dni === dni)) {
    return fail(res, 409, "Ya existe un usuario con ese correo o DNI.");
  }

  const pwd = hashPassword(password);
  const user = {
    id: uid("USR"),
    role: "family",
    fullName,
    dni,
    ownerDni,
    email,
    passwordSalt: pwd.salt,
    passwordHash: pwd.hash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDatabase();

  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  res.status(201).json({
    ok: true,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

app.post("/api/register/vet", (req, res) => {
  const clinicName = clean(req.body.clinicName);
  const ruc = clean(req.body.ruc);
  const email = clean(req.body.email).toLowerCase();
  const password = clean(req.body.password);

  if (!clinicName) return fail(res, 400, "Nombre de veterinaria requerido.");
  if (!validateRuc(ruc)) return fail(res, 400, "RUC invalido. Debe tener 11 digitos.");
  if (!validateEmail(email)) return fail(res, 400, "Correo invalido.");
  if (!validatePassword(password)) return fail(res, 400, "Contrasena minima: 6 caracteres.");

  if (db.users.some((user) => user.email === email || user.ruc === ruc)) {
    return fail(res, 409, "Ya existe una veterinaria con ese correo o RUC.");
  }

  const pwd = hashPassword(password);
  const user = {
    id: uid("USR"),
    role: "vet",
    clinicName,
    ruc,
    email,
    passwordSalt: pwd.salt,
    passwordHash: pwd.hash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDatabase();

  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  res.status(201).json({
    ok: true,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

app.post("/api/login", (req, res) => {
  const role = clean(req.body.role);
  let identifier = clean(req.body.identifier || req.body.dni || req.body.ruc || req.body.code || "");
  let email = clean(req.body.email || "").toLowerCase();
  const password = clean(req.body.password);

  if (role === "admin") {
    identifier = clean(identifier || email).toLowerCase();
    email = identifier;
  }

  if (!role || !identifier || !password) {
    return fail(res, 400, "Credenciales incompletas.");
  }

  let user;
  if (role === "owner" || role === "family") {
    if (!validateDni(identifier)) return fail(res, 400, "DNI invalido.");
    // Find user by DNI regardless of email if email not provided
    user = email 
      ? db.users.find((candidate) => candidate.role === role && candidate.dni === identifier && candidate.email === email)
      : db.users.find((candidate) => candidate.role === role && candidate.dni === identifier);
  } else if (role === "vet") {
    if (!validateRuc(identifier)) return fail(res, 400, "RUC invalido.");
    user = email
      ? db.users.find((candidate) => candidate.role === "vet" && candidate.ruc === identifier && candidate.email === email)
      : db.users.find((candidate) => candidate.role === "vet" && candidate.ruc === identifier);
  } else if (role === "airline") {
    if (!validateAirlineCode(identifier)) return fail(res, 400, "Codigo aerolinea invalido.");
    user = email
      ? db.users.find((candidate) => candidate.role === "airline" && candidate.airlineCode === identifier.toUpperCase() && candidate.email === email)
      : db.users.find((candidate) => candidate.role === "airline" && candidate.airlineCode === identifier.toUpperCase());
  } else if (role === "admin") {
    if (!validateEmail(email)) return fail(res, 400, "Correo admin invalido.");
    user = db.users.find((candidate) => candidate.role === "admin" && candidate.email === email);
  } else {
    return fail(res, 400, "Rol no soportado.");
  }

  if (!user) return fail(res, 401, "Credenciales incorrectas.");
  if (!verifyPassword(password, user)) return fail(res, 401, "Credenciales incorrectas.");

  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  res.json({
    ok: true,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

app.get("/api/session", authRequired, (req, res) => {
  res.json({ ok: true, data: { user: sanitizeUser(req.userRaw) } });
});

app.post("/api/logout", authRequired, (req, res) => {
  sessions.delete(req.token);
  res.json({ ok: true, data: { loggedOut: true } });
});

app.get("/api/admin/overview", authRequired, adminOnly, (_req, res) => {
  const users = [...db.users]
    .map((user) => sanitizeUser(user))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentPets = [...db.pets]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 6);

  const recentRecords = [...db.records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const roleBreakdown = db.users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    { admin: 0, owner: 0, family: 0, vet: 0, airline: 0 },
  );

  const topClinics = [...db.clinics]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 5);

  res.json({
    ok: true,
    data: {
      counts: {
        users: db.users.length,
        pets: db.pets.length,
        records: db.records.length,
        clinics: db.clinics.length,
        audit: db.audit.length,
      },
      roleBreakdown,
      recentUsers: users.slice(0, 6),
      recentPets,
      recentRecords,
      topClinics,
    },
  });
});

app.get("/api/admin/users", authRequired, adminOnly, (_req, res) => {
  const users = [...db.users]
    .map((user) => sanitizeUser(user))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ ok: true, data: users });
});

app.get("/api/admin/clinics", authRequired, adminOnly, (_req, res) => {
  const clinics = [...db.clinics].sort((a, b) => a.name.localeCompare(b.name, "es"));
  res.json({ ok: true, data: clinics });
});

app.post("/api/admin/clinics", authRequired, adminOnly, (req, res) => {
  const name = clean(req.body.name);
  const district = clean(req.body.district);
  const speciality = clean(req.body.speciality || req.body.specialty);
  const rating = Number(req.body.rating || 0);
  const reviews = Number(req.body.reviews || 0);

  if (!name || !district || !speciality) {
    return fail(res, 400, "Nombre, distrito y especialidad son obligatorios.");
  }

  const clinic = {
    id: uid("CLN"),
    name,
    district,
    speciality,
    rating: Number.isFinite(rating) && rating > 0 ? Math.min(Math.max(rating, 0), 5) : 4.5,
    reviews: Number.isFinite(reviews) && reviews >= 0 ? Math.floor(reviews) : 0,
  };

  db.clinics.push(clinic);
  saveDatabase();

  res.status(201).json({ ok: true, data: { clinic } });
});

app.delete("/api/admin/clinics/:clinicId", authRequired, adminOnly, (req, res) => {
  const clinicId = clean(req.params.clinicId).toUpperCase();
  const index = db.clinics.findIndex((clinic) => clinic.id === clinicId);

  if (index < 0) return fail(res, 404, "Clinica no encontrada.");

  const [clinic] = db.clinics.splice(index, 1);
  saveDatabase();

  res.json({ ok: true, data: { clinic, removed: true } });
});

app.get("/api/pets", authRequired, (req, res) => {
  const pets = getAccessiblePets(req.userRaw);
  res.json({ ok: true, data: pets });
});

app.get("/api/pets/:petId", authRequired, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const pet = getPetById(petId);

  if (!pet) return fail(res, 404, "Mascota no encontrada.");
  if (!canViewPet(req.userRaw, pet)) return fail(res, 403, "No tienes permisos para ver esta mascota.");

  res.json({ ok: true, data: pet });
});

app.get("/api/pets/:petId/records", authRequired, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const pet = getPetById(petId);

  if (!pet) return fail(res, 404, "Mascota no encontrada.");
  if (!canViewPet(req.userRaw, pet)) return fail(res, 403, "No tienes permisos para ver esta mascota.");

  const records = db.records.filter((record) => record.petId === petId);
  const audit = db.audit.filter((item) => item.petId === petId);

  res.json({ ok: true, data: { records, audit } });
});

app.post("/api/pets", authRequired, ownerOnly, (req, res) => {
  const name = clean(req.body.name);
  const species = clean(req.body.species) || "perro";
  const sex = clean(req.body.sex) || "hembra";
  const birthDate = clean(req.body.birthDate);
  const traits = clean(req.body.traits);
  const ownerComment = clean(req.body.ownerComment);
  const allergies = toTagList(req.body.allergies);
  const vaccines = toTagList(req.body.vaccines);
  const avatarConfig = sanitizeAvatarConfig(req.body.avatarConfig, species);

  if (!name || !birthDate) {
    return fail(res, 400, "Nombre y fecha de nacimiento son obligatorios.");
  }

  const now = new Date().toISOString();
  const petId = generatePetId();

  const pet = {
    petId,
    name,
    species,
    sex,
    birthDate,
    traits,
    ownerComment,
    estimatedBreed: estimateBreedWithAi(species, traits, ownerComment),
    ownerDni: req.userRaw.dni,
    allergies,
    vaccines,
    avatarConfig,
    familyDnis: [],
    authorizedVetRucs: [],
    createdAt: now,
    updatedAt: now,
  };

  db.pets.push(pet);

  db.records.push({
    id: uid("REC"),
    petId,
    type: "alta",
    description: "Ficha digital creada por el dueno.",
    vaccinesAdded: vaccines,
    allergiesAdded: allergies,
    attachments: [],
    actorRole: "owner",
    actorName: req.userRaw.fullName,
    actorId: req.userRaw.dni,
    clinicName: "",
    createdAt: now,
  });

  addAudit("pet-created", req.userRaw, petId, "Se creo la ficha digital inicial");
  saveDatabase();

  res.status(201).json({ ok: true, data: { pet } });
});

app.patch("/api/pets/:petId", authRequired, ownerOnly, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const pet = getPetById(petId);

  if (!pet) return fail(res, 404, "Mascota no encontrada.");
  if (pet.ownerDni !== req.userRaw.dni) {
    return fail(res, 403, "Solo el dueno puede editar la ficha base.");
  }

  if (typeof req.body.allergies === "string") {
    pet.allergies = toTagList(req.body.allergies);
  }
  if (typeof req.body.vaccines === "string") {
    pet.vaccines = toTagList(req.body.vaccines);
  }
  if (typeof req.body.ownerComment === "string" && clean(req.body.ownerComment)) {
    pet.ownerComment = clean(req.body.ownerComment);
  }
  if (req.body.avatarConfig && typeof req.body.avatarConfig === "object" && !Array.isArray(req.body.avatarConfig)) {
    pet.avatarConfig = sanitizeAvatarConfig(req.body.avatarConfig, pet.species);
  }

  pet.estimatedBreed = estimateBreedWithAi(pet.species, pet.traits, pet.ownerComment);
  pet.updatedAt = new Date().toISOString();

  addAudit("pet-updated", req.userRaw, pet.petId, "Dueno actualizo datos base");
  saveDatabase();

  res.json({ ok: true, data: { pet } });
});

app.post("/api/pets/:petId/authorize-vet", authRequired, ownerOnly, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const vetRuc = clean(req.body.vetRuc);

  if (!validateRuc(vetRuc)) return fail(res, 400, "RUC invalido.");

  const pet = getPetById(petId);
  if (!pet) return fail(res, 404, "Mascota no encontrada.");
  if (pet.ownerDni !== req.userRaw.dni) {
    return fail(res, 403, "Solo el dueno puede autorizar veterinarias.");
  }

  const vet = db.users.find((user) => user.role === "vet" && user.ruc === vetRuc);
  if (!vet) return fail(res, 404, "Veterinaria no encontrada.");

  pet.authorizedVetRucs = mergeUnique(pet.authorizedVetRucs, [vetRuc]);
  pet.updatedAt = new Date().toISOString();

  addAudit(
    "vet-authorized",
    req.userRaw,
    pet.petId,
    `Se autorizo a ${vet.clinicName} (${vet.ruc}) para editar`,
  );

  saveDatabase();
  res.json({ ok: true, data: { pet } });
});

app.post("/api/pets/:petId/grant-family", authRequired, ownerOnly, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const familyDni = clean(req.body.familyDni);

  if (!validateDni(familyDni)) return fail(res, 400, "DNI familiar invalido.");

  const pet = getPetById(petId);
  if (!pet) return fail(res, 404, "Mascota no encontrada.");
  if (pet.ownerDni !== req.userRaw.dni) {
    return fail(res, 403, "Solo el dueno puede compartir mascotas.");
  }

  const familyUser = db.users.find((user) => user.role === "family" && user.dni === familyDni);
  if (!familyUser) return fail(res, 404, "Usuario familiar no encontrado.");

  pet.familyDnis = mergeUnique(pet.familyDnis, [familyDni]);
  pet.updatedAt = new Date().toISOString();

  addAudit(
    "family-granted",
    req.userRaw,
    pet.petId,
    `Se otorgo visualizacion a ${familyUser.fullName} (${familyUser.dni})`,
  );

  saveDatabase();
  res.json({ ok: true, data: { pet } });
});

app.post("/api/pets/:petId/records", authRequired, (req, res) => {
  if (!["owner", "vet"].includes(req.userRaw.role)) {
    return fail(res, 403, "Este rol no puede agregar registros clinicos.");
  }

  const petId = clean(req.params.petId).toUpperCase();
  const pet = getPetById(petId);
  if (!pet) return fail(res, 404, "Mascota no encontrada.");

  if (!canEditPet(req.userRaw, pet)) {
    return fail(res, 403, "No tienes permisos de edicion para esta mascota.");
  }

  const description = clean(req.body.description);
  if (!description) return fail(res, 400, "La descripcion es obligatoria.");

  const recordType = clean(req.body.recordType || req.body.type) || "nota";
  const vaccinesAdded = toTagList(req.body.newVaccines ?? req.body.vaccines);
  const allergiesAdded = toTagList(req.body.newAllergies ?? req.body.allergies);
  const attachments = toTagList(req.body.attachments);

  const now = new Date().toISOString();

  const record = {
    id: uid("REC"),
    petId,
    type: recordType,
    description,
    vaccinesAdded,
    allergiesAdded,
    attachments,
    actorRole: req.userRaw.role,
    actorName: req.userRaw.role === "vet" ? req.userRaw.clinicName : req.userRaw.fullName,
    actorId: req.userRaw.role === "vet" ? req.userRaw.ruc : req.userRaw.dni,
    clinicName: req.userRaw.role === "vet" ? req.userRaw.clinicName : "",
    createdAt: now,
  };

  db.records.push(record);

  if (vaccinesAdded.length) pet.vaccines = mergeUnique(pet.vaccines, vaccinesAdded);
  if (allergiesAdded.length) pet.allergies = mergeUnique(pet.allergies, allergiesAdded);
  pet.updatedAt = now;

  addAudit(
    "record-added",
    req.userRaw,
    pet.petId,
    `${labelRole(req.userRaw.role)} agrego registro ${recordType}`,
  );

  saveDatabase();
  res.status(201).json({ ok: true, data: { record } });
});

app.get("/api/vet/lookup/:petId", authRequired, vetOnly, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const pet = getPetById(petId);

  if (!pet) return fail(res, 404, "Mascota no encontrada.");

  const canEdit = pet.authorizedVetRucs.includes(req.userRaw.ruc);
  res.json({
    ok: true,
    data: {
      petId: pet.petId,
      petName: pet.name,
      ownerDni: pet.ownerDni,
      canEdit,
    },
  });
});

app.get("/api/airline/verify/:petId", authRequired, airlineOnly, (req, res) => {
  const petId = clean(req.params.petId).toUpperCase();
  const pet = getPetById(petId);
  if (!pet) return fail(res, 404, "Mascota no encontrada.");

  const records = db.records
    .filter((record) => record.petId === petId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasRabies = pet.vaccines.some((item) => /rabia|rabies/i.test(item));
  const lastControl = records[0] ? records[0].createdAt : null;
  const hasRecentControl = lastControl ? daysBetween(lastControl, new Date().toISOString()) <= 365 : false;

  let travelStatus = "NO APTO";
  if (hasRabies && hasRecentControl) travelStatus = "APTO PARA REVISION FINAL";
  else if (hasRabies) travelStatus = "APTO CONDICIONAL (falta control reciente)";
  else travelStatus = "NO APTO (falta vacuna antirrabica)";

  res.json({
    ok: true,
    data: {
      petId: pet.petId,
      petName: pet.name,
      species: pet.species,
      vaccines: pet.vaccines,
      allergies: pet.allergies,
      lastControl,
      travelStatus,
    },
  });
});

app.use(express.static(__dirname));

app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`VetHelp Cloud API running on http://localhost:${PORT}`);
});

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const seeded = buildSeedDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf-8");
      return seeded;
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const normalized = normalizeDatabase(parsed);
    fs.writeFileSync(DB_FILE, JSON.stringify(normalized, null, 2), "utf-8");
    return normalized;
  } catch (_error) {
    const seeded = buildSeedDatabase();
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
}

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function normalizeDatabase(candidate) {
  const normalized = {
    users: Array.isArray(candidate.users) ? candidate.users : [],
    pets: Array.isArray(candidate.pets) ? candidate.pets : [],
    records: Array.isArray(candidate.records) ? candidate.records : [],
    clinics: Array.isArray(candidate.clinics) ? candidate.clinics : buildSeedDatabase().clinics,
    audit: Array.isArray(candidate.audit) ? candidate.audit : [],
  };

  normalized.users = normalized.users.map((user) => {
    if (user.passwordHash && user.passwordSalt) {
      // Detectar hashes antiguos (SHA-256 simple de 64 hex) y regenerarlos con pbkdf2 (128 hex)
      // para que verifyPassword() con timingSafeEqual no falle por diferencia de longitud.
      if (user.passwordHash.length !== 128 || user.passwordSalt.length < 8) {
        const pwd = hashPassword(clean(user.password || "demo123"));
        return { ...user, passwordHash: pwd.hash, passwordSalt: pwd.salt };
      }
      return user;
    }

    const pwd = hashPassword(clean(user.password || "demo123"));
    const migrated = { ...user, passwordHash: pwd.hash, passwordSalt: pwd.salt };
    delete migrated.password;
    return migrated;
  });

  normalized.pets = normalized.pets.map((pet) => ({
    ...pet,
    allergies: Array.isArray(pet.allergies) ? pet.allergies.map((item) => clean(item)).filter(Boolean) : [],
    vaccines: Array.isArray(pet.vaccines) ? pet.vaccines.map((item) => clean(item)).filter(Boolean) : [],
    familyDnis: Array.isArray(pet.familyDnis) ? pet.familyDnis.map((item) => clean(item)).filter(Boolean) : [],
    authorizedVetRucs: Array.isArray(pet.authorizedVetRucs)
      ? pet.authorizedVetRucs.map((item) => clean(item)).filter(Boolean)
      : [],
    avatarConfig: sanitizeAvatarConfig(pet.avatarConfig, pet.species),
  }));

  if (!normalized.users.some((user) => user.role === "admin")) {
    const pwd = hashPassword("admin123");
    normalized.users.unshift({
      id: uid("USR"),
      role: "admin",
      fullName: "Sofia Ramirez",
      email: "admin@vethelp.cloud",
      passwordHash: pwd.hash,
      passwordSalt: pwd.salt,
      createdAt: new Date().toISOString(),
    });
  }

  if (!normalized.users.some((user) => user.role === "airline")) {
    const pwd = hashPassword("air12345");
    normalized.users.push({
      id: uid("USR"),
      role: "airline",
      airlineCode: "AERO001",
      email: "vuelos@airpet.com",
      passwordHash: pwd.hash,
      passwordSalt: pwd.salt,
      createdAt: new Date().toISOString(),
    });
  }

  return normalized;
}

function buildSeedDatabase() {
  const now = new Date().toISOString();
  const adminPwd = hashPassword("admin123");
  const ownerPwd = hashPassword("demo123");
  const familyPwd = hashPassword("demo123");
  const vetPwd = hashPassword("demo123");
  const airlinePwd = hashPassword("air12345");

  return {
    users: [
      {
        id: uid("USR"),
        role: "admin",
        fullName: "Sofia Ramirez",
        email: "admin@vethelp.cloud",
        passwordSalt: adminPwd.salt,
        passwordHash: adminPwd.hash,
        createdAt: now,
      },
      {
        id: uid("USR"),
        role: "owner",
        fullName: "Maria Vega",
        dni: "44556677",
        email: "maria@demo.com",
        passwordSalt: ownerPwd.salt,
        passwordHash: ownerPwd.hash,
        createdAt: now,
      },
      {
        id: uid("USR"),
        role: "family",
        fullName: "Leo Vega",
        dni: "77889911",
        ownerDni: "44556677",
        email: "leo@demo.com",
        passwordSalt: familyPwd.salt,
        passwordHash: familyPwd.hash,
        createdAt: now,
      },
      {
        id: uid("USR"),
        role: "vet",
        clinicName: "Clinica Animal Sur",
        ruc: "20123456789",
        email: "vet@demo.com",
        passwordSalt: vetPwd.salt,
        passwordHash: vetPwd.hash,
        createdAt: now,
      },
      {
        id: uid("USR"),
        role: "airline",
        airlineCode: "AERO001",
        email: "vuelos@airpet.com",
        passwordSalt: airlinePwd.salt,
        passwordHash: airlinePwd.hash,
        createdAt: now,
      },
    ],
    pets: [
      {
        petId: "PET-2026-0001",
        name: "Luna",
        species: "perro",
        sex: "hembra",
        birthDate: "2021-02-12",
        traits: "pelaje corto, orejas largas",
        ownerComment: "es tranquila y sociable",
        estimatedBreed: "Cocker Spaniel (estimacion IA)",
        ownerDni: "44556677",
        allergies: ["pollo"],
        vaccines: ["rabia", "parvovirus", "moquillo"],
        avatarConfig: getDefaultAvatarConfig("perro"),
        familyDnis: ["77889911"],
        authorizedVetRucs: ["20123456789"],
        createdAt: now,
        updatedAt: now,
      },
    ],
    records: [
      {
        id: uid("REC"),
        petId: "PET-2026-0001",
        type: "consulta",
        description: "Chequeo general. Estado estable.",
        vaccinesAdded: [],
        allergiesAdded: [],
        attachments: ["informe-chequeo.pdf"],
        actorRole: "vet",
        actorName: "Clinica Animal Sur",
        actorId: "20123456789",
        clinicName: "Clinica Animal Sur",
        createdAt: now,
      },
    ],
    clinics: [
      {
        id: "CLN-01",
        name: "Clinica Animal Sur",
        district: "Surco",
        rating: 4.9,
        speciality: "Vacunas y medicina preventiva",
        reviews: 312,
      },
      {
        id: "CLN-02",
        name: "Vet Plaza Central",
        district: "Miraflores",
        rating: 4.7,
        speciality: "Dermatologia y alergias",
        reviews: 201,
      },
      {
        id: "CLN-03",
        name: "Paws 24h",
        district: "San Isidro",
        rating: 4.8,
        speciality: "Emergencias y hospitalizacion",
        reviews: 456,
      },
      {
        id: "CLN-04",
        name: "Centro Vet Norte",
        district: "Los Olivos",
        rating: 4.6,
        speciality: "Cirugia y rehabilitacion",
        reviews: 174,
      },
      {
        id: "CLN-05",
        name: "PetCare Lima Este",
        district: "Ate",
        rating: 4.5,
        speciality: "Nutricion y control senior",
        reviews: 98,
      },
    ],
    audit: [
      {
        id: uid("AUD"),
        petId: "PET-2026-0001",
        action: "pet-created",
        actorRole: "owner",
        actorName: "Maria Vega",
        actorId: "44556677",
        details: "Ficha inicial registrada",
        createdAt: now,
      },
    ],
  };
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return fail(res, 401, "Sesion invalida.");

  const session = sessions.get(token);
  if (!session) return fail(res, 401, "Sesion expirada.");

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return fail(res, 401, "Sesion expirada.");
  }

  const user = db.users.find((item) => item.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return fail(res, 401, "Sesion invalida.");
  }

  req.token = token;
  req.userRaw = user;
  next();
}

function ownerOnly(req, res, next) {
  if (req.userRaw.role !== "owner") return fail(res, 403, "Acceso solo para duenos.");
  next();
}

function vetOnly(req, res, next) {
  if (req.userRaw.role !== "vet") return fail(res, 403, "Acceso solo para veterinarias.");
  next();
}

function airlineOnly(req, res, next) {
  if (req.userRaw.role !== "airline") return fail(res, 403, "Acceso solo para aerolineas.");
  next();
}

function adminOnly(req, res, next) {
  if (req.userRaw.role !== "admin") return fail(res, 403, "Acceso solo para administracion.");
  next();
}

function getAccessiblePets(user) {
  if (user.role === "owner") return db.pets.filter((pet) => pet.ownerDni === user.dni);
  if (user.role === "family") return db.pets.filter((pet) => pet.familyDnis.includes(user.dni));
  if (user.role === "vet") return db.pets;
  if (user.role === "admin") return db.pets;
  return [];
}

function canViewPet(user, pet) {
  if (user.role === "owner") return pet.ownerDni === user.dni;
  if (user.role === "family") return pet.familyDnis.includes(user.dni);
  if (user.role === "vet") return true;
  if (user.role === "admin") return true;
  return false;
}

function canEditPet(user, pet) {
  if (user.role === "owner") return pet.ownerDni === user.dni;
  if (user.role === "vet") return pet.authorizedVetRucs.includes(user.ruc);
  return false;
}

function getPetById(petId) {
  return db.pets.find((pet) => pet.petId === petId);
}

function sanitizeUser(user) {
  const cleanUser = { ...user };
  delete cleanUser.password;
  delete cleanUser.passwordHash;
  delete cleanUser.passwordSalt;
  return cleanUser;
}

function estimateBreedWithAi(species, traits, ownerComment) {
  const text = `${traits} ${ownerComment}`.toLowerCase();

  if (species !== "perro") {
    if (species === "gato") return "Gato comun (estimacion IA)";
    return "Especie no canina (estimacion IA)";
  }

  if (text.includes("hocico corto") || text.includes("cara plana")) {
    return "Bulldog (estimacion IA)";
  }
  if (text.includes("orejas largas") && text.includes("pelaje corto")) {
    return "Cocker Spaniel (estimacion IA)";
  }
  if (text.includes("grande") && text.includes("protector")) {
    return "Pastor Aleman (estimacion IA)";
  }
  if (text.includes("pequeno") && text.includes("rizado")) {
    return "Poodle (estimacion IA)";
  }
  if (text.includes("muy activo") || text.includes("corre mucho")) {
    return "Border Collie (estimacion IA)";
  }

  return "Mestizo (estimacion IA)";
}

function addAudit(action, actor, petId, details) {
  db.audit.push({
    id: uid("AUD"),
    petId,
    action,
    actorRole: actor.role,
    actorName: actor.role === "vet" ? actor.clinicName : actor.fullName || actor.airlineCode,
    actorId: actor.role === "vet" ? actor.ruc : actor.dni || actor.airlineCode,
    details,
    createdAt: new Date().toISOString(),
  });
}

function generatePetId() {
  const year = new Date().getFullYear();
  let serial = 1;
  while (true) {
    const candidate = `PET-${year}-${String(serial).padStart(4, "0")}`;
    if (!db.pets.some((pet) => pet.petId === candidate)) return candidate;
    serial += 1;
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 110000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const pwd = hashPassword(password, user.passwordSalt);
  return crypto.timingSafeEqual(Buffer.from(pwd.hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function toTagList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => clean(item)).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeUnique(baseList, incomingList) {
  const map = new Map();
  baseList.forEach((item) => map.set(String(item).toLowerCase(), item));
  incomingList.forEach((item) => {
    const key = String(item).toLowerCase();
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
}

function clean(value) {
  return String(value || "").trim();
}

function fail(res, status, message) {
  return res.status(status).json({ ok: false, message });
}

function uid(prefix) {
  const random =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`.toUpperCase();
}

function validateDni(value) {
  return /^\d{8}$/.test(value);
}

function validateRuc(value) {
  return /^\d{11}$/.test(value);
}

function validatePassword(value) {
  return String(value || "").length >= 6;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateAirlineCode(value) {
  return /^[A-Za-z0-9]{5,12}$/.test(value);
}

function daysBetween(fromIso, toIso) {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.MAX_SAFE_INTEGER;
  return Math.floor(Math.abs(to - from) / (1000 * 60 * 60 * 24));
}

function labelRole(role) {
  const labels = {
    admin: "Admin",
    owner: "Dueno",
    family: "Familiar",
    vet: "Veterinaria",
    airline: "Aerolinea",
  };
  return labels[role] || role;
}
