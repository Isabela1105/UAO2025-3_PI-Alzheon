const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const { expect } = require('chai');

Given('the server is running', async function() {
  if (!global.APP) throw new Error('App not available');
});

Given('I register with email {string} and password {string}', async function(email, password) {
  const res = await request(global.APP)
    .post('/api/usuarios')
    .send({ nombre: 'Test User', email, password, rol: 'paciente' });
  expect([200,201]).to.include(res.status);
});

When('I login with email {string} and password {string}', async function(email, password) {
  const res = await request(global.APP)
    .post('/api/login')
    .send({ email, password });
  this.lastLoginResponse = res;
});

Then('the login should succeed', function() {
  if (!this.lastLoginResponse) throw new Error('No login response');
  expect(this.lastLoginResponse.status).to.equal(200);
});

When('I request a password reset for {string}', async function(email) {
  const res = await request(global.APP)
    .post('/api/forgot-password')
    .send({ email });
  expect(res.status).to.equal(200);
});

Then('a reset link should be created', function() {
  const emails = global.__SENT_EMAILS || [];
  expect(emails.length).to.be.greaterThan(0);
  const last = emails[emails.length - 1];
  const match = last.html.match(/href\s*=\s*"([^"\s]+)"/);
  expect(match).to.not.be.null;
  this.resetLink = match[1];
});

When('I reset the password using the reset link to {string}', async function(newPassword) {
  const url = new URL(this.resetLink);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');
  expect(token).to.be.a('string');
  expect(email).to.be.a('string');

  const res = await request(global.APP)
    .post('/api/reset-password')
    .send({ email, token, newPassword });
  expect(res.status).to.equal(200);
});

Then('I can login with email {string} and password {string}', async function(email, password) {
  const res = await request(global.APP)
    .post('/api/login')
    .send({ email, password });
  expect(res.status).to.equal(200);
});
