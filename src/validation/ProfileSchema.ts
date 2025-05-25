import * as yup from 'yup';

export const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  nickname: yup.string().required('Nickname is required'),
  email: yup
    .string()
    .email('Email must be a valid email')
    .lowercase()
    .required('Email is required'),
  avatar: yup.string().nullable(),
});
