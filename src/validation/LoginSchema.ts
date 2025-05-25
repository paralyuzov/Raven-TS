import * as yup from 'yup';

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .email('Email must be a valid email')
    .lowercase()
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});