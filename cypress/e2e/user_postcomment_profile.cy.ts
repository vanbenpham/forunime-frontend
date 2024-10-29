import { wait_time, url_login, username_admin, password_admin, username_user, password_user } from "../support/constants";

describe('Login', () => { 
    it('Post, Edit and Delete Comment', () => {
        // login
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type(username_user);
        cy.get('input[name="password"]').clear().type(password_user);
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.contains('div', 'PROFILE').should('exist');
        cy.get('input[placeholder="Add a post..."]').clear().type("This is the test post");
        cy.contains('button', 'SEND').click({force: true});
        cy.wait(wait_time);
        cy.contains('p', 'This is the test post').should('exist');
        cy.get('[data-testid="EditIcon"]').click({force: true});
        cy.get('input[value="This is the test post"]').clear().type("This is the editted post");
        cy.get('[data-testid="SaveIcon"]').click({force: true});
        cy.contains('p', 'This is the editted post').should('exist');
        cy.get('[data-testid="DeleteIcon"]').click({force: true});
        cy.contains('p', 'This is the editted post').should('not.exist');
        // cy.get('input[placeholder="Add a post..."]').clear().type("This is for admin");
        // cy.contains('button', 'SEND').click({force: true});
        // cy.contains('p', 'This is for admin').should('exist');
    });

})
