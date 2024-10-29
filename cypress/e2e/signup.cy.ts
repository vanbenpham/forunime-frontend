import { wait_time, url_login, username_admin, password_admin, username_user, password_user } from "../support/constants";

describe('Signup', () => { 
    it('Signup and Logout', () => {
        // login
        cy.visit(url_login)
        cy.contains('a', 'First time?').click({force: true});
        cy.wait(wait_time);
        cy.get('input[name="email"]').clear().type("example@example.com");
        cy.get('input[name="username"]').clear().type("Example");
        cy.get('input[name="password"]').clear().type("123456");
        cy.get('input[name="reEnterPassword"]').clear().type("123456");
        cy.contains('button', 'SUBMIT').click({force:true});
        cy.wait(wait_time);
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type("example@example.com");
        cy.get('input[name="password"]').clear().type("123456");
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.contains('div', 'PROFILE').should('exist');
        cy.get('[data-testid="MenuIcon"]').click({force:true});
        cy.contains('li','Settings').click({force: true});
        cy.contains('button', 'Log Out').click({force:true});
    });

    it('Login and Log Out Admin', () => {
        // login
        cy.visit(url_login)
        cy.get('input[name="email"]').clear().type("example@example.com");
        cy.get('input[name="password"]').clear().type("123456");
        cy.contains('button', 'SUBMIT').click({force: true});
        cy.wait(wait_time);
        cy.contains('div', 'PROFILE').should('exist');
        cy.get('[data-testid="MenuIcon"]').click({force:true});
        cy.contains('li','Settings').click({force: true});
        // cy.contains('button', 'Update User Information').click({force:true});
        // cy.get('input[placeholder="Example"]').clear().type("EXAMPLE");
        // cy.contains('label','Current password').clear().type("123456");
        // cy.contains('button', 'SUBMIT').click({force: true});
        // cy.wait(wait_time);
        // cy.get('[data-testid="MenuIcon"]').click({force:true});
        // cy.contains('li','Profile').click({force: true});
        // cy.contains('div','EXAMPLE').should('exist');
        // cy.get('[data-testid="MenuIcon"]').click({force:true});
        // cy.contains('li','Settings').click({force: true});
        cy.contains('button', 'Delete Account').click({force:true});
        cy.wait(wait_time);
        cy.visit(url_login)
    });
})
