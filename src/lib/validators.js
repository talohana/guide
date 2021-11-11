import {
  combineValidators,
  composeValidators,
  createValidator,
  hasLengthLessThan,
  isRequired,
} from "revalidate";

const isString = createValidator(
  (message) => (value) => {
    if (!(typeof value === "string")) {
      return message;
    }
  },
  (field) => `${field} must be a String`
);

export const validateReview = combineValidators({
  text: composeValidators(
    isRequired,
    isString,
    hasLengthLessThan(500)
  )("Review text"),
  stars: createValidator(
    (message) => (value) => {
      if (![null, 1, 2, 3, 4, 5].includes(value)) {
        return message;
      }
    },
    (field) => `${field} must be a number 1-5`
  )("Stars"),
});
