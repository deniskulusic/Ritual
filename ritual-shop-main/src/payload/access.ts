import type { Access } from "payload";

export const isAdmin: Access = ({ req }) => req.user?.collection === "users";

export const isAdminOrCustomerSelf: Access = ({ req }) => {
  if (req.user?.collection === "users") {
    return true;
  }

  if (req.user?.collection === "customers" && req.user.id) {
    return {
      id: {
        equals: req.user.id,
      },
    };
  }

  return false;
};

export const isAdminOrOrderOwner: Access = ({ req }) => {
  if (req.user?.collection === "users") {
    return true;
  }

  if (req.user?.collection === "customers" && req.user.id) {
    return {
      customer: {
        equals: req.user.id,
      },
    };
  }

  return false;
};

export const publicRead = () => true;
