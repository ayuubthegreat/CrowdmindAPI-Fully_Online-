export const supa_AdminAccounts = ["yusufayuub00@gmail.com"]

export const checkIfPersonIsAdmin = (email) => {
    return supa_AdminAccounts.includes(email);
}