export const generateRandomId = () => {
    return [...Array(5)].map(() => (~~(Math.random() * 36)).toString(36)).join('');
};