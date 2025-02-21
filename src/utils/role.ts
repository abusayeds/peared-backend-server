export const role = {
    admin: "admin",
    user: "user",
    provider: "provider",
} as const;

export type TRole = keyof typeof role