export const getAuthError = (error) => {
  console.error("getAuthError received error:", error) // Add this line for debugging

  if (error?.message) {
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes("already registered") || errorMessage.includes("email in use")) {
      return {
        type: "EmailInUse",
        message: "This email is already registered. Try signing in instead.",
      }
    }

    if (errorMessage.includes("invalid login credentials")) {
      return {
        type: "InvalidCredentials",
        message: "Invalid email or password. Please try again.",
      }
    }

    if (errorMessage.includes("email not confirmed")) {
      return {
        type: "EmailNotConfirmed",
        message: "Please verify your email before signing in.",
      }
    }

    if (errorMessage.includes("invalid email")) {
      return {
        type: "InvalidEmail",
        message: "Please enter a valid email address.",
      }
    }

    if (errorMessage.includes("password")) {
      return {
        type: "WeakPassword",
        message: "Password should be at least 6 characters long.",
      }
    }

    // Add more specific error handling as needed
  }

  return {
    type: "Default",
    message: "An error occurred. Please try again.",
  }
}