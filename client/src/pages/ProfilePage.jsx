import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfile, updateProfile } from '../api/profileApi.js';

const emptyEducation = () => ({
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
  grade: '',
});

const emptyProject = () => ({
  title: '',
  description: '',
  technologies: [],
  githubUrl: '',
  liveUrl: '',
});

const emptyCertification = () => ({
  name: '',
  issuingOrganization: '',
  issueDate: '',
  credentialUrl: '',
});

const emptyAchievement = () => ({
  title: '',
  description: '',
  date: '',
});

function SectionHeader({ icon, title, actionLabel, onAction }) {
  return (
    <div className="section-header">
      <div className="section-title">
        <span className="section-icon">{icon}</span>
        <h2>{title}</h2>
      </div>

      {actionLabel && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onAction}
        >
          + {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProgressBar({ value, suggestions }) {
  return (
    <div className="completion-card">
      <div className="completion-header">
        <div>
          <h3>Profile Completion</h3>
          <p className="completion-value">{value}% complete</p>
        </div>

        <div className="completion-score">
          <div className="score-ring">{value}</div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
          }}
        />
      </div>

      {suggestions?.length > 0 && (
        <div className="suggestions">
          <h4>💡 Suggestions</h4>

          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SkillChipList({
  skills,
  onRemove,
  readOnly = false,
}) {
  if (!skills || skills.length === 0) {
    return readOnly ? (
      <p className="empty-state">
        No skills added yet.
      </p>
    ) : null;
  }

  return (
    <div className="skills-list">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="skill-chip"
        >
          {skill}

          {!readOnly && (
            <button
              type="button"
              className="chip-remove"
              onClick={() => onRemove(index)}
              aria-label={`Remove skill ${skill}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

function SkillsInput({ skills, onChange }) {
  const [text, setText] = useState('');

  const add = () => {
    const value = text.trim();

    if (!value) return;

    if (
      skills.some(
        (skill) =>
          skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setText('');
      return;
    }

    if (value.length > 50) return;

    onChange([...skills, value]);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (
      e.key === 'Backspace' &&
      !text &&
      skills.length > 0
    ) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="skills-input-wrap">
      <SkillChipList
        skills={skills}
        onRemove={(index) =>
          onChange(
            skills.filter((_, i) => i !== index)
          )
        }
      />

      <div className="skills-input-row">
        <input
          type="text"
          className="skills-input"
          placeholder="Type a skill and press Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={50}
        />

        <button
          type="button"
          className="btn-secondary"
          onClick={add}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ArrayItem({
  children,
  onRemove,
  removable = true,
  index,
}) {
  return (
    <div className="array-item">
      {removable && (
        <button
          type="button"
          className="btn-remove"
          onClick={() => onRemove(index)}
          aria-label="Remove entry"
        >
          ✕ Remove
        </button>
      )}

      {children}
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [phone, setPhone] = useState('');

  const [education, setEducation] = useState([
    emptyEducation(),
  ]);

  const [skills, setSkills] = useState([]);

  const [projects, setProjects] = useState([
    emptyProject(),
  ]);

  const [certifications, setCertifications] =
    useState([
      emptyCertification(),
    ]);

  const [achievements, setAchievements] =
    useState([
      emptyAchievement(),
    ]);

  const [social, setSocial] = useState({
    github: '',
    linkedin: '',
    portfolio: '',
  });

  const [resume, setResume] = useState({
    resumeUrl: '',
    resumeName: '',
  });

  const [completionPercentage, setCompletionPercentage] =
    useState(0);

  const [suggestions, setSuggestions] = useState([]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setServerError('');

    try {
      const data = await getProfile();
      const profile = data.profile || {};

      setPhone(profile.phone || '');

      setEducation(
        Array.isArray(profile.education) &&
          profile.education.length
          ? profile.education
          : [emptyEducation()]
      );

      setSkills(
        Array.isArray(profile.skills)
          ? profile.skills
          : []
      );

      setProjects(
        Array.isArray(profile.projects) &&
          profile.projects.length
          ? profile.projects
          : [emptyProject()]
      );

      setCertifications(
        Array.isArray(profile.certifications) &&
          profile.certifications.length
          ? profile.certifications.map(
              (certification) => ({
                ...certification,
                issueDate: certification.issueDate
                  ? certification.issueDate.slice(0, 10)
                  : '',
              })
            )
          : [emptyCertification()]
      );

      setAchievements(
        Array.isArray(profile.achievements) &&
          profile.achievements.length
          ? profile.achievements.map(
              (achievement) => ({
                ...achievement,
                date: achievement.date
                  ? achievement.date.slice(0, 10)
                  : '',
              })
            )
          : [emptyAchievement()]
      );

      setSocial({
        github: profile.social?.github || '',
        linkedin: profile.social?.linkedin || '',
        portfolio: profile.social?.portfolio || '',
      });

      setResume({
        resumeUrl: profile.resume?.resumeUrl || '',
        resumeName: profile.resume?.resumeName || '',
      });

      setCompletionPercentage(
        data.completionPercentage || 0
      );

      setSuggestions(data.suggestions || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to load profile';

      setServerError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateArray = (setter, emptyFn) => ({
    update: (index, patch) =>
      setter((previous) =>
        previous.map((item, i) =>
          i === index
            ? { ...item, ...patch }
            : item
        )
      ),

    remove: (index) =>
      setter((previous) => {
        const next = previous.filter(
          (_, i) => i !== index
        );

        return next.length > 0
          ? next
          : [emptyFn()];
      }),

    add: () =>
      setter((previous) => [
        ...previous,
        emptyFn(),
      ]),
  });

  const edu = updateArray(
    setEducation,
    emptyEducation
  );

  const proj = updateArray(
    setProjects,
    emptyProject
  );

  const cert = updateArray(
    setCertifications,
    emptyCertification
  );

  const ach = updateArray(
    setAchievements,
    emptyAchievement
  );

  const updateProjectTechs = (
    index,
    technologies
  ) => {
    setProjects((previous) =>
      previous.map((project, i) =>
        i === index
          ? {
              ...project,
              technologies,
            }
          : project
      )
    );
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setServerError('');
    setSuccessMsg('');

    const payload = {
      phone,

      education: education.filter(
        (item) =>
          item &&
          item.institution &&
          item.institution.trim()
      ),

      skills,

      projects: projects.filter(
        (item) =>
          item &&
          item.title &&
          item.title.trim()
      ),

      certifications:
        certifications.filter(
          (item) =>
            item &&
            item.name &&
            item.name.trim()
        ),

      achievements:
        achievements.filter(
          (item) =>
            item &&
            item.title &&
            item.title.trim()
        ),

      social,
      resume,
    };

    try {
      const data =
        await updateProfile(payload);

      setCompletionPercentage(
        data.completionPercentage || 0
      );

      setSuggestions(
        data.suggestions || []
      );

      setSuccessMsg(
        '✅ Profile saved successfully!'
      );

      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to save profile';

      setServerError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container auth-loading">
          <div className="spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <header className="profile-header">
          <div>
            <h1>Student Profile</h1>

            <p className="profile-subtitle">
              Build a complete profile to unlock
              better opportunities and recommendations.
            </p>
          </div>
        </header>

        {serverError && (
          <div className="alert alert-error">
            {serverError}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            {successMsg}
          </div>
        )}

        <div className="profile-grid">

          <div className="profile-main">

            {/* BASIC INFORMATION */}
            <section className="profile-section">
              <SectionHeader
                icon="👤"
                title="Basic Information"
              />

              <div className="form-grid form-grid-2">

                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="input-disabled"
                  />

                  <small className="field-hint">
                    Set during registration
                  </small>
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-disabled"
                  />

                  <small className="field-hint">
                    Set during registration
                  </small>
                </div>

                <div className="form-group form-span-2">
                  <label htmlFor="phone">
                    Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    maxLength={20}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />
                </div>

              </div>
            </section>

            {/* EDUCATION */}
            <section className="profile-section">
              <SectionHeader
                icon="🎓"
                title="Education"
                actionLabel="Add Education"
                onAction={edu.add}
              />

              <div className="array-list">
                {education.map((item, index) => (
                  <ArrayItem
                    key={index}
                    index={index}
                    onRemove={edu.remove}
                    removable={
                      education.length > 1
                    }
                  >
                    <div className="form-grid form-grid-2">

                      <div className="form-group form-span-2">
                        <label>
                          Institution *
                        </label>

                        <input
                          type="text"
                          value={item.institution}
                          maxLength={200}
                          placeholder="College name"
                          onChange={(e) =>
                            edu.update(index, {
                              institution:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Degree</label>

                        <input
                          type="text"
                          value={item.degree}
                          maxLength={100}
                          placeholder="B.Tech"
                          onChange={(e) =>
                            edu.update(index, {
                              degree:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Field of Study
                        </label>

                        <input
                          type="text"
                          value={
                            item.fieldOfStudy
                          }
                          maxLength={150}
                          placeholder="Computer Science"
                          onChange={(e) =>
                            edu.update(index, {
                              fieldOfStudy:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Start Year
                        </label>

                        <input
                          type="number"
                          min="1950"
                          max="2036"
                          value={item.startYear}
                          onChange={(e) =>
                            edu.update(index, {
                              startYear:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          End Year
                        </label>

                        <input
                          type="number"
                          min="1950"
                          max="2036"
                          value={item.endYear}
                          onChange={(e) =>
                            edu.update(index, {
                              endYear:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group form-span-2">
                        <label>Grade</label>

                        <input
                          type="text"
                          value={item.grade}
                          maxLength={50}
                          placeholder="8.5 CGPA"
                          onChange={(e) =>
                            edu.update(index, {
                              grade:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                    </div>
                  </ArrayItem>
                ))}
              </div>
            </section>

            {/* SKILLS */}
            <section className="profile-section">
              <SectionHeader
                icon="🛠️"
                title="Skills"
              />

              <SkillsInput
                skills={skills}
                onChange={setSkills}
              />

              {skills.length === 0 && (
                <p className="empty-state">
                  No skills yet. Add React, Java,
                  Python, etc.
                </p>
              )}
            </section>

            {/* PROJECTS */}
            <section className="profile-section">
              <SectionHeader
                icon="🚀"
                title="Projects"
                actionLabel="Add Project"
                onAction={proj.add}
              />

              <div className="array-list">
                {projects.map((item, index) => (
                  <ArrayItem
                    key={index}
                    index={index}
                    onRemove={proj.remove}
                    removable={
                      projects.length > 1
                    }
                  >
                    <div className="form-grid form-grid-2">

                      <div className="form-group form-span-2">
                        <label>Title *</label>

                        <input
                          type="text"
                          value={item.title}
                          maxLength={200}
                          placeholder="Project title"
                          onChange={(e) =>
                            proj.update(index, {
                              title:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group form-span-2">
                        <label>
                          Description
                        </label>

                        <textarea
                          rows={3}
                          value={
                            item.description
                          }
                          maxLength={2000}
                          onChange={(e) =>
                            proj.update(index, {
                              description:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group form-span-2">
                        <label>
                          Technologies Used
                        </label>

                        <SkillsInput
                          skills={
                            item.technologies || []
                          }
                          onChange={(next) =>
                            updateProjectTechs(
                              index,
                              next
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          GitHub URL
                        </label>

                        <input
                          type="url"
                          value={
                            item.githubUrl
                          }
                          maxLength={500}
                          onChange={(e) =>
                            proj.update(index, {
                              githubUrl:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Live URL
                        </label>

                        <input
                          type="url"
                          value={item.liveUrl}
                          maxLength={500}
                          onChange={(e) =>
                            proj.update(index, {
                              liveUrl:
                                e.target.value,
                            })
                          }
                        />
                      </div>

                    </div>
                  </ArrayItem>
                ))}
              </div>
            </section>

            {/* CERTIFICATIONS */}
            <section className="profile-section">
              <SectionHeader
                icon="🏆"
                title="Certifications"
                actionLabel="Add Certification"
                onAction={cert.add}
              />

              <div className="array-list">
                {certifications.map(
                  (item, index) => (
                    <ArrayItem
                      key={index}
                      index={index}
                      onRemove={cert.remove}
                      removable={
                        certifications.length > 1
                      }
                    >
                      <div className="form-grid form-grid-2">

                        <div className="form-group form-span-2">
                          <label>
                            Name *
                          </label>

                          <input
                            type="text"
                            value={item.name}
                            maxLength={200}
                            onChange={(e) =>
                              cert.update(index, {
                                name:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Issuing Organization
                          </label>

                          <input
                            type="text"
                            value={
                              item.issuingOrganization
                            }
                            maxLength={200}
                            onChange={(e) =>
                              cert.update(index, {
                                issuingOrganization:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Issue Date
                          </label>

                          <input
                            type="date"
                            value={
                              item.issueDate
                            }
                            onChange={(e) =>
                              cert.update(index, {
                                issueDate:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group form-span-2">
                          <label>
                            Credential URL
                          </label>

                          <input
                            type="url"
                            value={
                              item.credentialUrl
                            }
                            maxLength={500}
                            onChange={(e) =>
                              cert.update(index, {
                                credentialUrl:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                      </div>
                    </ArrayItem>
                  )
                )}
              </div>
            </section>

            {/* ACHIEVEMENTS */}
            <section className="profile-section">
              <SectionHeader
                icon="🏅"
                title="Achievements"
                actionLabel="Add Achievement"
                onAction={ach.add}
              />

              <div className="array-list">
                {achievements.map(
                  (item, index) => (
                    <ArrayItem
                      key={index}
                      index={index}
                      onRemove={ach.remove}
                      removable={
                        achievements.length > 1
                      }
                    >
                      <div className="form-grid form-grid-2">

                        <div className="form-group form-span-2">
                          <label>
                            Title *
                          </label>

                          <input
                            type="text"
                            value={item.title}
                            maxLength={200}
                            onChange={(e) =>
                              ach.update(index, {
                                title:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group form-span-2">
                          <label>
                            Description
                          </label>

                          <textarea
                            rows={2}
                            value={
                              item.description
                            }
                            maxLength={1000}
                            onChange={(e) =>
                              ach.update(index, {
                                description:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Date</label>

                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                              ach.update(index, {
                                date:
                                  e.target.value,
                              })
                            }
                          />
                        </div>

                      </div>
                    </ArrayItem>
                  )
                )}
              </div>
            </section>

            {/* SOCIAL */}
            <section className="profile-section">
              <SectionHeader
                icon="🔗"
                title="Social Links"
              />

              <div className="form-grid form-grid-2">

                <div className="form-group">
                  <label>GitHub</label>

                  <input
                    type="url"
                    value={social.github}
                    maxLength={500}
                    onChange={(e) =>
                      setSocial({
                        ...social,
                        github:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>LinkedIn</label>

                  <input
                    type="url"
                    value={social.linkedin}
                    maxLength={500}
                    onChange={(e) =>
                      setSocial({
                        ...social,
                        linkedin:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group form-span-2">
                  <label>Portfolio</label>

                  <input
                    type="url"
                    value={social.portfolio}
                    maxLength={500}
                    onChange={(e) =>
                      setSocial({
                        ...social,
                        portfolio:
                          e.target.value,
                      })
                    }
                  />
                </div>

              </div>
            </section>

            {/* RESUME */}
            <section className="profile-section">
              <SectionHeader
                icon="📄"
                title="Resume"
              />

              <div className="form-grid form-grid-2">

                <div className="form-group form-span-2">
                  <label>
                    Resume URL
                  </label>

                  <input
                    type="url"
                    value={resume.resumeUrl}
                    maxLength={500}
                    placeholder="https://..."
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        resumeUrl:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group form-span-2">
                  <label>
                    Resume Name
                  </label>

                  <input
                    type="text"
                    value={resume.resumeName}
                    maxLength={200}
                    placeholder="My_Resume.pdf"
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        resumeName:
                          e.target.value,
                      })
                    }
                  />
                </div>

              </div>
            </section>

          </div>

          <aside className="profile-side">
            <ProgressBar
              value={completionPercentage}
              suggestions={suggestions}
            />
          </aside>

        </div>
      </div>

      <div className="save-bar">
        <div className="save-bar-inner">

          <small className="save-bar-hint">
            Changes are saved to the database when
            you click Save.
          </small>

          <button
            type="button"
            className="btn-primary btn-save"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <span className="spinner spinner-sm spinner-inline" />
                {' '}Saving...
              </>
            ) : (
              '💾 Save Profile'
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;