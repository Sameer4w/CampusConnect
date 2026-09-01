// =====================================================
// PROFILE COMPLETION WEIGHTS
// Total = 100
// =====================================================

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

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const isNonEmptyString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

const isNonEmptyArray = (value) =>
  Array.isArray(value) &&
  value.length > 0;

const clamp = (
  value,
  min = 0,
  max = 1
) =>
  Math.min(
    max,
    Math.max(min, value)
  );

const getCompletionRatio = (
  conditions
) => {
  if (
    !Array.isArray(conditions) ||
    conditions.length === 0
  ) {
    return 0;
  }

  const completedFields =
    conditions.filter(Boolean).length;

  return (
    completedFields /
    conditions.length
  );
};

const getBestItemScore = (
  items,
  scoreCalculator
) => {
  if (!isNonEmptyArray(items)) {
    return 0;
  }

  return Math.max(
    ...items.map((item) =>
      clamp(scoreCalculator(item))
    )
  );
};

// =====================================================
// BASIC INFORMATION
// =====================================================

const calcBasicInfo = (
  profile
) => {
  const completedFields =
    getCompletionRatio([
      isNonEmptyString(profile?.phone),
      isNonEmptyString(profile?.bio),
    ]);

  return Math.round(
    completedFields *
      WEIGHTS.basicInfo
  );
};

// =====================================================
// EDUCATION
// =====================================================

const getEducationScore = (
  education
) => {
  if (!education) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(
      education.institution
    ),

    isNonEmptyString(
      education.degree
    ),

    isNonEmptyString(
      education.fieldOfStudy
    ),

    Boolean(
      education.startYear
    ),

    Boolean(
      education.endYear
    ),

    isNonEmptyString(
      education.grade
    ),
  ]);
};

const calcEducation = (
  profile
) => {
  const education =
    profile?.education;

  if (
    !isNonEmptyArray(
      education
    )
  ) {
    return 0;
  }

  const bestScore =
    getBestItemScore(
      education,
      getEducationScore
    );

  return Math.round(
    bestScore *
      WEIGHTS.education
  );
};

// =====================================================
// SKILLS
// =====================================================

const calcSkills = (
  profile
) => {
  const skills =
    profile?.skills;

  if (
    !isNonEmptyArray(
      skills
    )
  ) {
    return 0;
  }

  // Five skills provide full completion
  const targetSkills = 5;

  const ratio =
    clamp(
      skills.length /
        targetSkills
    );

  return Math.round(
    ratio *
      WEIGHTS.skills
  );
};

// =====================================================
// PROJECTS
// =====================================================

const getProjectScore = (
  project
) => {
  if (!project) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(
      project.title
    ),

    isNonEmptyString(
      project.description
    ),

    isNonEmptyArray(
      project.technologies
    ),

    isNonEmptyString(
      project.githubUrl
    ) ||
      isNonEmptyString(
        project.liveUrl
      ),
  ]);
};

const calcProjects = (
  profile
) => {
  const projects =
    profile?.projects;

  if (
    !isNonEmptyArray(
      projects
    )
  ) {
    return 0;
  }

  const bestProjectScore =
    getBestItemScore(
      projects,
      getProjectScore
    );

  // Three projects give full quantity credit
  const countScore =
    clamp(
      projects.length / 3
    );

  const combinedScore =
    bestProjectScore *
      0.7 +
    countScore *
      0.3;

  return Math.round(
    combinedScore *
      WEIGHTS.projects
  );
};

// =====================================================
// CERTIFICATIONS
// =====================================================

const getCertificationScore = (
  certification
) => {
  if (!certification) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(
      certification.name
    ),

    isNonEmptyString(
      certification.issuingOrganization
    ),

    Boolean(
      certification.issueDate
    ),

    isNonEmptyString(
      certification.credentialUrl
    ),
  ]);
};

const calcCertifications = (
  profile
) => {
  const certifications =
    profile?.certifications;

  if (
    !isNonEmptyArray(
      certifications
    )
  ) {
    return 0;
  }

  const bestScore =
    getBestItemScore(
      certifications,
      getCertificationScore
    );

  const countScore =
    clamp(
      certifications.length / 2
    );

  const combinedScore =
    bestScore *
      0.7 +
    countScore *
      0.3;

  return Math.round(
    combinedScore *
      WEIGHTS.certifications
  );
};

// =====================================================
// ACHIEVEMENTS
// =====================================================

const getAchievementScore = (
  achievement
) => {
  if (!achievement) {
    return 0;
  }

  return getCompletionRatio([
    isNonEmptyString(
      achievement.title
    ),

    isNonEmptyString(
      achievement.description
    ),

    Boolean(
      achievement.date
    ),
  ]);
};

const calcAchievements = (
  profile
) => {
  const achievements =
    profile?.achievements;

  if (
    !isNonEmptyArray(
      achievements
    )
  ) {
    return 0;
  }

  const bestScore =
    getBestItemScore(
      achievements,
      getAchievementScore
    );

  const countScore =
    clamp(
      achievements.length / 2
    );

  const combinedScore =
    bestScore *
      0.7 +
    countScore *
      0.3;

  return Math.round(
    combinedScore *
      WEIGHTS.achievements
  );
};

