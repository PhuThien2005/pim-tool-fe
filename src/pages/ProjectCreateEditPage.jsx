import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectForm from '../components/project/ProjectForm';

export default function ProjectCreateEditPage() {
  const { projectNumber } = useParams();
  const isEdit = Boolean(projectNumber);

  return <ProjectForm isEdit={isEdit} />;
}
