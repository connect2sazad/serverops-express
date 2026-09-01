import { z } from 'zod';

export const HostKeyTrustSchema = z.object({
    fingerprint: z.string()
        .trim()
        .regex(
            /^SHA256:[A-Za-z0-9+/]{43}=?$/,
            'A valid SHA256 SSH host-key fingerprint is required!'
        )
        .transform(value => value.replace(/=+$/, '') + '='),
});