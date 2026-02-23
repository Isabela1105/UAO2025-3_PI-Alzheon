Feature: Cuidador

  Background:
    Given the server is running

  Scenario: Assign caregiver to patient and list caregivers
    Given I register a user with role "paciente" and email "patient2@example.com" and password "pass123"
    And I register a user with role "cuidador/familiar" and email "caregiver@example.com" and password "carepass"
    When I login as "caregiver@example.com" with password "carepass"
    And I assign caregiver with id of last registered caregiver to patient with id of last registered patient
    Then fetching caregivers for the patient should include the caregiver email "caregiver@example.com"
