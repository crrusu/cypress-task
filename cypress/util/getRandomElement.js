export const getRandomElementFromList = (list) => {
    const items = list.toArray();
    return Cypress._.sample(items);
};
