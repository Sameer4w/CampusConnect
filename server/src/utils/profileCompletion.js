const WEIGHTS = {
  basicInfo: 15,
  education: 20,
  skills: 15,
  projects: 15,
  certifications: 10,
  achievements: 5,
  social: 10,
  resume: 10,
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isNonEmptyArray = (value) =>
  Array.isArray(value) && value.length > 0;

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const getCompletionRatio = (conditions) => {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return 0;
  }

  const completedFields = conditions.filter(Boolean).length;

  return completedFields / conditions.length;
};

const getBestItemScore = (items, scoreCalculator) => {
  if (!isNonEmptyArray(items)) {
    return 0;
  }

  return Math.max(
    ...items.map((item) => clamp(scoreCalculator(item)))
  );
};

// =====================================================
// BASIC INFORMATION
// =====================================================

const calcBasicInfo = (profile) => {
  const hasPhone = isNonEmptyString(profile?.phone);

  return hasPhone ? WEIGHTS.basicInfo : 0;
};

// =====================================================
// EDUCATION
// =====================================================

const getEducationScore = (education) => {
  if (!education) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(education.institution),
    isNonEmptyString(education.degree),
    isNonEmptyString(education.fieldOfStudy),
    Boolean(education.startYear),
    Boolean(education.endYear),
    isNonEmptyString(education.grade),
  ]);
};

const calcEducation = (profile) => {
  const education = profile?.education;

  if (!isNonEmptyArray(education)) {
    return 0;
  }

  const bestEducationScore = getBestItemScore(
    education,
    getEducationScore
  );

  return Math.round(bestEducationScore * WEIGHTS.education);
};

// =====================================================
// SKILLS
// =====================================================

const calcSkills = (profile) => {
  const skills = profile?.skills;

  if (!isNonEmptyArray(skills)) {
    return 0;
  }

  // Five skills are considered sufficient for full
  // profile-completion credit. More skills can still be
  // used later by the recommendation system.
  const targetSkills = 5;

  const ratio = clamp(skills.length / targetSkills);

  return Math.round(ratio * WEIGHTS.skills);
};

// =====================================================
// PROJECTS
// =====================================================

const getProjectScore = (project) => {
  if (!project) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(project.title),
    isNonEmptyString(project.description),
    isNonEmptyArray(project.technologies),
    isNonEmptyString(project.githubUrl) ||
      isNonEmptyString(project.liveUrl),
  ]);
};

const calcProjects = (profile) => {
  const projects = profile?.projects;

  if (!isNonEmptyArray(projects)) {
    return 0;
  }

  const bestProjectScore = getBestItemScore(
    projects,
    getProjectScore
  );

  // Up to three projects improve the completeness score.
  const projectCountScore = clamp(projects.length / 3);

  const combinedScore =
    bestProjectScore * 0.7 + projectCountScore * 0.3;

  return Math.round(combinedScore * WEIGHTS.projects);
};

// =====================================================
// CERTIFICATIONS
// =====================================================

const getCertificationScore = (certification) => {
  if (!certification) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(certification.name),
    isNonEmptyString(certification.issuingOrganization),
    Boolean(certification.issueDate),
    isNonEmptyString(certification.credentialUrl),
  ]);
};

const calcCertifications = (profile) => {
  const certifications = profile?.certifications;

  if (!isNonEmptyArray(certifications)) {
    return 0;
  }

  const bestCertificationScore = getBestItemScore(
    certifications,
    getCertificationScore
  );

  const certificationCountScore = clamp(
    certifications.length / 2
  );

  const combinedScore =
    bestCertificationScore * 0.7 +
    certificationCountScore * 0.3;

  return Math.round(
    combinedScore * WEIGHTS.certifications
  );
};

// =====================================================
// ACHIEVEMENTS
// =====================================================

const getAchievementScore = (achievement) => {
  if (!achievement) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(achievement.title),
    isNonEmptyString(achievement.description),
    Boolean(achievement.date),
  ]);
};

