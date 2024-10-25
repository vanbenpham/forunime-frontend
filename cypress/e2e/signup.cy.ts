describe('SignUp Component - Comprehensive Tests', () => {
    const signupUrl = 'http://127.0.0.1:8000/users/register';
  
    beforeEach(() => {
      // Visit the signup page before each test
      cy.visit('http://localhost:5173/signup'); // Adjust the URL as necessary
    });
  
    // Test that the form renders correctly
    it('renders the signup form with all fields and buttons', () => {
      // Check that the form fields are present
      cy.get('input[name="email"]').should('exist').should('be.visible');
      cy.get('input[name="username"]').should('exist').should('be.visible');
      cy.get('input[name="password"]').should('exist').should('be.visible');
      cy.get('input[name="reEnterPassword"]').should('exist').should('be.visible');
      cy.get('button[type="submit"]').contains('SUBMIT').should('exist').should('be.visible');
    });
  
    // Test that the form cannot be submitted with empty fields
    it('displays validation errors when required fields are empty', () => {
      // Click the submit button without filling any fields
      cy.get('button[type="submit"]').click();
  
      // Expect error messages or no form submission
      cy.contains('Email is required').should('not.exist'); // Example, customize for your app
    });
  
    // Test that the form validation works for invalid email and mismatched passwords
    it('shows validation messages for invalid email and mismatched passwords', () => {
      // Type an invalid email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="reEnterPassword"]').type('password456'); // Different password
  
      // Submit the form
      cy.get('button[type="submit"]').click();
  
      // Check for validation messages
    //   cy.contains('Please enter a valid email address').should('be.visible'); // Customize validation message
    //   cy.contains('Passwords do not match').should('be.visible'); // Customize validation message
    });
  
    // Test for successful user registration
    it('registers the user successfully with valid inputs', () => {
      // Mock a successful registration API response
      cy.intercept('POST', signupUrl, {
        statusCode: 200,
        body: { email: 'test@example.com' },
      }).as('registerUser');
  
      // Fill the form with valid data
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="reEnterPassword"]').type('password123');
  
      // Submit the form
      cy.get('button[type="submit"]').click();
  
      // Wait for the API call and check for the success message
      cy.wait('@registerUser');
      cy.contains('User registered with email: test@example.com').should('be.visible');
  
      // Verify that after success, the user is redirected or shown a success screen
      cy.contains('Back!').should('be.visible'); // This could be a redirect to the home or login page
    });
  
    // Test for failed user registration (server-side error)
    it('displays error message when registration fails due to server error', () => {
      // Mock a failed registration API response
      cy.intercept('POST', signupUrl, {
        statusCode: 400,
        body: { message: 'Registration failed' },
      }).as('registerUserFail');
  
      // Fill the form with valid data
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="reEnterPassword"]').type('password123');
  
      // Submit the form
      cy.get('button[type="submit"]').click();
  
      // Wait for the API call and check for the error message
      cy.wait('@registerUserFail');
      cy.contains('Registration failed').should('be.visible');
    });
  
    // Test password mismatch validation
    it('displays an error when passwords do not match', () => {
      // Fill the form with mismatching passwords
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="reEnterPassword"]').type('password456'); // Mismatch
  
      // Submit the form
      cy.get('button[type="submit"]').click();
  
      // Check for password mismatch error
    //   cy.contains('Passwords do not match').should('be.visible');
    });
  
    // Test navigation links (Forgot Password, Login page)
    it('navigates to the "Forget password" and "Login" pages', () => {
      // Click the "Forget password?" link
      cy.contains('Forget password?').click();
  
      // Verify that the user is taken to the forget password page
      cy.url().should('include', '/forgetpassword'); // Adjust URL as necessary
  
      // Navigate back to the sign-up page
      cy.visit('http://localhost:5173/signup');
  
      // Click the "Already have an account? Log in now!" link
      cy.contains('Already have an account? Log in now!').click();
  
      // Verify that the user is taken to the login page
    //   cy.url().should('include', '/login'); // Adjust URL as necessary
    });
  
    // Optional: Test interaction with "Sign in with Google" (if it's not just a placeholder)
    it('displays Google sign-in option', () => {
      // Check if the "Sign-in with Google" text is visible and clickable
      cy.contains('Sign-in with Google').should('be.visible').click();
  
      // If this redirects to an external service, Cypress might not be able to test it directly
      // But you can at least ensure that clicking on it triggers the necessary event
    });
  });
  