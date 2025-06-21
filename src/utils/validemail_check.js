

const isValidEmail = (email) => {
  // Return false if the email is null, undefined, or not a string
  if (!email || typeof email !== 'string') {
    return false;
  }
  // A common and practical regex for email validation
  const emailRegex = new RegExp(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  );
  return emailRegex.test(email);
};

module.exports = isValidEmail;