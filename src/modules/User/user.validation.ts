import * as yup from "yup";

import { UserRole } from "./user.model";
import { isValidObjectId } from "mongoose";

const iranBounds = {
  latMin: 25.0,
  latMax: 39.5,
  lngMin: 44.0,
  lngMax: 63.5,
};

const getAllUsersParamsSchema = yup.object().shape({
  search: yup.string().optional().trim(),
  userId: yup
    .string()
    .optional()
    .trim()
    .test("isValidObjectId", "userId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
  phone: yup
    .string()
    .optional()
    .trim()
    .matches(/^09\d*$/, "Phone must start with 09")
    .max(11, "Phone number must be at most 11 digits long"),

  from: yup
    .string()
    .optional()
    .test("is-valid-date", "'from' Date format is invalid", (value) => {
      if (!value) return true;
      return !isNaN(new Date(value).getTime());
    }),
  to: yup
    .string()
    .optional()
    .test("is-valid-date", "'to' Date format is invalid", (value) => {
      if (!value) return true;
      return !isNaN(new Date(value).getTime());
    })
    .test(
      "end-date-after-start-date",
      "The ‘to’ date must be after the ‘from’ date.",
      function (value) {
        const { from } = this.parent;
        if (value && from) {
          return new Date(value) >= new Date(from);
        }
        return true;
      },
    ),

  role: yup
    .string()
    .optional()
    .oneOf(Object.values(UserRole), "Invalid role value"),

  includeBanned: yup.boolean().optional(),
  sort: yup
    .string()
    .optional()
    .oneOf(["asc", "desc"], "Sort value must be asc or desc"),
  limit: yup
    .number()
    .optional()
    .integer("Limit must be a positive integer")
    .positive("Limit must be a positive integer")
    .max(100, "Maximum allowed limit is 100"),
  page: yup
    .number()
    .optional()
    .integer("Page must be a positive integer")
    .positive("Page must be a positive integer"),
});

const updateUserSchema = yup
  .object()
  .shape({
    fullname: yup.string().optional().trim(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    (value) => {
      return !!value.fullname;
    },
  );

const adminUserDeleteSchema = yup.object().shape({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE USER [a-zA-Z0-9_-]+$/i,
      "Confirmation phrase must start with 'DELETE USER ' followed by the targer userId",
    ),
});

const adminAddUserAddressSchema = yup.object().shape({
  title: yup.string().required("title is required"),
  postalCode: yup
    .string()
    .required("Postal code is required")
    .length(10, "Postal code must be exactly 10 digits")
    .matches(
      /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
      "please enter a valid postal code",
    ), // IRAN Postal Code Length
  location: yup.object().shape({
    lat: yup
      .number()
      .required("Latitude (location.lat) is required")
      .min(
        iranBounds.latMin,
        `Latitude (location.lat) must be at least ${iranBounds.latMin}`,
      )
      .max(
        iranBounds.latMax,
        `Latitude (location.lat) must be at most ${iranBounds.latMax}`,
      ),
    lng: yup
      .number()
      .required("Longitude (location.lng) is required")
      .min(
        iranBounds.lngMin,
        `Longitude (location.lng) must be at least ${iranBounds.lngMin}`,
      )
      .max(
        iranBounds.lngMax,
        `Longitude (location.lng) must be at most ${iranBounds.lngMax}`,
      ),
  }),
  address: yup.string().required("Address is required"),
});

const adminUpdateUserAddressSchema = yup
  .object()
  .shape({
    title: yup.string().optional(),

    postalCode: yup
      .string()
      .optional()
      .length(10, "Postal code must be exactly 10 digits")
      .matches(
        /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
        "please enter a valid postal code",
      ),

    location: yup.object().shape({
      lat: yup
        .number()
        .optional()
        .min(
          iranBounds.latMin,
          `Latitude (location.lat) must be at least ${iranBounds.latMin}`,
        )
        .max(
          iranBounds.latMax,
          `Latitude (location.lat) must be at most ${iranBounds.latMax}`,
        ),

      lng: yup
        .number()
        .optional()
        .min(
          iranBounds.lngMin,
          `Longitude (location.lng) must be at least ${iranBounds.lngMin}`,
        )
        .max(
          iranBounds.lngMax,
          `Longitude (location.lng) must be at most ${iranBounds.lngMax}`,
        ),
    }),

    address: yup.string().optional(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided for update",
    (value) => {
      if (!value) return false;
      return Object.keys(value).length > 0;
    },
  )
  .test(
    "location-fields-dependency",
    "Location fields must be provided together",
    (value) => {
      if (!value) return true;
      const hasLat = value.location?.lat !== undefined;
      const hasLng = value.location?.lng !== undefined;
      return hasLat === hasLng;
    },
  )
  .test(
    "location-fields-requirement",
    "Both location fields (lat and lng) are required when updating location",
    (value) => {
      if (!value) return true;
      const hasLat = value.location?.lat !== undefined;
      const hasLng = value.location?.lng !== undefined;
      if (hasLat || hasLng) {
        return hasLat && hasLng;
      }
      return true;
    },
  )
  .test(
    "at-least-one-address-field",
    "At least one address field (title, postalCode, address, location) must be provided for update",
    (value) => {
      if (!value) return false;
      const { title, postalCode, address, location } = value;
      return (
        title !== undefined ||
        postalCode !== undefined ||
        address !== undefined ||
        (location?.lat !== undefined && location?.lng !== undefined)
      );
    },
  );

const adminDeleteUserAddressSchema = yup.object().shape({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE ADDRESS [a-zA-Z0-9_-]+$/i,
      "Confirmation phrase must start with 'DELETE ADDRESS ' followed by the target addressId",
    ),
});

//* ==================== *\\

const updateMeSchema = yup
  .object()
  .shape({
    fullname: yup.string().optional().trim(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    (value) => {
      return !!value.fullname;
    },
  );

const deleteMeSchema = yup.object().shape({
  confirmationPhrase: yup
    .string()
    .required("Confirmation phrase is required")
    .matches(
      /^DELETE MY ACCOUNT 09[0-9]{9}$/i,
      "Confirmation phrase must be exactly 'DELETE MY ACCOUNT {phone number}'",
    ),
});

const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required("Current password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(24, "Password must be less than 24 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(24, "Password must be less than 24 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  confirmNewPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf(
      [yup.ref("newPassword")],
      "New password and confirmation do not match",
    ),
});

const updateAddressSchema = yup.object().shape({
  // TODO
});

const addAddressSchema = yup.object().shape({
  // TODO
});

const deleteAddressSchema = yup.object().shape({
  // TODO
});

const addressIdParamsSchema = yup.object().shape({
  addressId: yup
    .string()
    .required("addressId is required")
    .test("isValidObjectId", "AddressId is invalid", (value) => {
      return value === undefined || isValidObjectId(value);
    }),
});

export {
  getAllUsersParamsSchema,
  updateUserSchema,
  adminUserDeleteSchema,
  adminAddUserAddressSchema,
  adminUpdateUserAddressSchema,
  adminDeleteUserAddressSchema,
  updateMeSchema,
  deleteMeSchema,
  changePasswordSchema,
  updateAddressSchema,
  addAddressSchema,
  deleteAddressSchema,
  addressIdParamsSchema,
};
