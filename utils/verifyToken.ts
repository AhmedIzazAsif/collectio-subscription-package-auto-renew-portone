import { createVerifier } from 'fast-jwt';

// Create a verifier
const verifyToken = createVerifier({
    key: async () => process.env.JWT_SECRET,
});
export const isTokenExpired = async (token: string): Promise<boolean> => {
    let tokenExpired = false;
    try {
        await verifyToken(token);
    } catch (e) {
        tokenExpired = true;
    }
    return tokenExpired;
};
