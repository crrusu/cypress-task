import {getRandomElementFromList} from "../../util/getRandomElement";
import {generateRandomId} from "../../util/generateRandomId";

describe('About You E2E Business Critical Path', () => {

    it('Should place a order', () => {
        // Set cookie to force the website render the mobile view
        cy.setCookie('mobileSite', '1');
        cy.visit('/');
        // Accept recommended cookies
        cy.get('body').then(body => {
            if (body.find('#onetrust-consent-sdk').length > 0) {
                cy.get('#onetrust-consent-sdk #onetrust-accept-btn-handler').click();
            }
        });

        // Select a country and language to close the pop-up
        cy.get('body').then(body => {
            if (body.find('[data-testid="countrySwitchPopup"]').length > 0) {
                cy.get('[data-testid="countrySwitchPopup"]').parent('#modalContent').find('[data-testid="modalDialogCloseIcon"]').click();
            }
            cy.get('body').then(body => {
                if (body.find('[data-testid="languageSwitchPopup"]').length > 0) {
                    cy.get('[data-testid="languageSwitchPopup"]').parent('#modalContent').find('[data-testid="modalDialogCloseIcon"]').click();
                }
            });
        })

        // Select a random category (Women, Men, Children)
        cy.get('[data-testid="topCategorySwitch"] div a').then(list => {
            return getRandomElementFromList(list);
        }).click();

        // Select a random sub-category (Clothing, Shoes, Sports, ... )
        cy.get('[data-testid="categoryContainer"] a[data-testid]').then(list => {
            return getRandomElementFromList(list);
        }).click();

        // Select a random style or sub-category from the side menu
        cy.get('[data-testid*="categoryTreeNavigationItem"]').then(list => {
            return getRandomElementFromList(list);
        }).click();

        // Select a random product
        cy.get('a[data-testid*="productTile-"]').then(list => {
            return getRandomElementFromList(list);
        }).as('selectedProduct');
        cy.get('@selectedProduct').invoke('attr', 'href').as('selectedProductHref');
        cy.get('@selectedProduct').click();

        // Add it to basket
        cy.get('[data-testid="addToBasketButton"]', {timeout: 10 * 1000}).click();

        // If there is sizing available, the sizing options list should open
        cy.get('body').then(body => {
            if (body.find('[data-testid*="sizeFlyout"]').length > 0) {
                const sizeOptionsList = cy.get('[data-testid*="sizeFlyout"]').then(sizeOptionList => {

                    // It seems that there are more than one templates for lists
                    return sizeOptionList.find('[data-testid="size"]').length > 0 ?
                        cy.get('[data-testid="sizeOptionList"] [data-testid$="_active"]') :
                        cy.get('[data-testid="sizeList"] [data-testid$="_active"]');
                });

                // Select a random size from the list
                sizeOptionsList.then(list => {
                    return getRandomElementFromList(list);
                }).click();
            }
            // If the app prompts the user to select a size before adding an item to the cart, the size options are available in the page (eg. perfumes)
            // select a size from the list
            if (body.find('[data-testid*="sizeOption_"]').length > 0) {
                cy.get('[data-testid*="sizeOption_"]').then(list => {
                    return getRandomElementFromList(list).click();
                })
            }
        });

        // Verify successful message
        cy.contains('Erfolgreich zum Warenkorb hinzugefügt!', {timeout: 10 * 1000}).should('exist');
        // Go to the basket
        cy.get('[data-testid="goToBasketButton"]').click();
        cy.get('[data-testid="basketTotalProducts"]').should('contain.text', 'Dein Warenkorb (1)');

        // TODO Make verify basket products reusable
        // Verify the product is added to the basket and proceed to checkout
        cy.get('body').then(body => {
            if (body.find('[data-testid="CheckoutButton"]').length > 0 &&
                body.find('[data-testid*="basketProduct-"]')) {
                cy.get('[data-testid*="basketProduct"] a').invoke('attr', 'href').then(href => {
                    cy.get('@selectedProductHref').should('contain', href);
                });
                cy.get('button[data-testid="CheckoutButton"]').first().click();
            }
        });

        // Verify Login/Registration page is displayed
        cy.get('[data-testid="Headline"]', {timeout: 10 * 1000}).should('have.text', 'Anmelden');

        //Register
        cy.get('[data-testid="RegisterAndLoginButtons"]').contains('Neukunde').click();

        cy.fixture('userDetails.json').then(userDetails => {
            cy.get('[data-testid="FirstnameField"]').type(userDetails.firstName);
            cy.get('[data-testid="LastNameField"]').type(userDetails.lastName);
            cy.get('[data-testid="EmailField"]').type(userDetails.firstName.concat(generateRandomId().concat(userDetails.emailAddress)));
            cy.get('[data-testid="PasswordField"]').type(userDetails.password);
            cy.get('[data-testid="RegisterSubmitButton"]').click();

        // Verify Your data page is displayed
        cy.contains('Deine Daten').should('exist');

        // Go back
        cy.get('.page-header a').click();
        cy.get('[data-testid="HeaderMenu"]').click();

        // Verify user is logged in
        cy.get('[data-testid="myAccount"]').should('exist');

        // Log out
        cy.get('[data-testid="offCanvasLogout"]').click();

        // Log in
        cy.get('[data-testid="HeaderMenu"]').click();
        cy.get('[data-testid="offCanvasLogin"]').click();
        cy.get('[data-testid="SignInWithYourEmailText"] div').should('contain', userDetails.firstName);
        cy.get('[data-testid="PasswordField"]').type(userDetails.password);
        cy.get('[data-testid="SubmitLogin"]').click();

        // Go to the basket
        cy.get('[data-testid="offCanvasCloseIcon"]').click();
        cy.get('[data-testid="HeaderBasket"]').click();

        // Verify the product is in the basket and proceed to checkout
        cy.get('body').then(body => {
            if (body.find('[data-testid="CheckoutButton"]').length > 0 &&
                body.find('[data-testid*="basketProduct-"]')) {
                cy.get('[data-testid*="basketProduct"] a').invoke('attr', 'href').then(href => {
                    cy.get('@selectedProductHref').should('contain', href);
                });
                cy.get('button[data-testid="CheckoutButton"]').first().click();
            }
        });

        // Verify Your data page is displayed
        cy.contains('Deine Daten').should('exist');

        // Complete billing address form
        cy.get('input[name="streetHouseNumber"]').type(userDetails.streetAndNumber);
        cy.get('input[name="zipCode"]').type(userDetails.zipCode);
        cy.get('input[name="city"]').type(userDetails.city);
        cy.get('input[id="billingAddressBirthDate"]').type(userDetails.birthDate);
        cy.get('button[type="submit"]').click();
        });

        // Verify Your order page is displayed
        cy.contains('Deine Bestellung').should('exist');

        // Verify Your order overview section
        cy.contains('Deine Bestellübersicht').should('exist');

        // Verify address section is present and checked
        cy.get('.address-list__item').should('exist');
        cy.get('.address-list__item input').should('be.checked');

        // Verify payment options list is displayed
        cy.get('.payment-list').should('exist');

        // Choose a payment option
        cy.get('#payment-method-computop_creditcard_visa').check();

        // Verify payment option is checked
        cy.get('#payment-method-computop_creditcard_visa').should('be.checked');
        cy.get('button[type="submit"]').contains('text', 'Jetzt kaufen').click();

        // Verify payment page is prompted
        cy.contains('Kartenzahlung').should('exist');

        // Stopped at payment page as this is a production site
    });
});

