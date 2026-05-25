Feature: Checkout Process
  As a User
  I want to be able to checkout my cart items
  So that I can purchase products from multiple shops at once

  Scenario: User successfully checks out items from multiple shops
    Given I am authenticated as a "USER" with user ID "222e4567-e89b-12d3-a456-426614174000"
    And I have 2 items from Shop A and 1 item from Shop B in my cart
    When I submit a checkout request with a platform voucher and shipping address
    Then a parent order should be created successfully
    And 2 child orders should be created for each shop
    And the items should be removed from the cart
    And the stock of the SKUs should be reduced
    And an OrderPlacedEvent should be published
