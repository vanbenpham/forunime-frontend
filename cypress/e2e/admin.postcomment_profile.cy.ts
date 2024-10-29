import { wait_time, url_login, username_admin, password_admin, username_user, password_user } from "../support/constants";

describe('Login', () => { 
    it('Post, Edit and Delete Comment On User', () => {
        // login
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type(username_admin);
        cy.get('input[name="password"]').clear().type(password_admin);
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.visit('https://serene-genie-f6bf5d.netlify.app/profile/3');
        cy.contains('div', 'PROFILE').should('exist');
        cy.get('input[placeholder="Add a post..."]').clear().type("This is from admin");
        cy.contains('button', 'SEND').click({force: true});
        cy.wait(wait_time);
        cy.contains('p', 'This is from admin').should('exist');
        cy.get('[data-testid="EditIcon"]').click({force: true});
        cy.get('input[value="This is from admin"]').clear().type("This is from admin edited");
        cy.get('[data-testid="SaveIcon"]').click({force: true});
        cy.contains('p', 'This is from admin edited').should('exist');
        cy.get('[data-testid="DeleteIcon"]').click({force: true});
        cy.contains('p', 'This is from admin edited').should('not.exist');
    });

})
