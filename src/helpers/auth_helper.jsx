export const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

export const getJWTToken = () => {
  const token = localStorage.getItem("token");
  if (token) return token;
  return "";
};

export const logoutUser = () => {
  localStorage.removeItem("authUser");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
