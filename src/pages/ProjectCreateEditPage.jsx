import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectForm from '../components/project/ProjectForm';

export default function ProjectCreateEditPage() {
  const { id, projectNumber } = useParams();
  const editId = id || projectNumber;
  const isEdit = Boolean(editId);

  return <ProjectForm key={editId ? `edit-${editId}` : 'new'} isEdit={isEdit} projectId={editId} />;
}
