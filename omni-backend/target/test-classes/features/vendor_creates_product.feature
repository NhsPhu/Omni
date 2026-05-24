Feature: Vendor Product Management
  As a Vendor
  I want to be able to create products with SKUs and images
  So that I can sell them on the Omni Marketplace

  Scenario: Vendor successfully creates a new product
    Given I am authenticated as a "VENDOR" with shop ID "123e4567-e89b-12d3-a456-426614174000"
    When I submit a product creation request with name "Gaming Mouse" and category "Electronics"
    And the request contains 2 SKUs and 1 primary image
    Then the product should be saved successfully
    And the product should be synced to Elasticsearch
