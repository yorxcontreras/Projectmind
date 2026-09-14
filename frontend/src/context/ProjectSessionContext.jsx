import { createContext, useContext, useState } from "react";

const ProjectSessionContext = createContext(null);

export function ProjectSessionProvider({ children }) {
  const [project, setProject] = useState(null);

  return (
    <ProjectSessionContext.Provider
      value={{
        project,
        setProject,
      }}
    >
      {children}
    </ProjectSessionContext.Provider>
  );
}

export function useProjectSession() {
  return useContext(ProjectSessionContext);
}