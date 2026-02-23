import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';

Given('the server is running', async function() {
  // global.APP is configured in hooks
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
  expect(this.lastLoginResponse.status).to.equal(200);
});

When('I request a password reset for {string}', async function(email) {
  const res = await request(global.APP)
    .post('/api/forgot-password')
    .send({ email });
  expect(res.status).to.equal(200);
});

Then('a reset link should be created', function() {
  // In test mode, reminderMailer stores sent emails in global.__SENT_EMAILS
  const emails = global.__SENT_EMAILS || [];
  expect(emails.length).to.be.greaterThan(0);
  // Find the last reset email and extract link
  const last = emails[emails.length - 1];
  const match = last.html.match(/href\s*=\s*"([^"\s]+)"/);
  expect(match).to.not.be.null;
  this.resetLink = match[1];
});

When('I reset the password using the reset link to {string}', async function(newPassword) {
  // Extract token and email from the link query params
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
