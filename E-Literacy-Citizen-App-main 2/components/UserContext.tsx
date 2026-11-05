import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserData = {
  name: string;
  email: string;
  location: string;
  joinDate: string;
  completedCourses: number;
  currentLevel: string;
  email_verified_at?: string;
  profile_picture_url?: string | null;
};

const defaultUserData: UserData = {
  name: '',
  email: '',
  location: '',
  joinDate: '',
  completedCourses: 0,
  currentLevel: '',
};

const UserContext = createContext<{
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}>({
  userData: defaultUserData,
  setUserData: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
