import { wait_time, url_login, username_admin, password_admin, username_user, password_user } from "../support/constants";

describe('Login', () => { 
    it('Create and Delete Thread', () => {
        // login
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type(username_user);
        cy.get('input[name="password"]').clear().type(password_user);
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.get('[data-testid="MenuIcon"]').click({force:true});
        cy.contains('li','Discussion').click({force: true});
        cy.contains('h5','ANIME').click({force: true});
        cy.get('[data-testid="AddIcon"]').click({force:true});
        // cy.get('textarea').type("this is new post");
        cy.contains('button', 'Create').click({force: true});
        cy.contains('p', 'this is new post').click({force: true});
        cy.get('[data-testid="DeleteIcon"]').click({force:true});
        cy.contains('h5','ANIME').should('exist');
    });

})
