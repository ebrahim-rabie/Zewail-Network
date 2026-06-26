// Zewail City schools and their undergraduate majors.
// Compiled from the official program names (zewailcity.edu.eg is JS-rendered, so
// these were gathered from the program listings). Adjust freely if a major
// belongs under a different school.
export const SCHOOL_MAJORS = {
  'School of Engineering & Applied Sciences': [
    'Communications & Information Engineering',
    'Nanotechnology & Nanoelectronics Engineering',
    'Aerospace Engineering',
    'Environmental Engineering',
    'Renewable Energy Engineering',
  ],
  'School of Sciences': [
    'Biomedical Sciences',
    'Materials Science',
    'Nanoscience',
    'Physics of Earth & Universe',
  ],
  'School of Computational Sciences & Artificial Intelligence': [
    'Computer Science',
    'Data Science & Artificial Intelligence',
    'Software Engineering',
    'Information Technology',
  ],
}

export const SCHOOLS = Object.keys(SCHOOL_MAJORS)

export function majorsForSchool(school) {
  return SCHOOL_MAJORS[school] || []
}

// Find which school a (possibly legacy/free-text) major belongs to, so the
// dropdowns can preselect sensibly when editing an existing profile.
export function schoolForMajor(major) {
  if (!major) return ''
  for (const [school, majors] of Object.entries(SCHOOL_MAJORS)) {
    if (majors.includes(major)) return school
  }
  return ''
}
