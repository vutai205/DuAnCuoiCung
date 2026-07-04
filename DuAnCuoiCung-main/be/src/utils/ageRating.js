const MIN_AGE_BY_RATING = {
    P: 0,
    K: 0,
    T13: 13,
    T16: 16,
    T18: 18,
    C: Infinity
};
const getMinAge = (rating) => {
    const minAge = MIN_AGE_BY_RATING[rating];
    return minAge === undefined ? 0 : minAge;
};
const isAllowedForAge = (rating, viewerAge) => viewerAge >= getMinAge(rating);
module.exports = { MIN_AGE_BY_RATING, getMinAge, isAllowedForAge };
