import { queryOne, execute } from '../config/db.js';

const OTP_TTL_SECONDS = 600; // 10 minutes, matching the old TTL index

/** Create or refresh the OTP for an email address (single live OTP per email). */
export const upsertOtp = async (email: string, otp: string): Promise<void> => {
    await execute(
        `INSERT INTO otp_requests (email, otp_code, created_at, expires_at)
         VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND))
         ON DUPLICATE KEY UPDATE
             otp_code   = VALUES(otp_code),
             created_at = NOW(),
             expires_at = VALUES(expires_at)`,
        [email, otp, OTP_TTL_SECONDS]
    );
};

/**
 * Check an OTP.  A correct, unexpired code is consumed (deleted) so it cannot
 * be replayed.  Returns true on success.
 */
export const verifyAndConsumeOtp = async (email: string, otp: string): Promise<boolean> => {
    const row = await queryOne<{ email: string }>(
        `SELECT email FROM otp_requests
          WHERE email = ? AND otp_code = ? AND expires_at > NOW()`,
        [email, otp]
    );
    if (!row) return false;
    await execute('DELETE FROM otp_requests WHERE email = ?', [email]);
    return true;
};