const calcAchievements = (profile) => {
  const achievements = profile?.achievements;

  if (!isNonEmptyArray(achievements)) {
    return 0;
  }

  const bestAchievementScore = getBestItemScore(
    achievements,
    getAchievementScore
  );

  const achievementCountScore = clamp(
    achievements.length / 2
  );

  const combinedScore =
    bestAchievementScore * 0.7 +
    achievementCountScore * 0.3;

  return Math.round(
    combinedScore * WEIGHTS.achievements
  );
};

// =====================================================
// SOCIAL LINKS
// =====================================================

const calcSocial = (profile) => {
  const social = profile?.social || {};

  const filledLinks = [
    isNonEmptyString(social.github),
    isNonEmptyString(social.linkedin),
    isNonEmptyString(social.portfolio),
  ].filter(Boolean).length;

  const ratio = filledLinks / 3;

  return Math.round(ratio * WEIGHTS.social);
};

// =====================================================
// RESUME
// =====================================================

const calcResume = (profile) => {
  const resume = profile?.resume || {};

  const hasResumeUrl = isNonEmptyString(
    resume.resumeUrl
  );

  const hasResumeName = isNonEmptyString(
    resume.resumeName
  );

  const ratio = getCompletionRatio([
    hasResumeUrl,
    hasResumeName,
  ]);

  return Math.round(ratio * WEIGHTS.resume);
};

// =====================================================
// PROFILE SUGGESTIONS
// =====================================================

const buildSuggestions = (profile) => {
  const suggestions = [];

  const social = profile?.social || {};
  const resume = profile?.resume || {};

  // Basic information
  if (!isNonEmptyString(profile?.phone)) {
    suggestions.push("Add your phone number");
  }

  // Education
  if (!isNonEmptyArray(profile?.education)) {
    suggestions.push("Add your education details");
  }

  // Skills
  if (!isNonEmptyArray(profile?.skills)) {
    suggestions.push("Add your technical skills");
  } else if (profile.skills.length < 5) {
    suggestions.push(
      "Add at least 5 skills for better opportunity matching"
    );
  }

  // Projects
  if (!isNonEmptyArray(profile?.projects)) {
    suggestions.push("Add at least one project");
  } else {
    const hasProjectLink = profile.projects.some(
      (project) =>
        isNonEmptyString(project?.githubUrl) ||
        isNonEmptyString(project?.liveUrl)
    );

    if (!hasProjectLink) {
      suggestions.push(
        "Add a GitHub or live link to one of your projects"
      );
    }
  }

  // Certifications
  if (!isNonEmptyArray(profile?.certifications)) {
    suggestions.push("Add your certifications");
  }

  // Achievements
  if (!isNonEmptyArray(profile?.achievements)) {
    suggestions.push("Add your achievements or accomplishments");
  }

  // Social links
  if (!isNonEmptyString(social.github)) {
    suggestions.push("Add your GitHub profile");
  }

  if (!isNonEmptyString(social.linkedin)) {
    suggestions.push("Add your LinkedIn profile");
  }

  if (!isNonEmptyString(social.portfolio)) {
    suggestions.push("Add your portfolio link");
  }

  // Resume
  if (
    !isNonEmptyString(resume.resumeUrl) &&
    !isNonEmptyString(resume.resumeName)
  ) {
    suggestions.push("Add your resume");
  }

  return suggestions.slice(0, 6);
};

// =====================================================
// MAIN PROFILE COMPLETION FUNCTION
// =====================================================

const calculateProfileCompletion = (profile) => {
  const safeProfile = profile || {};

  const scoreBreakdown = {
    basicInfo: calcBasicInfo(safeProfile),
    education: calcEducation(safeProfile),
    skills: calcSkills(safeProfile),
    projects: calcProjects(safeProfile),
    certifications: calcCertifications(safeProfile),
    achievements: calcAchievements(safeProfile),
    social: calcSocial(safeProfile),
    resume: calcResume(safeProfile),
  };

  const totalScore = Object.values(
    scoreBreakdown
  ).reduce((total, value) => total + value, 0);

  const completionPercentage = Math.min(
    100,
    Math.max(0, totalScore)
  );

  const suggestions = buildSuggestions(safeProfile);

  return {
    completionPercentage,
    suggestions,
    scoreBreakdown,
  };
};

module.exports = {
  calculateProfileCompletion,
  WEIGHTS,
};