// =====================================================
// SOCIAL LINKS
// =====================================================

const calcSocial = (
  profile
) => {
  const social =
    profile?.social || {};

  const completedLinks = [
    isNonEmptyString(
      social.github
    ),

    isNonEmptyString(
      social.linkedin
    ),

    isNonEmptyString(
      social.portfolio
    ),
  ].filter(Boolean).length;

  const ratio =
    completedLinks / 3;

  return Math.round(
    ratio *
      WEIGHTS.social
  );
};

// =====================================================
// RESUME
// =====================================================

const calcResume = (
  profile
) => {
  const resume =
    profile?.resume || {};

  const completionRatio =
    getCompletionRatio([
      isNonEmptyString(
        resume.resumeUrl
      ),

      isNonEmptyString(
        resume.resumeName
      ),
    ]);

  return Math.round(
    completionRatio *
      WEIGHTS.resume
  );
};

// =====================================================
// PROFILE SUGGESTIONS
// =====================================================

const buildSuggestions = (
  profile
) => {
  const suggestions = [];

  const social =
    profile?.social || {};

  const resume =
    profile?.resume || {};

  // BASIC INFO

  if (
    !isNonEmptyString(
      profile?.phone
    )
  ) {
    suggestions.push(
      "Add your phone number"
    );
  }

  if (
    !isNonEmptyString(
      profile?.bio
    )
  ) {
    suggestions.push(
      "Add a short professional bio"
    );
  }

  // EDUCATION

  if (
    !isNonEmptyArray(
      profile?.education
    )
  ) {
    suggestions.push(
      "Add your education details"
    );
  }

  // SKILLS

  if (
    !isNonEmptyArray(
      profile?.skills
    )
  ) {
    suggestions.push(
      "Add your technical skills"
    );
  } else if (
    profile.skills.length < 5
  ) {
    suggestions.push(
      "Add at least 5 skills for better opportunity matching"
    );
  }

  // PROJECTS

  if (
    !isNonEmptyArray(
      profile?.projects
    )
  ) {
    suggestions.push(
      "Add at least one project"
    );
  }

  // CERTIFICATIONS

  if (
    !isNonEmptyArray(
      profile?.certifications
    )
  ) {
    suggestions.push(
      "Add your certifications"
    );
  }

  // ACHIEVEMENTS

  if (
    !isNonEmptyArray(
      profile?.achievements
    )
  ) {
    suggestions.push(
      "Add achievements or accomplishments"
    );
  }

  // SOCIAL

  if (
    !isNonEmptyString(
      social.github
    )
  ) {
    suggestions.push(
      "Add your GitHub profile"
    );
  }

  if (
    !isNonEmptyString(
      social.linkedin
    )
  ) {
    suggestions.push(
      "Add your LinkedIn profile"
    );
  }

  // RESUME

  if (
    !isNonEmptyString(
      resume.resumeUrl
    )
  ) {
    suggestions.push(
      "Add your resume"
    );
  }

  return suggestions.slice(
    0,
    6
  );
};

// =====================================================
// MAIN FUNCTION
// =====================================================

const calculateProfileCompletion = (
  profile
) => {
  const safeProfile =
    profile || {};

  // ===============================================
  // SCORE BREAKDOWN
  // ===============================================

  const scoreBreakdown = {
    basicInfo:
      calcBasicInfo(
        safeProfile
      ),

    education:
      calcEducation(
        safeProfile
      ),

    skills:
      calcSkills(
        safeProfile
      ),

    projects:
      calcProjects(
        safeProfile
      ),

    certifications:
      calcCertifications(
        safeProfile
      ),

    achievements:
      calcAchievements(
        safeProfile
      ),

    social:
      calcSocial(
        safeProfile
      ),

    resume:
      calcResume(
        safeProfile
      ),
  };

  // ===============================================
  // TOTAL SCORE
  // ===============================================

  const totalScore =
    Object.values(
      scoreBreakdown
    ).reduce(
      (total, value) =>
        total + value,
      0
    );

  const completionPercentage =
    Math.min(
      100,
      Math.max(
        0,
        totalScore
      )
    );

  // ===============================================
  // SUGGESTIONS
  // ===============================================

  const suggestions =
    buildSuggestions(
      safeProfile
    );

  // ===============================================
  // PROFILE LEVEL
  // ===============================================

  let profileLevel =
    "Beginner";

  if (
    completionPercentage >= 90
  ) {
    profileLevel =
      "Excellent";
  } else if (
    completionPercentage >= 70
  ) {
    profileLevel =
      "Strong";
  } else if (
    completionPercentage >= 40
  ) {
    profileLevel =
      "Growing";
  }

  // ===============================================
  // RETURN
  // ===============================================

  return {
    completionPercentage,

    profileLevel,

    suggestions,

    scoreBreakdown,
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  calculateProfileCompletion,
  WEIGHTS,
};