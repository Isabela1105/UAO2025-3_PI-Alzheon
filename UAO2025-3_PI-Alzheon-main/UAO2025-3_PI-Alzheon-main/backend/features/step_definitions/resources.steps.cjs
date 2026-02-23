const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const { expect } = require('chai');

// Keep track of created users in scenario context
// NOTE: the 'the server is running' step is defined in auth.steps.cjs to avoid duplicate step definitions.

Given('I register a user with role {string} and email {string} and password {string}', async function(role, email, password) {
  const res = await request(global.APP)
    .post('/api/usuarios')
    .send({ nombre: 'User', email, password, rol: role });
  expect([200,201]).to.include(res.status);
  const user = res.body;
  this._users = this._users || [];
  this._users.push(user);
});

When('I login as {string} with password {string}', async function(email, password) {
  const res = await request(global.APP)
    .post('/api/login')
    .send({ email, password });
  expect(res.status).to.equal(200);
  const setCookie = res.headers['set-cookie'];
  this.cookie = setCookie && setCookie.length ? setCookie[0].split(';')[0] : null;
});

When('I update patient settings to enabled {word}, hour {string} and frequency {string}', async function(enabled, hour, frequency) {
  const body = {
    enabled: enabled === 'true',
    hour,
    frequency,
    motivationalMessage: 'test message'
  };
  const res = await request(global.APP)
    .put('/api/paciente/configuracion')
    .set('Cookie', this.cookie)
    .send(body);
  expect(res.status).to.equal(200);
});

Then('getting patient settings should return enabled {word} and hour {string} and frequency {string}', async function(enabled, hour, frequency) {
  const res = await request(global.APP)
    .get('/api/paciente/configuracion')
    .set('Cookie', this.cookie);
  expect(res.status).to.equal(200);
  const data = res.body;
  expect(data.enabled).to.equal(enabled === 'true');
  expect(data.hour).to.equal(hour);
  expect(data.frequency).to.equal(frequency);
});

When('I assign caregiver with id of last registered caregiver to patient with id of last registered patient', async function() {
  const users = this._users || [];
  const paciente = users.find(u => u.rol === 'paciente');
  const cuidador = users.find(u => u.rol === 'cuidador/familiar');
  expect(paciente).to.exist;
  expect(cuidador).to.exist;
  const res = await request(global.APP)
    .post(`/api/usuarios/${paciente._id}/cuidadores/${cuidador._id}`)
    .set('Cookie', this.cookie);
  expect(res.status).to.equal(200);
});

Then('fetching caregivers for the patient should include the caregiver email {string}', async function(expectedEmail) {
  const users = this._users || [];
  const paciente = users.find(u => u.rol === 'paciente');
  const res = await request(global.APP)
    .get(`/api/usuarios/${paciente._id}/cuidadores`)
    .set('Cookie', this.cookie);
  expect(res.status).to.equal(200);
  const list = res.body;
  const emails = list.map(u => u.email);
  expect(emails).to.include(expectedEmail);
});

When('I assign patient with id of last registered patient to medico with id of last registered medico', async function() {
  const users = this._users || [];
  const paciente = users.find(u => u.rol === 'paciente');
  const medico = users.find(u => u.rol === 'medico');
  expect(paciente).to.exist;
  expect(medico).to.exist;
  const res = await request(global.APP)
    .post(`/api/usuarios/${medico._id}/pacientes/${paciente._id}`)
    .set('Cookie', this.cookie);
  expect(res.status).to.equal(200);
});

Then('fetching patients for the medico should include the patient email {string}', async function(expectedEmail) {
  const users = this._users || [];
  const medico = users.find(u => u.rol === 'medico');
  const res = await request(global.APP)
    .get(`/api/usuarios/${medico._id}/pacientes`)
    .set('Cookie', this.cookie);
  expect(res.status).to.equal(200);
  const list = res.body;
  const emails = list.map(u => u.email);
  expect(emails).to.include(expectedEmail);
});
