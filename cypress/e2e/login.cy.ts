const wait_time = 2000
const url_login = Cypress.env('CYPRESS_URL');
const username_admin = Cypress.env('CYPRESS_USERNAME_ADMIN');
const password_admin = Cypress.env('CYPRESS_PASSWORD_ADMIN');
const username_user = Cypress.env('CYPRESS_USERNAME_USER');
const password_user = Cypress.env('CYPRESS_PASSWORD_USER');

describe('Login', () => { 
    it('Login and Log Out User', () => {
        // login
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type(username_user);
        cy.get('input[name="password"]').clear().type(password_user);
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.contains('div', 'PROFILE').should('exist');
        cy.get('[data-testid="MenuIcon"]').click({force:true});
        cy.contains('li','Settings').click({force: true});
        cy.contains('button', 'Log Out').click({force:true});
        cy.visit(url_login)
    });

    it('Login and Log Out Admin', () => {
        // login
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type(username_admin);
        cy.get('input[name="password"]').clear().type(password_admin);
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.contains('div', 'PROFILE').should('exist');
        cy.get('[data-testid="MenuIcon"]').click({force:true});
        cy.contains('li','Settings').click({force: true});
        cy.contains('button', 'Log Out').click({force:true});
        cy.visit(url_login)
    });
})
