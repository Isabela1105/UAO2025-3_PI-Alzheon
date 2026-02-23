Feature: Authentication

  Background:
    Given the server is running

  Scenario: Register, login, request password reset and reset password
    Given I register with email "testuser@example.com" and password "oldpass"
    When I login with email "testuser@example.com" and password "oldpass"
    Then the login should succeed

    When I request a password reset for "testuser@example.com"
    Then a reset link should be created
    When I reset the password using the reset link to "newpass"
    Then I can login with email "testuser@example.com" and password "newpass"
