// Validation middleware factory
// Takes a validation function and returns middleware
// The validation function should return { isValid, errors }
const validate = (validationFn) => {
  return (req, res, next) => {
    const { isValid, errors } = validationFn(req.body, req.params, req.query);

    if (!isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

// Common validators
export const validateRegister = validate((body) => {
  const errors = [];

  if (!body.name || body.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    errors.push('Please enter a valid email');
  }
  if (!body.password || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!body.role || !['tenant', 'landlord'].includes(body.role)) {
    errors.push('Role must be tenant or landlord');
  }

  return { isValid: errors.length === 0, errors };
});

export const validateLogin = validate((body) => {
  const errors = [];

  if (!body.email) errors.push('Email is required');
  if (!body.password) errors.push('Password is required');

  return { isValid: errors.length === 0, errors };
});

export const validateListing = validate((body) => {
  const errors = [];

  if (!body.title || body.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (!body.description || body.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }
  if (!body.type) {
    errors.push('Listing type is required');
  }
  if (!body.rent || body.rent < 500) {
    errors.push('Rent must be at least ₹500');
  }
  if (body.deposit === undefined || body.deposit < 0) {
    errors.push('Valid deposit amount is required');
  }
  if (!body.city) {
    errors.push('City is required');
  }
  if (!body.area) {
    errors.push('Area is required');
  }

  return { isValid: errors.length === 0, errors };
});

export const validateBooking = validate((body) => {
  const errors = [];

  if (!body.listingId) errors.push('Listing ID is required');
  if (!body.moveInDate) {
    errors.push('Move-in date is required');
  } else if (new Date(body.moveInDate) <= new Date()) {
    errors.push('Move-in date must be in the future');
  }
  if (!body.duration || body.duration < 1 || body.duration > 36) {
    errors.push('Duration must be between 1 and 36 months');
  }

  return { isValid: errors.length === 0, errors };
});

export const validateReview = validate((body) => {
  const errors = [];

  if (!body.bookingId) errors.push('Booking ID is required');
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  if (!body.comment || body.comment.trim().length < 10) {
    errors.push('Review must be at least 10 characters');
  }

  return { isValid: errors.length === 0, errors };
});

export default validate;
