Feature: Paciente

  Background:
    Given the server is running

  Scenario: Patient updates and retrieves configuration
    Given I register a user with role "paciente" and email "patient@example.com" and password "pass123"
    When I login as "patient@example.com" with password "pass123"
    And I update patient settings to enabled true, hour "09:00" and frequency "diario"
    Then getting patient settings should return enabled true and hour "09:00" and frequency "diario"
