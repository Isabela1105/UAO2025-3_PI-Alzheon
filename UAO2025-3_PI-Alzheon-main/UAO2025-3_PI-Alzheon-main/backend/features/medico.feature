Feature: Medico

  Background:
    Given the server is running

  Scenario: Assign patient to medico and list patients
    Given I register a user with role "paciente" and email "patient3@example.com" and password "pass123"
    And I register a user with role "medico" and email "medico@example.com" and password "medpass"
    When I login as "medico@example.com" with password "medpass"
    And I assign patient with id of last registered patient to medico with id of last registered medico
    Then fetching patients for the medico should include the patient email "patient3@example.com"
