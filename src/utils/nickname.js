export const getDisplayName = (nickname) => {
    if (!nickname) return '송이';
    return nickname.charAt(0) + '송이';
};
