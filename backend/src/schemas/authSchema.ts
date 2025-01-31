import { z } from 'zod';
import libphonenumber from 'google-libphonenumber';

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

export const userRegistrationSchema = z.object({
    username: z
        .string()
        .trim()
        .min(4, 'Username is required to be min 4 characters')
        .max(10, "Username shall be max 10 characters'"),
    email: z.string().trim().email({ message: 'Email is invalid.' }),
    password: z.string().trim().min(4, 'Password must have min 4 characters'),
    phone: z
        .string()
        .trim()
        .nonempty({ message: 'Phone number is required' })
        .refine(
            (number) => {
                try {
                    const phoneNumber = phoneUtil.parse(number);
                    return phoneUtil.isValidNumber(phoneNumber);
                } catch (err) {
                    return err;
                }
            },
            { message: 'Invalid phone number' }
        )
});

export const userLoginSchema = z.object({
    email: z.string().trim().email({ message: 'Email is invalid.' }),
    password: z.string().trim().min(4, 'Password must have min 4 characters')
});
