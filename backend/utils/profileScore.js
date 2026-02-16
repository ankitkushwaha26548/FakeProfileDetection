export const calculateProfileScore = (profile) => {
    let score = 0;

    if (profile.bio) score += 20;
    if (profile.profileImage) score += 25;
    if (profile.phone) score += 20;
    if (profile.location) score += 15;

    return score; //max = 80 (can normalize to 100 later)
};

