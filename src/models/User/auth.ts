export enum AuthProviders {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export const providerMap = {
  [AuthProviders.LOCAL]: 'local',
  [AuthProviders.GITHUB]: 'githubId',
  [AuthProviders.GOOGLE]: 'googleId',
};

export const providerNameMap = {
  [AuthProviders.LOCAL]: 'System',
  [AuthProviders.GITHUB]: 'GitHub',
  [AuthProviders.GOOGLE]: 'Google',
};
