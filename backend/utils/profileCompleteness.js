const ProfileCompleteness = (profile) => {
  if (!profile) return 0;

  let score = 0;

  if (profile.profileImage) score += 15;
  if (profile.bio) score += 25;
  if (profile.phone) score += 30;
  if (profile.location) score += 30;

  return score; // out of 100
};

export default ProfileCompleteness;