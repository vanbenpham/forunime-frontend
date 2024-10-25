describe('Login API Test', () => {
    beforeEach(() => {
        // Visit the signup page before each test
        cy.visit('http://localhost:5173/'); // Adjust the URL as necessary
      });
    
    it('should successfully log in the user and redirect to profile page', () => {

        // Mock the API response for a successful login
        cy.intercept('POST', 'http://127.0.0.1:8000/login', {
            statusCode: 200,
            body: {
                access_token: 'fake-jwt-token',
            },
        }).as('loginRequest');

        // Fill in the email and password
        cy.get('input[name="email"]').type('testuser@example.com');
        cy.get('input[name="password"]').type('password123');

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Wait for the API request to be made and check the response
        cy.wait('@loginRequest').then((interception) => {
            // Assert that the request body contains the correct data
            expect(interception.request.body.get('username')).to.equal('testuser@example.com');
            expect(interception.request.body.get('password')).to.equal('password123');
        });

        // Check if the token is stored in localStorage
        cy.window().then((window) => {
            const token = window.localStorage.getItem('token');
            expect(token).to.equal('fake-jwt-token');
        });

        // Verify redirection to the profile page after successful login
        cy.url().should('include', '/profile/fake-user-id');  // Change fake-user-id with the actual id expected
    });
});
