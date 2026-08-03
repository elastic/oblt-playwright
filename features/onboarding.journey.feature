Feature: Observability Onboarding
  As a user setting up Elastic Observability
  I want to onboard a host to collect logs and metrics
  So that I can start receiving and viewing data in Kibana

  Background:
    Given I navigate to the Observability Onboarding section

  Scenario: Onboard a host using auto-detected logs and metrics
    When I choose to onboard a host using auto-detection
    Then I should be given installation instructions to run on my host
    And once I run them, Kibana should confirm that data is being received
